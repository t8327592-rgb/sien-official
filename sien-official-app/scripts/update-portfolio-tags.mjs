import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import yts from 'yt-search';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

async function getVideoInfo(url) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  
  try {
    const video = await yts({ videoId });
    if (video) {
      return {
        title: video.title,
        description: video.description || "",
        author: video.author ? video.author.name : ""
      };
    }
  } catch (error) {
    console.error(`Failed to get video info for ${url}:`, error.message);
  }
  return null;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateTags(videoInfo, retryCount = 0) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
以下のYouTube動画情報から、指定された選択肢のみを用いてタグを抽出し、JSON形式で出力してください。

【動画情報】
タイトル: ${videoInfo.title}
投稿者: ${videoInfo.author}
説明: ${videoInfo.description.substring(0, 500)}

【選択肢リスト（必ずここから選択）】
- ボーカルミックス
- ロック
- バラード
- ポップ
- EDM
- アニソン系
- ボカロ系
- R&B
- ジャズ
- クラシック
- ヒップホップ
- その他

【ルール】
1. 「ボーカルミックス」は必須タグとして必ず含めること。
2. その楽曲の音楽性に最も近いジャンルを、選択肢リストから最大3つまで選ぶこと。
3. category: "MIX" または "オリジナル" （基本はMIX）
4. free_genre_note: 選択肢に該当しない場合や、タグで伝えきれない詳細なニュアンス（例: 清涼感のある高解像度サウンド、など）を100文字以内で自由記述。

【出力形式】(JSONのみ出力してください)
{
  "title": "...",
  "category": "...",
  "selected_tags": ["ボーカルミックス", "タグ2", "タグ3"],
  "free_genre_note": "..."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Failed to generate tags: ${error.message}`);
    // 429 Too Many Requests 等の場合は待機してリトライ
    if (error.message.includes("429") || error.message.includes("Quota exceeded")) {
      if (retryCount < 3) {
        console.log(`Rate limit reached. Sleeping for 65 seconds before retry ${retryCount + 1}/3...`);
        await sleep(65000);
        return generateTags(videoInfo, retryCount + 1);
      }
    }
    return null;
  }
}

async function main() {
  console.log("Starting portfolio update process...");
  
  const portfolios = await prisma.portfolio.findMany();
  console.log(`Found ${portfolios.length} portfolios.`);
  
  let updatedCount = 0;

  for (const item of portfolios) {
    if (!item.url) continue;

    console.log(`\nProcessing: ${item.title}`);
    
    const videoInfo = await getVideoInfo(item.url);
    if (!videoInfo) continue;
    
    console.log(`-> Found Video: ${videoInfo.title}`);
    
    const tagData = await generateTags(videoInfo);
    if (!tagData) {
      console.log(`-> Skipping update due to AI error.`);
      continue;
    }
    
    console.log(`-> Generated Category: ${tagData.category}`);
    console.log(`-> Generated Tags: ${tagData.selected_tags.join(', ')}`);
    console.log(`-> Note: ${tagData.free_genre_note}`);
    
    try {
      await prisma.portfolio.update({
        where: { id: item.id },
        data: {
          title: tagData.title || item.title,
          serviceCategory: tagData.category || "MIX",
          tags: tagData.selected_tags.join(', '),
        }
      });
      console.log(`-> Successfully updated in DB.`);
      updatedCount++;
    } catch (updateError) {
      console.error(`-> Failed to update DB:`, updateError.message);
    }
    
    // APIレートリミット（15RPM想定）を避けるため、1リクエストごとに5秒待機
    await sleep(5000);
  }
  
  console.log(`\nProcess completed! Updated ${updatedCount} portfolios.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
