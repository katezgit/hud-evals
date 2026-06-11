import type { Metadata } from "next";
import { listItems } from "./_data/items";
import { ItemRow } from "./_components";

export const metadata: Metadata = { title: "Items" };

export default async function ItemsPage() {
  const items = await listItems();

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-12 py-6">
        <div className="p-8 text-center">
          <h2 className="text-foreground">No items yet</h2>
          <p className="text-muted-foreground">Create your first item to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-12 py-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-display">Items</h1>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}
