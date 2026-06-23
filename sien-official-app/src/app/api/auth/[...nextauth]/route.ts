export const dynamic = "force-dynamic";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
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
        if (!adminUsername || !adminPassword) {
          console.error("ADMIN_USERNAME or ADMIN_PASSWORD is not set in environment variables");
          return null;
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
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
});

export { handler as GET, handler as POST };
