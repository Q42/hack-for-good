import admin from "firebase-admin";

admin.initializeApp();

import { postEvent } from "./postEvent";
import { uploadImage } from "./uploadImage";

export { postEvent, uploadImage };
