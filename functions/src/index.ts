import * as functions from "firebase-functions";
import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

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

    let body: RequestBody = JSON.parse(request.body);

    await db.collection("anomalies").add(body);

    response.send("OK!");
  }
);
