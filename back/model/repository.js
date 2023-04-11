// Import the functions you need from the SDKs you need
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebase_config_key from "../firebase-config.json" assert { type: "json" };


import 'dotenv/config';

const serviceAccount = firebase_config_key;

initializeApp({
    credential: cert(serviceAccount)
});
  
const db = getFirestore();

// Sample add and get user

export async function addUser(username, password, email, walletAddress) {
    await db.collection('users').doc(walletAddress).set({
        email: email,
        username: username,
        password: password
    });
}

export async function getUser(walletAddress) {
    const userRef = db.collection('users').doc(walletAddress);
    const doc = await userRef.get();
    return doc._fieldsProto;
}