export const dynamic = "force-dynamic";
import { requireAdminPage } from "@/lib/admin-access";
import AdminPageClient from "./AdminPageClient";
export default async function AdminPage() {
  await requireAdminPage();
  return <AdminPageClient />;
}
