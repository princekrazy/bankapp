import Dexie from "dexie";

export const db = new Dexie("VaultManagerDB");

db.version(1).stores({
  transactions: "++id, t_type, name, amount, transaction_date",
});
async function updateTransaction(id, data) {
  return await db.transactions.update(id, data);
}

export async function getNames() {
  const rows = await db.transactions.toArray();

  return [...new Set(rows.map((t) => t.name))].sort();
}
