import * as functions from "firebase-functions";
import TwilioClient from "twilio";
import admin from "firebase-admin";

const db = admin.firestore();

const { account_sid, auth_token } = functions.config().twilio;
const client = TwilioClient(account_sid, auth_token);

interface AnomalyData {
  type: string;
  formula: string;
  diff: number;
  timestamp: string;
}

interface AnomalyEvent {
  source: string;
  sensorId: string;
  shouldNotify: boolean;
  anomaly: AnomalyData;
}

interface Case {
  id: string;
  name: string;
  sensors: string[];
  subscribers: string[];
}

export const postEvent = functions.https.onRequest(
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(400).send("Please send a POST request");
      return;
    }

    const body = request.body as AnomalyEvent;

    const casesRef = await db.collection("cases").get();
    const cases = casesRef.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Case)
    );

    const relevantCases = cases.filter((x) =>
      x.sensors.includes(body.sensorId)
    );

    if (body.shouldNotify) {
      // Notify all case subscribers if necessary
      const subscribers = new Set(relevantCases.flatMap((x) => x.subscribers));
      await alertSubscribers(subscribers, JSON.stringify(body));

      // Insert an unseen measurement to be reviewed by a case manager
      relevantCases.forEach(
        async (c) => await addUnseenMeasurement(c.id, body)
      );
    }

    response.send("OK!");
  }
);

async function addUnseenMeasurement(caseId: string, anomalyEvent: AnomalyEvent) {
  const { sensorId, anomaly } = anomalyEvent;

  await db.collection(`cases/${caseId}/unseen_measurements`).add({
    sensorId,
    ...anomaly,
    timestamp: admin.firestore.Timestamp.fromDate(new Date(anomaly.timestamp)),
  });
}

async function alertSubscribers(subscribers: Set<string>, message: string) {
  subscribers.forEach(async (subscriber) => {
    console.log("Sending message to", subscriber);

    await client.messages.create({
      body: `You received an event: ${message}}`,
      from: "+12058983913",
      to: subscriber,
    });
  });
}
