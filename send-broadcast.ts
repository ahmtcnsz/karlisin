
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runBroadcast() {
  const articlesToSend = [
    {
      id: 18,
      title: "Temettü Verimi Nedir ve Neden Önemlidir?",
      excerpt: "Bir şirketin ne kadar temettü dağıttığı kadar, bu temettünün hisse fiyatına oranının ne olduğu da yatırımcılar için kritik bir metrik olan temettü verimini oluşturur.",
      url: "https://www.karlisin.com/blog?id=18"
    },
    {
      id: 19,
      title: "Temettü Nedir? Borsada Temettü Dağıtımı ve Pasif Gelir Rehberi",
      excerpt: "Borsada yatırım yaparken sadece hisse senedinin fiyat artışından değil, aynı zamanda şirketin elde ettiği karlardan pay alabileceğinizi biliyor muydunuz?",
      url: "https://www.karlisin.com/blog?id=19"
    }
  ];

  console.log("Aboneler çekiliyor...");
  const querySnapshot = await getDocs(collection(db, "newsletter_subscribers"));
  const subscribers = querySnapshot.docs.map(doc => doc.data().email).filter(email => !!email);

  if (subscribers.length === 0) {
    console.log("Abone bulunamadı.");
    return;
  }

  console.log(`${subscribers.length} aboneye ${articlesToSend.length} yazı için mail gönderiliyor...`);

  for (const article of articlesToSend) {
    console.log(`Gönderiliyor: ${article.title}`);
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
      console.log(`Bitti (${article.id})!`, result);
    } catch (err) {
      console.error(`Hata (${article.id}):`, err);
    }
  }
}

runBroadcast();
