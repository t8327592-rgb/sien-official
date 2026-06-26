const fs = require('fs');

// 1. works.html にフィルターボタン追加
let worksHtml = fs.readFileSync('works.html', 'utf8');
const filterHtml = `
            <div id="portfolio-filters" class="text-center" style="margin-bottom:20px;">
                <button class="filter-btn active" data-filter="all">すべて</button>
                <button class="filter-btn" data-filter="male">男性ボーカル</button>
                <button class="filter-btn" data-filter="female">女性ボーカル</button>
                <button class="filter-btn" data-filter="rock">ロック</button>
                <button class="filter-btn" data-filter="pop">ポップス</button>
            </div>
`;
if (!worksHtml.includes('portfolio-filters')) {
    worksHtml = worksHtml.replace('<div class="video-grid" id="works-mix-container"></div>', filterHtml + '\n            <div class="video-grid" id="works-mix-container"></div>');
    fs.writeFileSync('works.html', worksHtml, 'utf8');
}

// 2. script.js にタグ表示とフィルタリング処理追加
let scriptJs = fs.readFileSync('script.js', 'utf8');

// 2.1 createWorkItemの書き換え
const oldCreate = `    // Shared Item Creator
    const createWorkItem = (video, defaultLabel) => {
        const item = document.createElement('div');
        item.className = 'work-item';

        // Force Override for Happy End Creator
        let label = video.role || defaultLabel || 'ミックス／マスタリング';
        if ((video.title || '').includes('ハッピーエンドクリエイター') || (video.comment || '').includes('ハッピーエンドクリエイター')) {
            label = 'オリジナル楽曲制作';
        }

        item.innerHTML = \`
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/\${video.id}" frameborder="0" allowfullscreen></iframe>
            </div>
            <p class="work-title" style="margin-bottom: 5px;">\${video.title || video.comment || ''}</p>
            <p class="work-role" style="font-size: 0.8rem; color: #666; padding: 0 15px 15px; margin-top: auto;">\${label}</p>
        \`;
        return item;
    };`;

const newCreate = `    // Shared Item Creator with Tags
    const createWorkItem = (video, defaultLabel) => {
        const item = document.createElement('div');
        item.className = 'work-item pf-item';
        
        if (video.tags && video.tags.length > 0) {
            item.setAttribute('data-tags', video.tags.join(','));
        }

        // Force Override for Happy End Creator
        let label = video.role || defaultLabel || 'ミックス／マスタリング';
        if ((video.title || '').includes('ハッピーエンドクリエイター') || (video.comment || '').includes('ハッピーエンドクリエイター')) {
            label = 'オリジナル楽曲制作';
        }

        let tagsHtml = '';
        if (video.tags && video.tags.length > 0) {
            tagsHtml = '<div class="pf-tags">' + video.tags.map(t => \`<span class="pf-tag">\${t}</span>\`).join('') + '</div>';
        }

        item.innerHTML = \`
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/\${video.id}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div style="padding: 0 15px 15px; display:flex; flex-direction:column; height:100%;">
                <p class="work-title" style="margin-bottom: 5px; margin-top:10px;">\${video.title || video.comment || ''}</p>
                \${tagsHtml}
                <p class="work-role" style="font-size: 0.8rem; color: #666; margin-top: auto; padding-top:10px;">\${label}</p>
            </div>
        \`;
        return item;
    };`;

if (scriptJs.includes('// Shared Item Creator') && !scriptJs.includes('Shared Item Creator with Tags')) {
    scriptJs = scriptJs.replace(oldCreate, newCreate);
}

// 2.2 PagedSectionクラスの下にフィルタ処理を追加（DOMContentLoaded内）
const oldFilterHook = `    // --- 4. Works Page Tab Logic (UI Only) ---`;
const newFilterHook = `    // --- 3.5 Portfolio Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                const items = document.querySelectorAll('#works-mix-container .pf-item');
                
                items.forEach(item => {
                    if (filter === 'all') {
                        item.style.display = 'block';
                    } else {
                        const tags = item.getAttribute('data-tags') || '';
                        // 'male', 'female', 'rock', 'pop' などの簡易マッピング
                        const tagMap = {
                            'male': '男性ボーカル',
                            'female': '女性ボーカル',
                            'rock': 'ロック',
                            'pop': 'ポップス'
                        };
                        if (tags.includes(tagMap[filter]) || tags.includes(filter)) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    }
                });
            });
        });
    }

    // --- 4. Works Page Tab Logic (UI Only) ---`;

if (scriptJs.includes(oldFilterHook) && !scriptJs.includes('// --- 3.5 Portfolio Filtering ---')) {
    scriptJs = scriptJs.replace(oldFilterHook, newFilterHook);
}

// 2.3 admin.html 側にタグ登録用の入力欄を追加する対応をここで行うべきか？
// worksのデータ構造として tags がすでに存在しているか、adminで登録できる必要がある。
// Vercel上のAPIにデータを登録するためには admin.js か admin.html の改修が必要だが、
// 前回「フェーズ1」で追加した際はそこまで行っていたはず。

fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log('portfolio features added');
