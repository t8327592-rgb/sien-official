import { prisma } from "@/lib/prisma";

/**
 * リピーターかどうかを判定する関数
 * 優先順位: ① メールアドレス ② X(Twitter)ID ③ 名前
 * 判定条件: キャンセル案件（CANCELED, CANCELLED）を除く過去の依頼が存在すること
 * 
 * @param email クライアントのメールアドレス
 * @param twitterId クライアントのX(Twitter)ID
 * @param name クライアントの氏名
 * @param excludeOrderId 更新時に自身のIDを除外する場合に指定
 * @param createdAtBefore この日時より前に作成された依頼のみを対象とする場合に指定（通常は自身のcreatedAtを渡す）
 * @returns リピーターであれば true, 新規であれば false
 */
export async function checkIsRepeater(
  email: string | null | undefined,
  twitterId: string | null | undefined,
  name: string | null | undefined,
  excludeOrderId?: string,
  createdAtBefore?: Date
): Promise<boolean> {
  const orConditions: any[] = [];
  
  if (email && email.trim() !== "") {
    orConditions.push({ clientEmail: email });
  }
  
  if (twitterId && twitterId.trim() !== "" && twitterId.trim() !== "@" && twitterId.trim() !== "なし" && twitterId.trim() !== "無し") {
    orConditions.push({ twitterId: twitterId });
  }
  
  // 名前(clientName)だけの一致は誤判定(同姓同名や「テスト」等)が多いため除外

  
  if (orConditions.length === 0) {
    return false;
  }

  const whereClause: any = {
    AND: [
      {
        status: {
          notIn: ["CANCELED", "CANCELLED"]
        }
      },
      {
        OR: orConditions
      }
    ]
  };

  if (excludeOrderId) {
    whereClause.AND.push({
      id: {
        not: excludeOrderId
      }
    });
  }

  if (createdAtBefore) {
    whereClause.AND.push({
      createdAt: {
        lt: createdAtBefore
      }
    });
  }

  const pastOrder = await prisma.order.findFirst({
    where: whereClause
  });

  return pastOrder !== null;
}

/**
 * 指定したクライアント（Email または TwitterID）に紐づくすべての依頼を「リピーター (isRepeater=true)」に更新する
 */
export async function updateAllClientOrdersToRepeater(
  email: string | null | undefined,
  twitterId: string | null | undefined
) {
  const orConditions: any[] = [];
  
  if (email && email.trim() !== "") {
    orConditions.push({ clientEmail: email });
  }
  
  if (twitterId && twitterId.trim() !== "" && twitterId.trim() !== "@" && twitterId.trim() !== "なし" && twitterId.trim() !== "無し") {
    orConditions.push({ twitterId: twitterId });
  }
  
  if (orConditions.length === 0) {
    return;
  }

  await prisma.order.updateMany({
    where: {
      OR: orConditions
    },
    data: {
      isRepeater: true
    }
  });
}
