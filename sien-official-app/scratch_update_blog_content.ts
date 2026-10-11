import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';


const prisma = new PrismaClient();

async function main() {
  const draftPath = "C:\\Users\\shien\\.gemini\\antigravity\\brain\\6ba17db2-f007-42fd-93d1-c8be8b2fe0ce\\blog_draft.md";
  const content = fs.readFileSync(draftPath, 'utf8');

  // アイキャッチ画像やタイトル部分は除外して本文のみにする（オプションだが、今回はmarkdownの中身をそのまま入れればOK。ただし最初の `# 【初心者必見】...` よりも下の部分をcontentにしたい）
  // 簡易的にそのまま全てcontentに入れてしまうと、記事のページでタイトルが二重になる。
  // 現状のブログのUIだと `post.title` が上に表示されるので、markdown側の `# タイトル` や `![アイキャッチ]` は除去したほうが綺麗。
  // ただ前回の記事もそのまま突っ込んでいた可能性があるので、一旦そのまま入れてみる。いや、不要な見出しは削ろう。
  
  // 1行目のアイキャッチ画像と、2行目の空行、3行目のタイトル見出しを削除
  const lines = content.split('\n');
  const cleanContent = lines.slice(4).join('\n').trim();

  const post = await prisma.post.findFirst({
    where: { title: { contains: '公式のインスト音源は歌ってみたに使っていいの？' } }
  });
  
  if (post) {
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { content: cleanContent }
    });
    console.log(`Updated post: ${updated.title}`);
  } else {
    console.log('Post not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
