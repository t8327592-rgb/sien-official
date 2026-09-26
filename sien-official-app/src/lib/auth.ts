import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { consumeRateLimit } from "@/lib/rate-limit";
import { ApiError } from "@/lib/api-input";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        // 環境変数が設定されていない場合はエラー（安全のため）
        if (!adminUsername || !adminPassword || !process.env.NEXTAUTH_SECRET) {
          console.error("ADMIN_USERNAME or ADMIN_PASSWORD is not set in environment variables");
          return null;
        }

        // One administrator: share the attempt budget across instances and
        // usernames so rotating submitted names cannot bypass it.
        try {
          await consumeRateLimit("admin-login", 10, 900);
        } catch (error) {
          if (error instanceof ApiError && error.status === 429) {
            throw new Error("LOGIN_RATE_LIMITED");
          }
          throw new Error("LOGIN_UNAVAILABLE");
        }

        if (credentials?.username === adminUsername && credentials?.password === adminPassword) {
          return { id: "1", name: "Admin", email: "admin@sien-official.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function isAdmin() {
  if (!process.env.NEXTAUTH_SECRET) return false;
  const session = await getServerSession(authOptions);
  return session?.user?.email === "admin@sien-official.com";
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
