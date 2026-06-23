import { withAuth } from "next-auth/middleware";

// 管理画面へのアクセスを認証済みのユーザーに制限する
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // /admin 以下のすべてのパスと /api/admin 以下を保護対象にする
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
