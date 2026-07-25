import { requireApplicationPageSession } from "@/lib/server/application-session";

export default async function DevelopmentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireApplicationPageSession();
  return children;
}
