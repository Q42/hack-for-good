import * as functions from "firebase-functions";
import TwilioClient from "twilio";
import admin from "firebase-admin";

const db = admin.firestore();

const { account_sid, auth_token } = functions.config().twilio;
const client = TwilioClient(account_sid, auth_token);

interface CurrentSituation {
  metric: string;
  value: number;
  level: string;
}

interface SensorEvent {
  source: string;
  sensorId: string;
  shouldNotify: boolean;
  current_situation: CurrentSituation;
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

    const body = request.body as SensorEvent;

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

async function addUnseenMeasurement(caseId: string, sensorEvent: SensorEvent) {
  const { sensorId, current_situation } = sensorEvent;

  await db.collection(`cases/${caseId}/unseen_measurements`).add({
    timestamp: Date.now(),
    sensorId,
    ...current_situation,
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
