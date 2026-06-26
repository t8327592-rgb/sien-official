import { kv } from '@vercel/kv';

export default async function handler(request, response) {
    const { method, query } = request;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const clientPassword = request.headers['x-admin-password'] || query.password;

    // --- PUBLIC READ (For website rendering) ---
    // Allow reading specific data without password if type=public
    if (method === 'GET' && query.type === 'public') {
        try {
            const [worksResult, mixResult, origResult, pricesResult, newsResult, voicesResult, statusResult, noticesResult, newsListResult] = await Promise.all([
                kv.get('portfolio_works'),
                kv.get('portfolio_mix'),
                kv.get('portfolio_orig'),
                kv.get('site_prices'),
                kv.get('site_news'),
                kv.get('site_voices'),
                kv.get('site_status'),
                kv.get('site_notices'),
                kv.get('site_news_list')
            ]);

            const works = worksResult || [];
            const mix = mixResult || [];
            const orig = origResult || [];
            const prices = pricesResult || {};
            const news = newsResult || { text: '', visible: false };
            const voices = voicesResult || [];
            const newsList = newsListResult || [];
            // Default Status logic if missing
            const status = statusResult || { text: '現在ご依頼受付中です', isOpen: true }; // logic handled by frontend mostly
            // Default Notice logic if missing
            const notices = noticesResult || [
                {
                    title: '【重要】一部楽曲のオプション料金について',
                    content: '現在、大変ご好評をいただいております【Giga & TeddyLoid】【こっちのけんと】の楽曲をはじめ、制作に多くの工程と時間を要する楽曲につきましては、誠に恐縮ながらオプション料金（3,000円～10,000円）を頂戴しております。\n\n料金は録音音源の状態やトラック数により変動いたします。\nご依頼の際は、何卒ご理解賜りますようお願いいたします。\n\nその他、ご不明な点がございましたら、お気軽にお問い合わせください。',
                    visible: true,
                    id: 'default_notice_1'
                }
            ];

            response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('Expires', '0');
            return response.status(200).json({
                works, mix, orig, prices, news, voices, status, notices, newsList
            });
        } catch (e) {
            return response.status(500).json({ error: 'DB Error' });
        }
    }


    // --- ADMIN AUTH CHECK ---
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

            const [ordersResult, worksResult, mixResult, origResult, pricesResult, newsResult, voicesResult, archiveResult, statusResult, noticesResult, newsListResult] = await Promise.all([
                kv.lrange('orders', skip, skip + limit - 1),
                kv.get('portfolio_works'),
                kv.get('portfolio_mix'),
                kv.get('portfolio_orig'),
                kv.get('site_prices'),
                kv.get('site_news'),
                kv.get('site_voices'),
                kv.lrange('archive', 0, -1),
                kv.get('site_status'),
                kv.get('site_notices'),
                kv.get('site_news_list')
            ]);

            const orders = ordersResult || [];
            const works = worksResult || [];
            const mix = mixResult || [];
            const orig = origResult || [];
            const prices = pricesResult || {};
            const news = newsResult || { text: '', visible: false };
            const voices = voicesResult || [];
            const archive = archiveResult || [];
            const status = statusResult || { text: '現在ご依頼受付中です', isOpen: true };
            const notices = noticesResult || [];
            const newsList = newsListResult || [];

            response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            response.setHeader('Pragma', 'no-cache');
            response.setHeader('Expires', '0');
            return response.status(200).json({
                orders, works, mix, orig, prices, news, voices, archive, status, notices, newsList
            });

        } else if (method === 'POST') {
            const { action, data } = request.body;

            if (action === 'delete_all_csv') {
                const allOrders = await kv.lrange('orders', 0, -1);
                const keptOrders = allOrders.filter(o => !o.id || !o.id.toString().startsWith('csv_'));
                const deletedCount = allOrders.length - keptOrders.length;
                await kv.del('orders');
                if (keptOrders.length > 0) await kv.rpush('orders', ...keptOrders);
                return response.status(200).json({ success: true, count: deletedCount });
            }

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

            if (action === 'update_news_list') {
                await kv.set('site_news_list', data);
                return response.status(200).json({ success: true });
            }

            if (action === 'update_voices') {
                await kv.set('site_voices', data);
                return response.status(200).json({ success: true });
            }

            if (action === 'update_status') {
                await kv.set('site_status', data);
                return response.status(200).json({ success: true });
            }

            if (action === 'update_notices') {
                await kv.set('site_notices', data);
                return response.status(200).json({ success: true });
            }

            // Order Management (Simulated with simple list manipulation for now, assuming high concurrency is not an issue)
            // (Legacy update_order_status removed)

            if (action === 'archive_order') {
                // The provided HTML snippet cannot be directly inserted into this JavaScript file.
                // This file is a Next.js API route, which typically returns JSON data, not HTML.
                // If you intended to modify a UI component (e.g., a React/Next.js component),
                // please provide that file instead.
                // For now, the HTML snippet is commented out to maintain syntactical correctness.
                /*
                <div class="admin-header" style="margin-bottom: 30px;">
                    <h1 style="font-size: 2rem; color: #1e293b; font-weight: 700;">依頼管理</h1>
                </div>
                */
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

                    // Specific direct fields support
                    if (data.status) updatedOrder.status = data.status;
                    if (data.deadline) updatedOrder.deadline = data.deadline;

                    // CHECK FOR AUTO-ARCHIVAL
                    if (updatedOrder.status === '取引終了') {
                        // Remove from 'orders'
                        // Since we have the index, we can use lrem logic, but KV lrem removes by value which might be risky if duplicates exist (unlikely with IDs).
                        // Safer to rewrite the list without this item, or since we have high concurrency not guaranteed, let's just use the filtered list approach for safety.
                        const newOrders = allOrders.filter(o => o.id !== data.orderId);

                        // Transaction: 
                        // 1. Update orders list (remove)
                        // 2. Add to archive list

                        await kv.del('orders');
                        if (newOrders.length > 0) await kv.rpush('orders', ...newOrders);

                        await kv.lpush('archive', updatedOrder);

                        return response.status(200).json({ success: true, message: 'Moved to archive' });
                    } else {
                        // Normal Update
                        await kv.lset('orders', index, updatedOrder);
                        return response.status(200).json({ success: true });
                    }
                } else {
                    return response.status(404).json({ error: 'Order not found' });
                }
            }

            if (action === 'import_orders') {
                const newOrders = data.orders || [];
                if (newOrders.length === 0) return response.status(200).json({ success: true, count: 0 });

                // Append to existing orders.
                await kv.rpush('orders', ...newOrders);

                return response.status(200).json({ success: true, count: newOrders.length });
            }

            if (action === 'delete_all_csv') {
                const allOrders = await kv.lrange('orders', 0, -1);
                // Filter out orders that have 'csv_' prefix in ID
                const keptOrders = allOrders.filter(o => !o.id || !o.id.toString().startsWith('csv_'));
                const deletedCount = allOrders.length - keptOrders.length;

                // Replace the list
                await kv.del('orders');
                if (keptOrders.length > 0) {
                    await kv.rpush('orders', ...keptOrders);
                }
                return response.status(200).json({ success: true, count: deletedCount });
            }

            if (action === 'reset_all') {
                await kv.del('orders');
                await kv.del('archive');
                return response.status(200).json({ success: true, message: 'All orders deleted' });
            }

            if (action === 'fix_metadata') {
                const mix = await kv.get('portfolio_mix') || [];
                const orig = await kv.get('portfolio_orig') || [];
                let modified = false;

                // Find "Happy End Creator" in Mix
                const targetIdx = mix.findIndex(item => (item.title || '').includes('ハッピーエンドクリエイター') || (item.comment || '').includes('ハッピーエンドクリエイター'));

                if (targetIdx !== -1) {
                    const item = mix[targetIdx];
                    // Remove from Mix
                    mix.splice(targetIdx, 1);

                    // Add to Orig (if not exists)
                    const existsInOrig = orig.some(o => o.id === item.id);
                    if (!existsInOrig) {
                        item.role = 'オリジナル楽曲制作'; // Update Label
                        orig.push(item); // Add to end or beginning? Standard is push for now.
                    }
                    modified = true;
                }

                if (modified) {
                    await kv.set('portfolio_mix', mix);
                    await kv.set('portfolio_orig', orig);
                    return response.status(200).json({ success: true, message: 'Fixed metadata' });
                }
                return response.status(200).json({ success: true, message: 'Nothing to fix' });
            }

            if (action === 'empty_trash') {
                // 1. Clear Archive List
                await kv.del('archive');

                // 2. Filter out Cancelled from Orders List
                const allOrders = await kv.lrange('orders', 0, -1);
                // Keep only active orders (not 'キャンセル')
                // Note: 'archived' status items should be in 'archive' list, but if any remain in 'orders', remove them too.
                const activeOrders = allOrders.filter(o => o.status !== 'キャンセル' && o.status !== 'archived');

                if (allOrders.length !== activeOrders.length) {
                    await kv.del('orders');
                    if (activeOrders.length > 0) await kv.rpush('orders', ...activeOrders);
                }

                return response.status(200).json({ success: true, count: (allOrders.length - activeOrders.length) });
            }

            if (action === 'cleanup_test_data') {
                const targets = [
                    { key: '曲名', val: 'メルト' },
                    { key: '曲名', val: 'つーちゃん' },
                    { key: 'ご依頼者名', val: '佐藤翼' },
                    { key: 'ご依頼者名', val: 'フタミ' }
                ];

                const filterList = (list) => {
                    return list.filter(o => {
                        // Keep if NONE of the targets match
                        return !targets.some(t => (o[t.key] || '').includes(t.val));
                    });
                };

                // 1. Clean Orders
                const orders = await kv.lrange('orders', 0, -1);
                const filteredOrders = filterList(orders);

                // 2. Clean Archive
                const archive = await kv.lrange('archive', 0, -1);
                const filteredArchive = filterList(archive);

                // Update DB - Atomic replacement not fully possible easily with simple KV list, 
                // but del+push is standard. 
                await kv.del('orders');
                if (filteredOrders.length > 0) await kv.rpush('orders', ...filteredOrders);

                await kv.del('archive');
                if (filteredArchive.length > 0) await kv.rpush('archive', ...filteredArchive);

                return response.status(200).json({ success: true, removed: (orders.length - filteredOrders.length) + (archive.length - filteredArchive.length) });
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
