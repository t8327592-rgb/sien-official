import { PricingPlan, PricingOption } from "../types/config";

export const pricingPlans: PricingPlan[] = [
  {
    "id": "cmq9zzs530000f6bfb2ge49an",
    "name": "スタンダードプラン",
    "category": "MIX",
    "shortDescription": "「歌ってみた」のMIXはこちら。ピッチ補正、タイミング補正、コーラス生成、マスタリングまで、すべての作業を行います。",
    "basePrice": 10000,
    "features": [],
    "deliveryEstimate": "7日",
    "revisions": "5回",
    "isActive": true
  },
  {
    "id": "cmq9zzs5h0001f6bfiyob0ylu",
    "name": "ワンコーラスプラン",
    "category": "MIX",
    "shortDescription": "目安：〜1分30秒（例：Aメロ〜サビ）。ワンコーラス分の「歌ってみた」のMIXプランです。",
    "basePrice": 8000,
    "features": [],
    "deliveryEstimate": "7日",
    "revisions": "5回",
    "isActive": true
  },
  {
    "id": "cmqbabx7o000057t1aigvh40b",
    "name": "フルパッケージプラン",
    "category": "ORIGINAL",
    "shortDescription": "こちらは、オリジナル楽曲の制作プランです。作詞・作曲・編曲・MIX・マスタリングなど、基本的な工程はすべて料金に含まれており、「そのままYouTubeに投稿できる完成品」として納品いたします。",
    "basePrice": 66000,
    "features": [],
    "deliveryEstimate": "60日",
    "revisions": "無制限",
    "isActive": true
  },
  {
    "id": "cmq9zzs5s0002f6bfiogg2g3m",
    "name": "ショート動画用プラン",
    "category": "MIX",
    "shortDescription": "目安：〜30秒（サビのみ）。「YouTube Shorts」など短尺動画向けのプランです。",
    "basePrice": 5000,
    "features": [],
    "deliveryEstimate": "5日",
    "revisions": "5回",
    "isActive": true
  },
  {
    "id": "cmqbabx7o000157t1vgr65f73",
    "name": "作詞持ち込みプラン",
    "category": "ORIGINAL",
    "shortDescription": "こちらは、作詞をご自身でご用意いただくオリジナル楽曲制作プランです。ご自身で作詞に挑戦されたい方や、制作費用を抑えつつもクオリティの高い楽曲をお求めの方におすすめです。",
    "basePrice": 55000,
    "features": [],
    "deliveryEstimate": "60日",
    "revisions": "無制限",
    "isActive": true
  },
  {
    "id": "cmq9zzs610003f6bfi8ddn86y",
    "name": "短納期プラン",
    "category": "MIX",
    "shortDescription": "通常より優先して制作を行い、3日以内に納品いたします。",
    "basePrice": 14000,
    "features": [],
    "deliveryEstimate": "3日",
    "revisions": "5回",
    "isActive": true
  },
  {
    "id": "cmq9zzs6d0004f6bfmhycw3gv",
    "name": "最短納期プラン",
    "category": "MIX",
    "shortDescription": "最優先で制作を行い、1日以内に納品いたします。特にお急ぎの方向けです。",
    "basePrice": 18000,
    "features": [],
    "deliveryEstimate": "1日",
    "revisions": "5回",
    "isActive": true
  },
  {
    "id": "cmq9zzs7k0005f6bf54gpdao0",
    "name": "コラボ・合唱プラン",
    "category": "MIX",
    "shortDescription": "2名様分のMIX料金。大人数の場合や複雑なトラック構成の場合は事前にご相談ください。",
    "basePrice": 16000,
    "features": [],
    "deliveryEstimate": "14日",
    "revisions": "5回",
    "isActive": true
  },
  {
    "id": "cmrcxyjcl0000yaehvbewe3t8",
    "name": "ショートMIX 3本セット",
    "category": "MIX",
    "shortDescription": "毎日投稿や継続活動を応援。通常より10%お得なプランです。",
    "basePrice": 13500,
    "features": [
      "ショート動画用MIX 3本セット",
      "1本あたり4,500円 (通常5,000円)",
      "通常価格より1,500円お得 (10%OFF)",
      "シリーズ投稿でも音質を統一"
    ],
    "deliveryEstimate": "要相談 (スケジュールに合わせた分割納品可能)",
    "revisions": "各2回まで",
    "isActive": true
  },
  {
    "id": "cmrcxyjmu0001yaeh4sw76r15",
    "name": "ショートMIX 5本セット",
    "category": "MIX",
    "shortDescription": "一番人気！継続的な活動に最適なまとめ買いプランです。",
    "basePrice": 20000,
    "features": [
      "ショート動画用MIX 5本セット",
      "1本あたり4,000円 (通常5,000円)",
      "通常価格より5,000円お得 (20%OFF)",
      "シリーズ投稿でも音質を統一"
    ],
    "deliveryEstimate": "要相談 (スケジュールに合わせた分割納品可能)",
    "revisions": "各2回まで",
    "isActive": true
  },
  {
    "id": "cmrcxyjrq0002yaehbkkq93n0",
    "name": "ショートMIX 10本セット",
    "category": "MIX",
    "shortDescription": "圧倒的にお得な大容量パック。ガッツリ活動される方に。",
    "basePrice": 35000,
    "features": [
      "ショート動画用MIX 10本セット",
      "1本あたり3,500円 (通常5,000円)",
      "通常価格より15,000円お得 (30%OFF)",
      "シリーズ投稿でも音質を統一"
    ],
    "deliveryEstimate": "要相談 (スケジュールに合わせた分割納品可能)",
    "revisions": "各2回まで",
    "isActive": true
  }
];

