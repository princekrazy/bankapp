import { useState } from "react";
import DepositPage from "./pages/DepositPage";
import LedgerPage from "./pages/LedgerPage";
import WithdrawalPage from "./pages/WithdrawalPage";

export default function App() {
  const [page, setPage] = useState("ledger");

  return (
    <div>
      <div style={{}}>
        <button
          style={{ marginTop: 30, marginLeft: 20, marginRight: 30 }}
          onClick={() => setPage("ledger")}
        >
          Ledger
        </button>
        <button style={{ marginRight: 30 }} onClick={() => setPage("deposit")}>
          Deposit
        </button>
        <button style={{ marginRight: 10 }} onClick={() => setPage("withdraw")}>
          Withdraw
        </button>
      </div>

      {page === "ledger" && <LedgerPage />}
      {page === "deposit" && <DepositPage />}
      {page === "withdraw" && <WithdrawalPage />}
    </div>
  );
}
