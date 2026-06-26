const fs = require('fs');

const file = 'original.html';
if (!fs.existsSync(file)) process.exit(1);

let content = fs.readFileSync(file, 'utf8');

const dict = {
    'あなただけEオリジナル楽曲を制作します': 'あなただけのオリジナル楽曲を制作します',
    '作曲、編曲\nEアレンジE、作詞、MixまでトEタルプロチEース': '作曲、編曲（アレンジ）、作詞、Mixまでトータルプロデュース',
    '作曲、編曲\r\nEアレンジE、作詞、MixまでトEタルプロチEース': '作曲、編曲（アレンジ）、作詞、Mixまでトータルプロデュース',
    '作曲、編曲EアレンジE、作詞、MixまでトEタルプロチEース': '作曲、編曲（アレンジ）、作詞、Mixまでトータルプロデュース',
    'Vtuber様や\n歌い手様Eオリジナル曲に、E': 'Vtuber様や歌い手様のオリジナル曲に。',
    'Vtuber様や\r\n歌い手様Eオリジナル曲に、E': 'Vtuber様や歌い手様のオリジナル曲に。',
    'Vtuber様や歌い手様Eオリジナル曲に、E': 'Vtuber様や歌い手様のオリジナル曲に。',
    'ミックスEEスタリング': 'ミックス／マスタリング',
    '世界に一つだけEオリジナル楽曲を制作します、E': '世界に一つだけのオリジナル楽曲を制作します。',
    '目安に進めてまぁEます、E': '目安に進めてまいります。',
    '※修正冁EめEケジュールの混雑状況によっては\n、期間が延長となる場合がござぁEす、E': '※修正内容やスケジュールの混雑状況によっては、期間が延長となる場合がございます。',
    '※修正冁EめEケジュールの混雑状況によっては\r\n、期間が延長となる場合がござぁEす、E': '※修正内容やスケジュールの混雑状況によっては、期間が延長となる場合がございます。',
    '※修正冁EめEケジュールの混雑状況によっては、期間が延長となる場合がござぁEす、E': '※修正内容やスケジュールの混雑状況によっては、期間が延長となる場合がございます。',
    'お支払い確認後、ワンコーラスチEを制作、E': 'お支払い確認後、ワンコーラスデモを制作。',
    '期間E紁E、E週閁': '期間：約1〜2週間',
    '方向性の確認E修正': '方向性の確認・修正',
    'チE音源をご確認いただき、イメージをすり合': 'デモ音源をご確認いただき、イメージをすり合わせます。',
    'チEをEに全体を構築、E': 'デモを元に全体を構築。',
    'ボEカル収録・提E': 'ボーカル収録・提出',
    'ボEカルとオケを馴染ませ仕上げます、E': 'ボーカルとオケを馴染ませ仕上げます。',
    '完EチEEタ納品': '完成データ納品',
    '完Eした音源を納品ぁEします、E': '完成した音源を納品いたします。',
    'よくある質問EこちめE': 'よくある質問はこちら',
    'サービス冁E': 'サービス内容',
    'ご依頼・サポEチE': 'ご依頼・サポート',
    'よくある質問！EAQEE': 'よくある質問（FAQ）',
    '規紁EEポリシー': '規約・ポリシー'
};

for (const [bad, good] of Object.entries(dict)) {
    content = content.split(bad).join(good);
}

// Just in case, replace any remaining U+FFFD with a blank or try to guess.
// Actually let's manually clean up standard ones.
content = content.replace(/E/g, 'ー'); // often used for macron or bullets
content = content.replace(/\uFFFD/g, ''); // strip others safely, or keep them if they are harmless

fs.writeFileSync(file, content, 'utf8');
console.log(`Fixed original.html`);
