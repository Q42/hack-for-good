import * as functions from "firebase-functions";
import { Storage, GetSignedUrlConfig } from "@google-cloud/storage";
import { v4 } from "uuid";

const storage = new Storage();

const BUCKET_NAME = "casebuilder-uploads";

async function generateV4ReadSignedUrl(uuid: string) {
  // These options will allow temporary write access to the file
  const options: GetSignedUrlConfig = {
    version: "v4",
    action: "write",
    contentType: "image/png",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  // Get a v4 signed URL for writing the file
  const [url] = await storage
    .bucket(BUCKET_NAME)
    .file(uuid)
    .getSignedUrl(options);

  return url;
}

export const uploadImage = functions.https.onRequest(
  async (request, response) => {
    const filename = v4();
    const uploadUrl = await generateV4ReadSignedUrl(filename);
    const fileUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;

    response
      .set({ "Access-Control-Allow-Origin": "*" })
      .send({ uploadUrl, filename, fileUrl });
  }
);
