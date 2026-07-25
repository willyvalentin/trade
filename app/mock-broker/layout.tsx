import { requireApplicationPageSession } from "@/lib/server/application-session";

export default async function MockBrokerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireApplicationPageSession();
  return children;
}
