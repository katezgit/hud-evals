import Link from "next/link";
import type { Item } from "../_data/items";

interface ItemRowProps {
  item: Item;
}

export function ItemRow({ item }: ItemRowProps) {
  return (
    <li>
      <Link
        href={`/items/${item.id}`}
        className="block rounded-control border border-border bg-panel px-4 py-3 hover:bg-hover-surface"
      >
        <span className="text-foreground">{item.name}</span>
        <span className="ml-2 text-meta-foreground">{item.id}</span>
      </Link>
    </li>
  );
}
