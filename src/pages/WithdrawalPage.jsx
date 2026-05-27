import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function WithdrawalPage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [transactionDate, setTransactionDate] = useState("");
  const loadNames = async () => {
    if (!window.__TAURI_INTERNALS__) {
      console.warn("Not running inside Tauri");
      return;
    }
    const names = await invoke("get_names");
    setSuggestions(names);
  };
  useEffect(() => {
    loadNames();
  }, []);

  const save = async () => {
    if (!name || amount <= 0) {
      alert("Enter valid data");
      return;
    }

    try {
      setLoading(true);
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
      if (!window.__TAURI_INTERNALS__) {
        console.warn("Not running inside Tauri");
        return;
      }
      await invoke("add_transaction", {
        tType: "withdrawal",
        t_type: "withdrawal",
        name: name,
        amount: amount,
        note: note || "",
        transaction_date: transactionDate,
        transactionDate: transactionDate,
      });

      setName("");
      setAmount(0);
      setNote("");

      alert("Withdrawal saved ✔");
    } catch (err) {
      console.error("TAURI ERROR:", err);
      alert(JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400 }}>
      <h2>Vault Withdrawal</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        list="names"
        style={{ marginBottom: 10 }}
      />

      <datalist id="names">
        {suggestions.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="date"
        value={transactionDate}
        onChange={(e) => setTransactionDate(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={save} disabled={loading}>
        {loading ? "Saving..." : "Save Withdrawal"}
      </button>
    </div>
  );
}
