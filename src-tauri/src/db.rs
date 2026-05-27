use rusqlite::Connection;

pub fn init_db() -> Connection {
    let conn = Connection::open("vault.db").unwrap();

    conn.execute(
        "CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            note TEXT,
            transaction_date TEXT NOT NULL
        )",
        [],
    )
    .unwrap();

    conn
}