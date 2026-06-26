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
    'tokusho.html',
    'admin.html'
];

const dict = {
    '~bNX^}X^O': 'ミックス／マスタリング',
    '~bNXE}X^O': 'ミックス・マスタリング',
    'IWiyȐ': 'オリジナル楽曲制作',
    '˗tH[': 'ご依頼フォーム',
    'T[rXe': 'サービス内容',
    '˗ET|[g': 'ご依頼・サポート',
    '@lEƗl₢킹': '法人・企業様お問い合わせ',
    '悭鎿iFAQj': 'よくある質問（FAQ）',
    'KE|V[': '規約・ポリシー',
    '˗Ɋւ闯ӎ': 'ご依頼に関する留意事項',
    'vCoV[|V[': 'プライバシーポリシー',
    '菤@ɊÂ\\L': '特定商取引法に基づく表記',
    'ςEk': 'お見積もり・相談する',
    'ׂ': 'すべて',
    '܂łɎ|ïꕔЉ܂B': 'これまでに手掛けた作品の一部をご紹介します。',
    '<title> | Sien-Official</title>': '<title>制作実績 | Sien-Official</title>',
    '̂Ă݂MIXEIWiyȐ': '歌ってみたMIX・オリジナル楽曲制作',
    'Sien-Official̐сiPortfoliojꗗB̂Ă݂MIXAIWiyȐ̃Tv܂B': 'Sien-Officialの制作実績（Portfolio）一覧。歌ってみたMIX、オリジナル楽曲制作のサンプルをご試聴いただけます。',
    '<li><a href="works.html" class="active-link"></a></li>': '<li><a href="works.html" class="active-link">制作実績</a></li>',
    '<li><a href="works.html"></a></li>': '<li><a href="works.html">制作実績</a></li>',
    '<h1></h1>': '<h1>制作実績</h1>',
    '逶ｮ逧・°繧画爾縺': '目的から探す',
    '繝溘ャ繧ｯ繧ｹ・上・繧ｹ繧ｿ繝ｪ繝ｳ繧ｰ': 'ミックス／マスタリング'
};

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    for (const [bad, good] of Object.entries(dict)) {
        content = content.split(bad).join(good);
    }
    
    // Some specific fixes
    content = content.replace(/\s*\|\s*Sien-Official/g, '制作実績 | Sien-Official');
    content = content.replace(/Sien-Official̐сiPortfoliojꗗB̂Ă݂MIXAI\s*WiyȐ̃Tv܂B/g, 'Sien-Officialの制作実績（Portfolio）一覧。歌ってみたMIX、オリジナル楽曲制作のサンプルをご試聴いただけます。');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed: ${file}`);
}
