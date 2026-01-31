import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { method, query } = request;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const clientPassword = request.headers['x-admin-password'] || query.password;

    // --- PUBLIC READ (For website rendering) ---
    // Allow reading specific data without password if type=public
    if (method === 'GET' && query.type === 'public') {
        try {
            const [worksResult, mixResult, origResult, pricesResult, newsResult, voicesResult] = await Promise.all([
                kv.get('portfolio_works'),
                kv.get('portfolio_mix'),
                kv.get('portfolio_orig'),
                kv.get('site_prices'),
                kv.get('site_news'),
                kv.get('site_voices')
            ]);

            const works = worksResult || [];
            const mix = mixResult || [];
            const orig = origResult || [];
            const prices = pricesResult || {};
            const news = newsResult || { text: '', visible: false };
            const voices = voicesResult || [];

            return response.status(200).json({
                works, mix, orig, prices, news, voices
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

            const [ordersResult, worksResult, mixResult, origResult, pricesResult, newsResult, voicesResult, archiveResult] = await Promise.all([
                kv.lrange('orders', skip, skip + limit - 1),
                kv.get('portfolio_works'),
                kv.get('portfolio_mix'),
                kv.get('portfolio_orig'),
                kv.get('site_prices'),
                kv.get('site_news'),
                kv.get('site_voices'),
                kv.lrange('archive', 0, -1)
            ]);

            const orders = ordersResult || [];
            const works = worksResult || [];
            const mix = mixResult || [];
            const orig = origResult || [];
            const prices = pricesResult || {};
            const news = newsResult || { text: '', visible: false };
            const voices = voicesResult || [];
            const archive = archiveResult || [];

            return response.status(200).json({
                orders, works, mix, orig, prices, news, voices, archive
            });

        } else if (method === 'POST') {
            const { action, data } = request.body;

            /* ... (omitted comments) ... */

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

            if (action === 'update_voices') {
                await kv.set('site_voices', data);
                return response.status(200).json({ success: true });
            }

            // Order Management (Simulated with simple list manipulation for now, assuming high concurrency is not an issue)
            if (action === 'update_order_status') {
                // In a real DB, you'd update specific ID. Here we might need to fetch all, update, save.
                // Assuming client sends { id: index, status: '...' }
                // Warning: Concurrency issues with this simple KV approach.
                // But following existing pattern:
                const { index, status } = data;
                const orders = await kv.lrange('orders', 0, -1);
                if (orders && orders[index]) {
                    orders[index].status = status;
                    await kv.lset('orders', index, orders[index]);
                }
                return response.status(200).json({ success: true });
            }

            if (action === 'archive_order') {
                const { index } = data;
                const orders = await kv.lrange('orders', 0, -1);
                const item = orders[index];
                if (item) {
                    item.status = 'archived'; // Mark as archived
                    // Ideally move to separate list to keep main list clean
                    await kv.lpush('archive', item);
                    // Remove from main list? KV doesn't support remove at index easily without value match.
                    // For now, simpler to mark 'archived' in place or use LREM. 
                    // Let's implement move logic: Add to archive, remove from orders.
                    // However, removing by value is risky if duplicates. 
                    // Using placeholders is safer: await kv.lset('orders', index, {DELETED:true}); then cleanup?
                    // Let's stick to simplest: Mark status 'archived' in main list for now? 
                    // User requested "Archive List". 
                    // Let's try: Remove from 'orders', Add to 'archive'.
                    // To remove at index in KV (Redis) is hard. 
                    // STRATEGY: We will fetch all, splice in JS, replace all. (Slow but safe for small scale)
                    // Or keep status='archived' and filter in frontend? 
                    // User said: "Show cancelled only when Archive buttons is pressed".
                    // Let's go with: Move to 'archive' key.
                    // FETCH ALL approach (safest for index-based ops):
                    const all = await kv.lrange('orders', 0, -1);
                    const target = all.splice(index, 1)[0];
                    if (target) {
                        await kv.del('orders');
                        if (all.length > 0) await kv.rpush('orders', ...all);
                        await kv.lpush('archive', target);
                    }
                }
                return response.status(200).json({ success: true });
            }

            if (action === 'restore_order') {
                const { index } = data;
                const allArchived = await kv.lrange('archive', 0, -1);
                const target = allArchived.splice(index, 1)[0];
                if (target) {
                    target.status = '未着手'; // Reset status
                    // Remove from archive:
                    await kv.del('archive');
                    if (allArchived.length > 0) await kv.rpush('archive', ...allArchived);
                    // Add back to orders
                    await kv.lpush('orders', target);
                }
                return response.status(200).json({ success: true });
            }

            if (action === 'update_voices') {
                await kv.set('site_voices', data);
                return response.status(200).json({ success: true });
            }

            if (action === 'update_order_status') {
                const allOrders = await kv.lrange('orders', 0, -1);
                const index = allOrders.findIndex(o => o.id === data.orderId);

                if (index !== -1) {
                    // Start with existing
                    const updates = data.updates || {};
                    const updatedOrder = { ...allOrders[index], ...updates };

                    // Specific direct fields support (if not nested in updates)
                    if (data.status) updatedOrder.status = data.status;
                    if (data.deadline) updatedOrder.deadline = data.deadline;

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
