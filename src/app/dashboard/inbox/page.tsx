import { InboxWorkspace } from "@/components/messages/inbox-workspace";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string | string[] }>;
}) {
  const params = await searchParams;
  const customerId = Array.isArray(params.customerId)
    ? params.customerId[0]
    : params.customerId;

  return <InboxWorkspace initialCustomerId={customerId ?? null} />;
}
