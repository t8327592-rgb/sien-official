import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { method, query } = request;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const clientPassword = request.headers['x-admin-password'] || query.password;

    // --- PUBLIC READ (For website rendering) ---
    // Allow reading specific data without password if type=public
    if (method === 'GET' && query.type === 'public') {
        try {
            const [works, mix, orig, prices, news] = await Promise.all([
                kv.get('portfolio_works') || [],
                kv.get('portfolio_mix') || [],
                kv.get('portfolio_orig') || [],
                kv.get('site_prices') || {},
                kv.get('site_news') || { text: '', visible: false }
            ]);

            return response.status(200).json({
                works, mix, orig, prices, news
            });
        } catch (e) {
            return response.status(500).json({ error: 'DB Error' });
        }
    }


    // --- ADMIN AUTH CHECK ---
    if (!adminPassword || clientPassword !== adminPassword) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    // --- ADMIN OPERATIONS ---
    try {
        if (method === 'GET') {
            // Get ALL data including orders
            const limit = parseInt(query.limit) || 50;
            const skip = parseInt(query.skip) || 0;

            const [orders, works, mix, orig, prices, news] = await Promise.all([
                kv.lrange('orders', skip, skip + limit - 1),
                kv.get('portfolio_works') || [],
                kv.get('portfolio_mix') || [],
                kv.get('portfolio_orig') || [],
                kv.get('site_prices') || {},
                kv.get('site_news') || { text: '', visible: false }
            ]);

            return response.status(200).json({
                orders, works, mix, orig, prices, news
            });

        } else if (method === 'POST') {
            const { action, data } = request.body;

            /* Actions:
               - update_portfolio: { category: 'works', items: [] }
               - update_prices: { ... }
               - update_news: { ... }
               - update_order_status: { orderId: '...', status: '...', paymentLink: '...' }
            */

            if (action === 'update_portfolio') {
                // Sanitize: ensure only IDs are stored
                const cleanItems = (data.items || []).map(item => {
                    let cleanId = item.id.trim();
                    // Regex for YouTube ID extraction
                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                    const match = cleanId.match(regExp);
                    if (match && match[2].length === 11) {
                        cleanId = match[2];
                    }
                    return { ...item, id: cleanId };
                });
                await kv.set(`portfolio_${data.category}`, cleanItems);
                return response.status(200).json({ success: true });
            }

            if (action === 'update_prices') {
                await kv.set('site_prices', data);
                return response.status(200).json({ success: true });
            }

            if (action === 'update_news') {
                await kv.set('site_news', data);
                return response.status(200).json({ success: true });
            }

            if (action === 'update_order_status') {
                // Updating an item in a list in Redis is tricky (need to find index).
                // For simplicity in this KV setup, we'll read all, update, write all.
                // NOTE: In high concurrency this is bad, but for a single admin it's fine.

                const allOrders = await kv.lrange('orders', 0, -1);
                const index = allOrders.findIndex(o => o.id === data.orderId);

                if (index !== -1) {
                    const updatedOrder = { ...allOrders[index], ...data.updates };
                    await kv.lset('orders', index, updatedOrder);
                    return response.status(200).json({ success: true });
                } else {
                    return response.status(404).json({ error: 'Order not found' });
                }
            }

            return response.status(400).json({ error: 'Unknown action' });
        } else {
            return response.status(405).json({ error: 'Method Not Allowed' });
        }

    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Server Error' });
    }
}
