import { redirect } from "next/navigation";
import { isAuthenticated } from "./auth";

/** Guard for protected back-office pages/actions. Redirects to login. */
export async function requireOperator(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }
}
