// サイト全体のマスターデータ（共通定数）

export const SITE_INFO = {
  // 実績関連のマスターデータ
  achievements: {
    totalWorks: "800",
    totalViews: "1000", // 万回
    repeatRate: "80",   // %
  },
  
  // プロフィール関連
  profile: {
    name: "しえん",
    title: "Mixing Engineer / Creator",
    twitterId: "@sien_mc09",
    twitterUrl: "https://twitter.com/sien_mc09",
    youtubeUrl: "https://www.youtube.com/@sien_mc09",
    description: "「歌ってみた」を中心に、ボーカルMIX・マスタリングを専門に行うエンジニア。これまでに800件以上の制作に携わり、総再生数は1000万回を超える。\n最も大切にしているのは「ボーカリストの個性と感情を殺さないこと」。正確な補正はもちろん、「歌のニュアンス」を引き出す音楽的なMIXを心がけている。",
    genres: "J-POP, Vocaloid, K-POP, Rock"
  },
  
  // 納期や連絡のデフォルト
  service: {
    replyTime: "24時間以内",
    defaultDelivery: "7日〜14日",
    shortDelivery: "3〜5日",
    rushDelivery: "即日〜48時間",
  }
};
