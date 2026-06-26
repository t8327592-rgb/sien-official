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
            // MAPPING
            const LABEL_MAP = {
                'bank_transfer': '銀行振込',
                'credit_card': 'クレジットカード',
                'twitter_dm': 'Twitter DM',
                'email': 'メール',
                'standard': 'スタンダードプラン',
                'one_chorus': 'ワンコーラスプラン',
                'short': 'ショート動画用MIX',
                'speed': '短納期プラン',
                'super_speed': '最短納期プラン',
                'superspeed': '最短納期プラン',
                'collab': 'コラボ・合唱プラン',
                'original_std': '完パケプラン',
                'orig_std': '完パケプラン',
                'original_lyrics': '作詞持ち込みプラン',
                'orig_lyric': '作詞持ち込みプラン',
                'other': 'その他・ご相談',
                '0': '原キー (±0)'
            };

            // Dynamic Text Generation
            let emailBody = `【新規依頼】${formData['ご依頼者名']}様より\n\n`;

            // Order of important fields
            const priorityKeys = ['ご依頼者名', 'メールアドレス', 'TwitterID(任意)', 'プラン', 'お支払い方法'];

            // 1. Priority Fields
            priorityKeys.forEach(key => {
                let val = formData[key] || '（未入力）';
                if (LABEL_MAP[val]) val = LABEL_MAP[val];
                emailBody += `■ ${key}\n${val}\n\n`;
            });

            // 2. Other Fields
            Object.keys(formData).forEach(key => {
                if (priorityKeys.includes(key) || key === 'form-name') return;
                let val = formData[key] || '（未入力）';
                if (LABEL_MAP[val]) val = LABEL_MAP[val];
                emailBody += `■ ${key}\n${val}\n\n`;
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: 'px.sien@gmail.com',
                subject: `【新規依頼】${formData['ご依頼者名']}様より`,
                text: emailBody
            };

            await transporter.sendMail(mailOptions);
        }

        return response.status(200).json({ success: true, message: 'Order received', orderId });

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Internal Server Error' });
    }
}
