import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function BalanceCard() {
  const [balance, setBalance] = useState(null);

  const loadBalance = async () => {
    try {
      if (!window.__TAURI_INTERNALS__) {
        console.warn("Not running inside Tauri");
        return;
      }
      const data = await invoke("get_balance");
      setBalance(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  if (!balance) return <p>Loading balance...</p>;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: "16px",
        marginBottom: "16px",
        borderRadius: "12px",
        color: "white",
        backgroundColor: "#4a4747",
      }}
    >
      <h1>Vault Balance</h1>

      <p> Total Deposits: ${balance.total_deposits}</p>

      <p> Total Withdrawals: ${balance.total_withdrawals}</p>

      <h2>Net Balance: ${balance.net_balance}</h2>
    </div>
  );
}
