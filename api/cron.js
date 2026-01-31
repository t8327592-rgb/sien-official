
import { kv } from '@vercel/kv';
import nodemailer from 'nodemailer';

export default async function handler(request, response) {
    // 1. Auth Check (Simple shared secret or Vercel Cron header)
    // For now, checking a query param ?key=... or Header
    const authKey = request.headers.authorization || request.query.key;
    if (authKey !== process.env.CRON_SECRET) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 2. Get Active Orders
        const orders = await kv.lrange('orders', 0, -1);
        const activeOrders = orders.filter(o =>
            o.status !== 'キャンセル' &&
            o.status !== '取引終了' &&
            o.status !== '納品済み' &&
            o.deadline // Must have deadline
        );

        let sentCount = 0;
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Nodemailer Setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        for (const order of activeOrders) {
            const deadline = new Date(order.deadline);
            // Check if deadline is valid
            if (isNaN(deadline.getTime())) continue;

            const timeDiff = deadline - now;
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            // Alert Condition: Less than 24h away AND alert not sent
            // To prevent multiple sends, we need to mark the order.
            // Using 'alertSent' flag.

            // Check if within 24 hours (and positive, i.e., not passed long ago)
            if (hoursDiff <= 24 && hoursDiff > -48 && !order.alertSent) {

                // Send Email
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: 'px.sien@gmail.com',
                    subject: '【納期アラート】納期が近づいています',
                    text: `
以下のご依頼に関する納期アラートが発動しました。
納品予定日まであと【1日】です。

--------------------------
納品予定日：${order.deadline}
ご依頼者名：${order['ご依頼者名']}
曲名：${order['曲名']}
プラン：${order['プラン']}
--------------------------
                    `
                };

                await transporter.sendMail(mailOptions);

                // Mark as sent
                order.alertSent = true;

                // Save back to KV (Find index again to be safe)
                const index = orders.findIndex(o => o.id === order.id);
                if (index !== -1) {
                    await kv.lset('orders', index, order);
                }
                sentCount++;
            }
        }

        return response.status(200).json({ success: true, checked: activeOrders.length, sent: sentCount });

    } catch (e) {
        console.error(e);
        return response.status(500).json({ error: e.message });
    }
}
