import * as functions from "firebase-functions";
import admin from "firebase-admin";
import TwilioClient from "twilio";

admin.initializeApp();
const db = admin.firestore();

const { account_sid, auth_token } = functions.config().twilio;
const client = TwilioClient(account_sid, auth_token);

interface RequestBody {
  source: string;
  sensorId: string;
}

interface Case {
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
    const cases = casesRef.docs.map((doc) => doc.data() as Case);

    const relevantCases = cases.filter((x) =>
      x.sensors.includes(body.sensorId)
    );

    const subscribers = new Set(relevantCases.flatMap((x) => x.subscribers));

    // await db.collection("anomalies").add(body);

    subscribers.forEach(async (subscriber) => {
      console.log("Sending message to", subscriber);

      await client.messages.create({
        body: `You received an event: ${JSON.stringify(body)}`,
        from: "+12058983913",
        to: subscriber,
      });
    });

    response.send("OK!");
  }
);
