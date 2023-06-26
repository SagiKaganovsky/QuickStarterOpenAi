
import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";
const app = initializeApp({ databaseURL: process.env.FIREBASE_API_URL });
const database = getDatabase(app);

const conversationDb = ref(database);

export default conversationDb;