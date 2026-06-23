# Vault Manager Desktop

A desktop cash vault management application built with **React**, **Tauri**, **Rust**, and **SQLite**.

Vault Manager is designed to track cash deposits and withdrawals, maintain a complete transaction ledger, calculate balances automatically, and generate reports. The application runs entirely on the user's computer with no internet connection or hosting required.

---

## Features

### Deposits
- Record cash deposits
- Capture depositor name
- Add transaction notes
- Select transaction date manually
- Name auto-suggestions from previous transactions

### Withdrawals
- Record cash withdrawals
- Capture recipient name
- Add transaction notes
- Select transaction date manually
- Name auto-suggestions from previous transactions

### Ledger
- View all transactions
- Edit existing transactions
- Delete transactions
- Sort by newest first

### Filtering
Filter transactions by:

- Name
- Minimum amount
- Maximum amount
- Start date
- End date

### Balance Dashboard
Automatically calculates:

- Total Deposits
- Total Withdrawals
- Net Balance

### Reporting
- Export ledger to Excel
- Export ledger to PDF

### Offline Operation
- No internet connection required
- No hosting fees
- Data stored locally in SQLite
- Fast desktop performance

---

## Technology Stack

### Frontend
- React
- Vite

### Desktop Framework
- Tauri

### Backend
- Rust

### Database
- SQLite
- rusqlite

### Reporting
- SheetJS (Excel)
- jsPDF (PDF)

---

## Project Structure

```text
VaultManager/
│
├── src/
│   ├── pages/
│   │   ├── DepositPage.jsx
│   │   ├── WithdrawalPage.jsx
│   │   └── LedgerPage.jsx
│   │
│   ├── components/
│   │   └── BalanceCard.jsx
│   │
│   └── App.jsx
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   └── db.rs
│   │
│   ├── Cargo.toml
│   └── tauri.conf.json
│
└── package.json
```

---

## Database Schema

### Transactions

```sql
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    note TEXT,
    transaction_date TEXT NOT NULL
);
```

---

## Development Setup

### Prerequisites

Install:

- Node.js
- Rust
- Microsoft Visual Studio C++ Build Tools
- Tauri CLI

---

### Install Dependencies

```bash
npm install
```

---

### Run Development Version

```bash
npm run tauri dev
```

---

## Build Desktop Application

Generate a production build:

```bash
npm run tauri build
```

Output can be found in:

```text
src-tauri/target/release/
```

Installers are generated in:

```text
src-tauri/target/release/bundle/
```

---

## Example Transaction

```json
{
  "id": 1,
  "type": "deposit",
  "name": "John Doe",
  "amount": 500.00,
  "note": "Cash deposit",
  "transaction_date": "2026-06-23"
}
```

---

## Available Operations

### Add Deposit

Stores:

- Type
- Name
- Amount
- Note
- Transaction Date

### Add Withdrawal

Stores:

- Type
- Name
- Amount
- Note
- Transaction Date

### Edit Transaction

Allows updating:

- Name
- Amount
- Note
- Transaction Date

### Delete Transaction

Removes transaction from ledger.

---

## Balance Formula

```text
Net Balance =
Total Deposits - Total Withdrawals
```

---

## Future Enhancements

- PIN protection
- User accounts
- Transaction categories
- Audit log
- Automatic database backups
- Monthly reports
- Dashboard charts
- Search improvements
- Multi-vault support

---

## Data Storage

The SQLite database is stored locally on the user's machine.

No cloud storage is used.

No data is transmitted externally.

---

## License

MIT License

---

## Author

Prince
