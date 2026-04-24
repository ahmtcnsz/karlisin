
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import * as dotenv from 'dotenv';

dotenv.config();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSubscribers() {
  console.log("Checking subscribers...");
  try {
    const querySnapshot = await getDocs(collection(db, "newsletter_subscribers"));
    console.log(`Found ${querySnapshot.size} subscribers.`);
    querySnapshot.forEach(doc => {
      console.log(`- ${doc.data().email}`);
    });
  } catch (err) {
    console.error("Error fetching subscribers:", err);
  }
}

checkSubscribers();
