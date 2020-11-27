import * as functions from "firebase-functions";
import admin from "firebase-admin";
import TwilioClient from "twilio";

admin.initializeApp();
const db = admin.firestore();

const { account_sid, auth_token } = functions.config().twilio;
const client = TwilioClient(account_sid, auth_token);

interface RequestBody {
  foo: String;
  bar: String;
}

export const postEvent = functions.https.onRequest(
  async (request, response) => {
    // Check for POST request
    if (request.method !== "POST") {
      response.status(400).send("Please send a POST request");
      return;
    }

    const body: RequestBody = JSON.parse(request.body);

    await db.collection("anomalies").add(body);
    await client.messages.create({
      body: `You received an event: ${JSON.stringify(body)}`,
      from: "+12058983913",
      to: "+31654237212",
    });

    response.send("OK!");
  }
);
