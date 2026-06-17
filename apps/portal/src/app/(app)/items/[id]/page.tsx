import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getItem } from "../_data/items";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ItemDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  return { title: item?.name ?? "Item" };
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) notFound();

  return (
    <div className="page-shell">
      <header className="page-header">
        <h1 className="text-display">{item.name}</h1>
        <p className="text-meta-foreground">{item.id}</p>
      </header>
      <p className="text-muted-foreground">TODO: implement item detail.</p>
    </div>
  );
}
