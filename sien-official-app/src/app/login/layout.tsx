import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = {
  ...pageMetadata("/login", { title: "管理ログイン | Sien-Official", description: "Sien-Officialの管理者ログイン画面です。" }),
  robots: { index: false, follow: false },
};
export default function LoginLayout({ children }: { children: React.ReactNode }) { return children; }