export const pricingOptions: PricingOption[] = [
  {
    "id": "cmqtzhi6q0000l9um7nrjfmkp",
    "name": "ライブ用音源制作",
    "category": "MIX",
    "priceText": "1,000円",
    "price": 0,
    "description": "ライブ会場での鳴りや音圧を考慮し、ステージ歌唱向けに調整した音源を制作します。",
    "isActive": true
  },
  {
    "id": "cmqu01d3n000012z32byntv0l",
    "name": "生楽器演奏追加",
    "category": "ORIGINAL",
    "priceText": "10,000円〜",
    "price": 0,
    "description": "ギター、ベース、ピアノなど専門プレイヤーによる生演奏を追加いたします。※提携クリエイターへの依頼となるため、使用楽器や内容により料金が変動いたします。（基本料金内で対応できる場合もございます）",
    "isActive": true
  },
  {
    "id": "cmqtzhi6r0001l9umgz7fzq13",
    "name": "エンコード",
    "category": "MIX",
    "priceText": "0円〜1,000円",
    "price": 0,
    "description": "完成した音源と本家動画を組み合わせ、投稿用のMP4データを制作します。\n\n・お支払い金額の合計が10,000円以上：0円\n・お支払い金額の合計が10,000円未満：1,000円",
    "isActive": true
  },
  {
    "id": "cmqu01d3n000112z3jslzo8jf",
    "name": "人間による仮歌歌唱",
    "category": "ORIGINAL",
    "priceText": "5,000円〜",
    "price": 0,
    "description": "より実際の歌唱ニュアンスに近い「人間による仮歌」をご希望の場合はこちらをご利用ください。※提携クリエイターへの依頼となるため料金が変動する場合がございます。（基本料金内ではボーカロイドによる仮歌をお渡しします）",
    "isActive": true
  },
  {
    "id": "cmqtzhi6r0002l9umk5igv18z",
    "name": "アカペラ音源納品",
    "category": "MIX",
    "priceText": "0円",
    "price": 0,
    "description": "ボーカルのみの音源データも合わせて納品します。",
    "isActive": true
  },
  {
    "id": "cmqu01d3n000212z31b7gcmtp",
    "name": "ボーカルディレクション",
    "category": "ORIGINAL",
    "priceText": "5,000円",
    "price": 0,
    "description": "Discord等を使用し、オンラインでレコーディング時に歌唱アドバイスや方向性の確認を行います。",
    "isActive": true
  },
  {
    "id": "cmqu01d3n000312z35wz5eo83",
    "name": "パラデータ納品",
    "category": "ORIGINAL",
    "priceText": "5,000円",
    "price": 0,
    "description": "各楽器パートごとの独立した音声データ（WAV形式）を納品いたします。ご自身でのリミックスや、ライブでのオケの調整用などにご利用いただけます。",
    "isActive": true
  },
  {
    "id": "cmqtzhi6r0003l9umrlbqcz9s",
    "name": "ボーカルガイド作成",
    "category": "MIX",
    "priceText": "3,000円",
    "price": 0,
    "description": "MIXと併せてのご依頼はもちろん、ガイド制作のみのご依頼も可能です。メイン・ユニゾン・ハモリを打ち込み、WAV形式またはMIDI形式で納品いたします。納期は最大7日ほどいただく場合がございます。",
    "isActive": true
  },
  {
    "id": "cmqtzhi6r0004l9umasi17zzw",
    "name": "カットアップ",
    "category": "MIX",
    "priceText": "2,000円",
    "price": 0,
    "description": "10秒あたりの金額です。作業量に応じて料金が変動する可能性がございますので、事前にご相談ください。\n\nサンプルを見る: https://youtu.be/jaD7Q3c6Zrk?si=Zrw6bF0RA33Mjy1h&t=97",
    "isActive": true
  },
  {
    "id": "cmqu01d3n000412z364bb5ual",
    "name": "著作権（財産権）譲渡",
    "category": "ORIGINAL",
    "priceText": "要相談",
    "price": 0,
    "description": "楽曲の完全買取りをご希望の場合は、別途ご相談ください。",
    "isActive": true
  }
];
