import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export async function requireAdminPage() {
  if (!(await isAdmin())) redirect("/login");
}
