'use server';

import { prisma } from '@/lib/prisma';

export async function submitOrder(prevState: any, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const category = formData.get('category') as string;
    const url = formData.get('url') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !category || !message) {
      return { success: false, error: '必須項目が入力されていません。' };
    }

    // 1. Save to Database (管理画面用)
    const order = await prisma.order.create({
      data: {
        name,
        email,
        category,
        url,
        message,
        status: 'pending'
      }
    });

    // 2. Send Discord Webhook Notification
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const categoryMap: Record<string, string> = {
        'mix': '🎙️ ボーカルMIX',
        'original': '🎹 オリジナル楽曲',
        'other': '📩 その他'
      };

      const discordMessage = {
        embeds: [
          {
            title: '🎉 新しいご依頼・お問い合わせが届きました！',
            color: 3447003, // Blue
            fields: [
              { name: 'お名前', value: name, inline: true },
              { name: 'カテゴリ', value: categoryMap[category] || category, inline: true },
              { name: 'メールアドレス', value: email, inline: false },
              { name: '参考URL', value: url || 'なし', inline: false },
              { name: 'メッセージ', value: message.length > 1000 ? message.substring(0, 1000) + '...' : message, inline: false },
            ],
            footer: {
              text: `Order ID: ${order.id} | Sien-Official System`
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage)
      }).catch(err => console.error('Discord Webhook Error:', err));
    }

    await prisma.$disconnect();

    return { success: true };
  } catch (error) {
    console.error('Submit Error:', error);
    return { success: false, error: 'サーバーエラーが発生しました。時間をおいて再度お試しください。' };
  }
}
