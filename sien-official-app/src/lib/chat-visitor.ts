import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ApiError } from "@/lib/api-input";
import { requestIdentity } from "@/lib/request-identity";

export function chatVisitor(request: Request) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) throw new ApiError(503, "現在チャットをご利用いただけません。無料相談をご利用ください。");
  const sign = (id: string) => createHmac("sha256", secret).update(`chat:${id}`).digest("hex");
  const supplied = request.headers.get("cookie")?.match(/(?:^|;\s*)sien-chat-session=([a-f0-9-]{36})\.([a-f0-9]{64})(?:;|$)/);
  const valid = supplied && timingSafeEqual(Buffer.from(sign(supplied[1]), "hex"), Buffer.from(supplied[2], "hex"));
  const id = valid ? supplied[1] : randomUUID();
  const cookie = `sien-chat-session=${id}.${sign(id)}; Path=/api/chat; HttpOnly; SameSite=Lax; Max-Age=86400${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  return { identity: requestIdentity(request.headers, id), cookie: valid ? undefined : cookie };
}
