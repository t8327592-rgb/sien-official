import { kv } from '@vercel/kv';
import nodemailer from 'nodemailer';

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const formData = request.body;

        // 1. Save to KV (Append to list of orders)
        const orderId = Date.now().toString();
        const orderData = {
            id: orderId,
            date: new Date().toISOString(),
            status: '未着手', // Initial status
            ...formData
        };

        // Push to the head of the list
        await kv.lpush('orders', orderData);

        // 2. Send Email
        // Only send if environment variables are set
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            // Admin Notification
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: 'px.sien@gmail.com',
                subject: `【新規依頼】${formData['ご依頼者名']}様より`,
                text: `
ご依頼者名：${formData['ご依頼者名']}

メールアドレス：${formData['メールアドレス']}

TwitterID(任意)：${formData['TwitterID(任意)']}

希望する連絡手段：${formData['希望する連絡手段']}

曲名：${formData['曲名']}

ご依頼内容：Mix＆Mastering

プラン：${formData['プラン']}

レコーディング済み音源：${formData['レコーディング済み音源'] || 'なし'}

キー変更：${formData['キー変更']}

参考URL(任意)：${formData['参考URL(任意)'] || 'なし'}

イメージ
${formData['ご要望・ご質問・特記事項など'] || 'なし'}
                `
            };

            await transporter.sendMail(mailOptions);
        }

        return response.status(200).json({ success: true, message: 'Order received', orderId });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
