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
 * @returns リピーターであれば true, 新規であれば false
 */
export async function checkIsRepeater(
  email: string | null | undefined,
  twitterId: string | null | undefined,
  name: string | null | undefined,
  excludeOrderId?: string
): Promise<boolean> {
  const orConditions: any[] = [];
  
  if (email && email.trim() !== "") {
    orConditions.push({ clientEmail: email });
  }
  
  if (twitterId && twitterId.trim() !== "") {
    orConditions.push({ twitterId: twitterId });
  }
  
  if (name && name.trim() !== "") {
    orConditions.push({ clientName: name });
  }
  
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

  const pastOrder = await prisma.order.findFirst({
    where: whereClause
  });

  return pastOrder !== null;
}
