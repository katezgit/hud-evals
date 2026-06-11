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
    <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6 lg:px-8 xl:px-12 py-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-display">{item.name}</h1>
        <p className="text-meta-foreground">{item.id}</p>
        <p className="text-muted-foreground">TODO: implement item detail.</p>
      </div>
    </div>
  );
}
