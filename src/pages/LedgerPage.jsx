import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import BalanceCard from "../components/BalanceCard";

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx-js-style";

const exportLedgerToExcel = (transactions) => {
  // 1. Map data (REMOVE id + CUSTOM KEYS)
  const data = transactions.map((t) => ({
    Date: t.transaction_date,
    Name: t.name,
    Type: t.t_type,
    Amount: t.amount,
    Note: t.note,
  }));

  // 2. Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. Get header range (first row)
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  // 4. Style header row (row 0)
  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });

    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        patternType: "solid",
        fgColor: { rgb: "2F5597" }, // dark blue header
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };
  }

  // 5. Set column widths (optional but nice)
  worksheet["!cols"] = [
    { wch: 15 }, // Date
    { wch: 12 }, // Type
    { wch: 15 }, // Amount
    { wch: 30 }, // Description
  ];

  // 6. Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");

  // 7. Export file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(blob, "ledger.xlsx");
};
// const exportToExcel = (transactions) => {
//   const worksheet = XLSX.utils.json_to_sheet(transactions);
//   const workbook = XLSX.utils.book_new();

//   XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");

//   const excelBuffer = XLSX.write(workbook, {
//     bookType: "xlsx",
//     type: "array",
//   });

//   const blob = new Blob([excelBuffer], {
//     type: "application/octet-stream",
//   });

//   saveAs(blob, "ledger.xlsx");
// };

const exportToPDF = (transactions) => {
  const doc = new jsPDF();

  doc.text("Ledger Report", 14, 10);

  const tableData = transactions.map((t) => [
    t.transaction_date,
    t.t_type,
    t.name,
    t.amount,
    t.note,
  ]);

  autoTable(doc, {
    head: [["Date", "Type", "Name", "Amount", "Note"]],
    body: tableData,
  });

  doc.save("ledger.pdf");
};
export default function LedgerPage() {
  const [transactions, setTransactions] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [noteFilter, setNoteFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const editTransaction = async (t) => {
    const name = prompt("Name", t.name);
    const amount = prompt("Amount", t.amount);
    const note = prompt("Note", t.note);
    const transaction_date = prompt("Date", t.transaction_date);
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
    await invoke("update_transaction", {
      id: t.id,
      name: name,
      amount: Number(amount),
      note: note,
      transactionDate: transaction_date,
    });

    load();
  };
  const remove = async (id) => {
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
    await invoke("delete_transaction", { id });
    load();
  };

  const load = async () => {
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
    const data = await invoke("get_transactions");
    setTransactions(data);
  };
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const filtered = transactions.filter((t) => {
      // Name filter
      const matchesName = t.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const matchesNote = t.note
        .toLowerCase()
        .includes(noteFilter.toLowerCase());

      // Amount range filter
      const matchesMin = minAmount === "" || t.amount >= Number(minAmount);

      const matchesMax = maxAmount === "" || t.amount <= Number(maxAmount);

      // Date range filter
      const matchesStart = startDate === "" || t.transaction_date >= startDate;

      const matchesEnd = endDate === "" || t.transaction_date <= endDate;

      return (
        matchesName &&
        matchesNote &&
        matchesMin &&
        matchesMax &&
        matchesStart &&
        matchesEnd
      );
    });
    load();
    setFilteredTransactions(filtered);
  }, [transactions]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Transaction Ledger</h2>

      <button onClick={load} style={{ marginBottom: 10, marginRight: 20 }}>
        Refresh
      </button>
      <button
        style={{ marginBottom: 10, marginRight: 20 }}
        onClick={() => exportLedgerToExcel(filteredTransactions)}
      >
        Export Excel
      </button>
      <button onClick={() => exportToPDF(filteredTransactions)}>
        Export PDF
      </button>
      <BalanceCard />
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <input
          placeholder="Search note"
          value={noteFilter}
          onChange={(e) => setNoteFilter(e.target.value)}
        />

        <input
          type="number"
          placeholder="Min amount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max amount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          onClick={() => {
            setNameFilter("");
            setMinAmount("");
            setMaxAmount("");
            setStartDate("");
            setEndDate("");
          }}
        >
          Clear Filters
        </button>
      </div>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Note</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {filteredTransactions.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.t_type}</td>
              <td>{t.amount}</td>
              <td>{t.note}</td>
              <td>{t.transaction_date}</td>
              <td>
                <button onClick={() => remove(t.id)}>Delete</button>
              </td>
              <td>
                <button onClick={() => editTransaction(t)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
