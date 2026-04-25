
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runBroadcast() {
  const article = {
    title: "Pazaryeri Satıcıları İçin Kâr Rehberi: Trendyol, Hepsiburada ve Amazon’da Zarar Etmekten Nasıl Kurtulursunuz?",
    excerpt: "E-ticarette 'kaça satmalıyım?' sorusuna profesyonel bir cevap. 2026 kâr marjı yönetimi, komisyon ve kargo baremleri rehberi.",
    url: "https://www.karlisin.com/blog?id=17"
  };

  console.log("Aboneler çekiliyor...");
  const querySnapshot = await getDocs(collection(db, "newsletter_subscribers"));
  const subscribers = querySnapshot.docs.map(doc => doc.data().email).filter(email => !!email);

  if (subscribers.length === 0) {
    console.log("Abone bulunamadı.");
    return;
  }

  console.log(`${subscribers.length} aboneye mail gönderiliyor...`);

  // Localhost üzerindeki API'ye istek at (Server ayakta olmalı)
  try {
    const response = await fetch('http://localhost:3000/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscribers,
        articleTitle: article.title,
        articleExcerpt: article.excerpt,
        articleUrl: article.url
      })
    });
    
    const result = await response.json();
    console.log("Bitti!", result);
  } catch (err) {
    console.error("Hata:", err);
  }
}

runBroadcast();
