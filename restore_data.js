
// SEED SCRIPT TO RESTORE DEFAULT DATA
// Run this in the browser console of the Admin Panel

async function restoreDefaults() {
    const confirmRestore = confirm("THIS WILL OVERWRITE PORTFOLIO AND PLANS. ARE YOU SURE?");
    if (!confirmRestore) return;

    // 1. DEFAULT PORTFOLIO
    const defaultWorks = [
        { id: 'video_id_1', title: 'Sample Work 1' },
        { id: 'video_id_2', title: 'Sample Work 2' }
    ];
    const defaultMix = [
        { id: 'mix_id_1', title: 'Mix Sample 1' },
        { id: 'mix_id_2', title: 'Mix Sample 2' }
    ];

    // 2. DEFAULT PLANS (MIX)
    const defaultMixPlans = [
        { title: 'スタンダードプラン', price: '5,000円', period: '3~5日', revisions: '2回', desc: '基本的なMixプラン', recommended: true, badgeText: '人気' },
        { title: 'ワンコーラスプラン', price: '3,000円', period: '2~3日', revisions: '2回', desc: '1番のみのMix' },
        { title: 'スピードプラン', price: '8,000円', period: '24時間以内', revisions: '1回', desc: 'お急ぎの方へ' }
    ];
    const defaultOrigPlans = [
        { title: 'スタンダード制作', price: '30,000円~', period: '14~20日', revisions: '2回', desc: 'オリジナル楽曲制作' },
        { title: '作詞持ち込み', price: '25,000円~', period: '14~20日', revisions: '2回', desc: '作詞がある場合' }
    ];

    // 3. API CALLS
    const headers = { 'Content-Type': 'application/json', 'x-admin-password': TOKEN }; // Uses global TOKEN

    console.log("Restoring Works...");
    await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ action: 'update_portfolio', data: { category: 'works', items: defaultWorks } }) });

    console.log("Restoring Mix Portfolio...");
    await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ action: 'update_portfolio', data: { category: 'mix', items: defaultMix } }) });

    console.log("Restoring Original Portfolio...");
    await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ action: 'update_portfolio', data: { category: 'orig', items: [] } }) }); // Empty for now

    console.log("Restoring Plans...");
    const pricesData = { mix: defaultMixPlans, orig: defaultOrigPlans };
    await fetch('/api/admin', { method: 'POST', headers, body: JSON.stringify({ action: 'update_prices', data: pricesData }) });

    alert("Default Data Restored. Please reload.");
    location.reload();
}
// restoreDefaults();
