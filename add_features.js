const fs = require('fs');

const files = [
    'index.html',
    'mix.html',
    'works.html',
    'original.html',
    'order.html',
    'news.html',
    'news-detail.html',
    'business.html',
    'faq.html',
    'terms.html',
    'privacy.html',
    'tokusho.html'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Theme Toggle
    const targetLi = '<li><a href="order.html" class="nav-cta">ご依頼フォーム</a></li>';
    const replaceLi = targetLi + '\n                <li class="theme-toggle-li"><button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle Dark Mode"><i class="fa-solid fa-moon"></i></button></li>';
    if (!content.includes('theme-toggle-li')) {
        content = content.replace(targetLi, replaceLi);
    }

    // 2. index.html Scroll Indicator
    if (file === 'index.html') {
        const targetSub = '迫力と臨場感のあるサウンドで\n            </p>\n        </div>';
        const replaceSub = '迫力と臨場感のあるサウンドで\n            </p>\n            <div class="scroll-indicator fade-in delay-2">\n                <span style="display:block; font-size:0.75rem; letter-spacing:2px; margin-bottom:5px; opacity:0.8;">SCROLL DOWN</span>\n                <i class="fa-solid fa-chevron-down"></i>\n            </div>\n        </div>';
        if (!content.includes('scroll-indicator')) {
            content = content.replace(targetSub, replaceSub);
        }
    }

    // 3. mix.html Wavesurfer
    if (file === 'mix.html') {
        if (!content.includes('wavesurfer.js')) {
            content = content.replace('<link rel="stylesheet" href="style.css?v=2026D">\n</head>', '<link rel="stylesheet" href="style.css?v=2026D">\n    <script src="https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js"></script>\n</head>');
        }
        
        const targetSeek = '<div class="seek-container">\n                        <span class="curr-time" id="time-1">0:00</span>\n                        <input type="range" class="seek-bar" id="seek-1" value="0" min="0" max="100" step="0.1">\n                        <span class="total-time" id="total-1">0:00</span>\n                    </div>';
        const replaceSeek = '<div class="seek-container" style="display:none;">\n                        <span class="curr-time" id="time-1">0:00</span>\n                        <input type="range" class="seek-bar" id="seek-1" value="0" min="0" max="100" step="0.1">\n                        <span class="total-time" id="total-1">0:00</span>\n                    </div>\n\n                    <div style="position:relative; width: 100%; height: 60px; margin-top: 15px;">\n                        <div id="waveform-1-before" style="position:absolute; top:0; left:0; width: 100%; height: 100%;"></div>\n                        <div id="waveform-1-after" style="position:absolute; top:0; left:0; width: 100%; height: 100%; display:none;"></div>\n                    </div>\n                    <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-muted); margin-top:5px; width:100%;">\n                        <span id="wave-time-1">0:00</span>\n                        <span id="wave-total-1">0:00</span>\n                    </div>';
        if (!content.includes('waveform-1-before')) {
            content = content.replace(targetSeek, replaceSeek);
        }
    }

    // 4. works.html Filters
    if (file === 'works.html') {
        const targetFilters = '<!-- Portfolio Grid -->\n            <div style="height: 60px;" id="works-separator"></div>';
        const replaceFilters = '<!-- Portfolio Filters -->\n            <div id="portfolio-filters" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:30px;">\n                <button class="btn btn-outline filter-btn active" data-filter="all">すべて</button>\n            </div>\n            \n            <!-- Portfolio Grid -->\n            <div style="height: 60px;" id="works-separator"></div>';
        if (!content.includes('portfolio-filters')) {
            content = content.replace(targetFilters, replaceFilters);
        }
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed: ${file}`);
}

// admin.html process
const adminFile = 'admin.html';
if (fs.existsSync(adminFile)) {
    let adminContent = fs.readFileSync(adminFile, 'utf8');

    // Portfolio Form tags
    const targetAdminPf = '<div style="display:flex; gap:5px;">\n                            <input class="pf-input" placeholder="YouTube ID" value="${item.id || \'\'}" onchange="updPf(${i},\'id\',this.value)">\n                            <button class="btn btn-sm btn-ghost" onclick="fetchTitle(${i})"><i class="fa-solid fa-download"></i></button>\n                        </div>\n                        <input class="pf-input" id="pf-title-${i}" placeholder="動画タイトル" value="${item.title || \'\'}" onchange="updPf(${i},\'title\',this.value)">\n                        <button class="btn btn-sm btn-ghost" style="color:red; align-self:flex-end;" onclick="delPf(${i})">削除</button>';
    const replaceAdminPf = '<div style="display:flex; gap:5px;">\n                            <input class="pf-input" placeholder="YouTube ID" value="${item.id || \'\'}" onchange="updPf(${i},\'id\',this.value)">\n                            <button class="btn btn-sm btn-ghost" onclick="fetchTitle(${i})"><i class="fa-solid fa-download"></i></button>\n                        </div>\n                        <input class="pf-input" id="pf-title-${i}" placeholder="動画タイトル" value="${item.title || \'\'}" onchange="updPf(${i},\'title\',this.value)">\n                        <input class="pf-input" placeholder="タグ (例: 男性,ロック)" value="${item.tags || \'\'}" onchange="updPf(${i},\'tags\',this.value)">\n                        <button class="btn btn-sm btn-ghost" style="color:red; align-self:flex-end;" onclick="delPf(${i})">削除</button>';
    if (!adminContent.includes('item.tags')) {
        adminContent = adminContent.replace(targetAdminPf, replaceAdminPf);
    }
    
    // addPf tags
    if (!adminContent.includes('tags: \'\'')) {
        adminContent = adminContent.replace('DATA[activePfCat].push({ id: \'\', title: \'\' });', 'DATA[activePfCat].push({ id: \'\', title: \'\', tags: \'\' });');
    }

    // Status text input
    const targetStatus = '<select id="status-select" class="pf-input" style="max-width:200px;">\n                            <option value="open">受付中</option>\n                            <option value="closed">受付停止中</option>\n                        </select>\n                    </div>';
    const replaceStatus = '<select id="status-select" class="pf-input" style="max-width:200px;">\n                            <option value="open">受付中</option>\n                            <option value="closed">受付停止中</option>\n                        </select>\n                        <div style="margin-top:10px;">\n                            <label style="display:block; font-size:0.8rem; color:#999;">表示テキスト (納期目安など)</label>\n                            <input type="text" id="status-text" class="pf-input" placeholder="例: 現在の納期目安は◯月◯日頃です">\n                        </div>\n                    </div>';
    if (!adminContent.includes('status-text')) {
        adminContent = adminContent.replace(targetStatus, replaceStatus);
    }

    // Status logic
    const targetStatusInit = 'const isOpen = (DATA.status && DATA.status.isOpen !== undefined) ? DATA.status.isOpen : true;\n                statusSelect.value = isOpen ? \'open\' : \'closed\';';
    const replaceStatusInit = 'const isOpen = (DATA.status && DATA.status.isOpen !== undefined) ? DATA.status.isOpen : true;\n                statusSelect.value = isOpen ? \'open\' : \'closed\';\n                \n                const statusText = document.getElementById(\'status-text\');\n                if (statusText) {\n                    statusText.value = (DATA.status && DATA.status.text) ? DATA.status.text : \'\';\n                }';
    if (!adminContent.includes('statusText.value')) {
        adminContent = adminContent.replace(targetStatusInit, replaceStatusInit);
    }

    const targetSaveStatus = 'const isOpen = (statusSelect.value === \'open\');\n            // Auto-generate text based on status\n            const text = isOpen ? \'現在ご依頼受付中です\' : \'現在ご依頼受付を停止しております\';';
    const replaceSaveStatus = 'const isOpen = (statusSelect.value === \'open\');\n            const statusTextInput = document.getElementById(\'status-text\').value;\n            const text = statusTextInput || (isOpen ? \'現在ご依頼受付中です\' : \'現在ご依頼受付を停止しております\');';
    if (!adminContent.includes('statusTextInput')) {
        adminContent = adminContent.replace(targetSaveStatus, replaceSaveStatus);
    }

    fs.writeFileSync(adminFile, adminContent, 'utf8');
    console.log('Processed: admin.html');
}

console.log('All features added successfully.');
