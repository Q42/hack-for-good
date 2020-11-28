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

interface RequestBody {
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

    const body = request.body as RequestBody;

    const casesRef = await db.collection("cases").get();
    const cases = casesRef.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Case)
    );

    const relevantCases = cases.filter((x) =>
      x.sensors.includes(body.sensorId)
    );

    // Notify all case subscribers if necessary
    if (body.shouldNotify) {
      const subscribers = new Set(relevantCases.flatMap((x) => x.subscribers));
      await alertSubscribers(subscribers, JSON.stringify(body));
    }

    console.log({ relevantCases });

    // Insert an unseen measurement to be reviewed by a case manager
    relevantCases.forEach(
      async (c) => await addUnseenMeasurement(c.id, body.current_situation)
    );

    response.send("OK!");
  }
);

async function addUnseenMeasurement(
  caseId: string,
  currentSituation: CurrentSituation
) {
  console.log("Adding to", caseId);

  await db.collection(`cases/${caseId}/unseen_measurements`).add({
    timestamp: new Date(),
    ...currentSituation,
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
