// Import the functions you need from the SDKs you need
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import 'dotenv/config';

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG2);

initializeApp({
    credential: cert(serviceAccount)
});
  
const db = getFirestore();
