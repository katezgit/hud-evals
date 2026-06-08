// Mock data — replace with real API/loader. The exported type is the contract;
// the fixture is provisional.

export interface Item {
  id: string;
  name: string;
}

const ITEMS: Item[] = [
  { id: "i_1", name: "First item" },
  { id: "i_2", name: "Second item" },
];

export async function listItems(): Promise<Item[]> {
  return ITEMS;
}

export async function getItem(id: string): Promise<Item | null> {
  return ITEMS.find((i) => i.id === id) ?? null;
}
