import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  console.log('Test başlatılıyor...');
  console.log('API Key:', process.env.RESEND_API_KEY ? 'Tanımlı' : 'EKSİK');
  console.log('Gönderen:', process.env.RESEND_FROM_EMAIL);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: ['ahmtcnsz@gmail.com'],
      subject: 'Karlısın - Manuel Test',
      html: '<p>Bu manuel bir sunucu testidir.</p>'
    });

    if (error) {
      console.error('Hata:', error);
    } else {
      console.log('Başarılı! ID:', data?.id);
    }
  } catch (err) {
    console.error('Kritik Hata:', err);
  }
}

testEmail();
