import type { Metadata } from "next";
import { EmptyState } from "@repo/ui/components/empty-state";
import { Inbox } from "lucide-react";
import { listItems } from "./_data/items";
import { ItemRow } from "./_components";

export const metadata: Metadata = { title: "Items" };

export default async function ItemsPage() {
  const items = await listItems();

  if (items.length === 0) {
    return (
      <EmptyState
        variant="zero-state"
        icon={Inbox}
        title="No items yet"
        subtitle="Create your first item to get started."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-display">Items</h1>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}
