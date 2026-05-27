#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod db;

use rusqlite::params;
use serde::Serialize;

#[derive(Serialize)]
struct Response {
    success: bool,
}

#[tauri::command]
fn add_transaction(
    t_type: String,
    name: String,
    amount: f64,
    note: String,
    transaction_date: String,
) -> Response {
    let conn = db::init_db();

    match conn.execute(
        "INSERT INTO transactions (type, name, amount, note, transaction_date)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![t_type, name, amount, note, transaction_date],
    ) {
        Ok(_) => Response { success: true },
        Err(e) => {
            println!("DB ERROR: {:?}", e);
            Response { success: false }
        }
    }
}

fn main() {
    let _ = db::init_db();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_transaction, get_transactions,get_balance, delete_transaction, get_names, get_balance,update_transaction])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
use rusqlite::Result;


#[derive(Serialize)]
struct Transaction {
    id: i32,
    t_type: String,
    name: String,
    amount: f64,
    note: Option<String>,
    transaction_date: String,
}

#[tauri::command]
fn get_transactions() -> Vec<Transaction> {
    let conn = db::init_db();

let mut stmt = match conn.prepare(
    "SELECT id, type, name, amount, note, transaction_date
     FROM transactions
     ORDER BY id DESC",
) {
    Ok(stmt) => stmt,
    Err(e) => {
        println!("Prepare error: {:?}", e);
        return vec![];
    }
};
let rows = match stmt.query_map([], |row| {
    Ok(Transaction {
        id: row.get(0)?,
        t_type: row.get(1)?,
        name: row.get(2)?,
        amount: row.get(3)?,
        note: row.get(4)?,
        transaction_date: row.get(5)?,
    })
}) {
    Ok(rows) => rows,
    Err(e) => {
        println!("Query error: {:?}", e);
        return vec![];
    }
};

    let mut result = Vec::new();

    for r in rows {
       if let Ok(transaction) = r {
    result.push(transaction);
}
    }

    result
}
#[derive(Serialize)]
struct Balance {
    total_deposits: f64,
    total_withdrawals: f64,
    net_balance: f64,
}

#[tauri::command]
fn get_balance() -> Balance {
    let conn = db::init_db();

    let mut stmt = match conn.prepare(
        "SELECT type, amount FROM transactions"
    ) {
        Ok(stmt) => stmt,
        Err(e) => {
            println!("Prepare error: {:?}", e);

            return Balance {
                total_deposits: 0.0,
                total_withdrawals: 0.0,
                net_balance: 0.0,
            };
        }
    };

    let rows = match stmt.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, f64>(1)?,
        ))
    }) {
        Ok(rows) => rows,
        Err(e) => {
            println!("Query error: {:?}", e);

            return Balance {
                total_deposits: 0.0,
                total_withdrawals: 0.0,
                net_balance: 0.0,
            };
        }
    };

    let mut deposits = 0.0;
    let mut withdrawals = 0.0;

    for r in rows {
        if let Ok((t_type, amount)) = r {
            if t_type == "deposit" {
                deposits += amount;
            } else if t_type == "withdrawal" {
                withdrawals += amount;
            }
        }
    }

    Balance {
        total_deposits: deposits,
        total_withdrawals: withdrawals,
        net_balance: deposits - withdrawals,
    }
}
#[tauri::command]
fn delete_transaction(id: i32) {
    let conn = db::init_db();

    match conn.execute(
        "DELETE FROM transactions WHERE id = ?1",
        [id],
    ) {
        Ok(_) => println!("Transaction deleted"),
        Err(e) => println!("Delete error: {:?}", e),
    }
}
#[tauri::command]
fn get_names() -> Vec<String> {
    let conn = db::init_db();

    let mut stmt = match conn.prepare(
        "SELECT DISTINCT name FROM transactions ORDER BY name ASC"
    ) {
        Ok(stmt) => stmt,
        Err(e) => {
            println!("Prepare error: {:?}", e);
            return vec![];
        }
    };

    let rows = match stmt.query_map([], |row| row.get(0)) {
        Ok(rows) => rows,
        Err(e) => {
            println!("Query error: {:?}", e);
            return vec![];
        }
    };

    let mut names = Vec::new();

    for r in rows {
        if let Ok(name) = r {
            names.push(name);
        }
    }

    names
}
#[tauri::command]
fn update_transaction(
    id: i32,
    name: String,
    amount: f64,
    note: String,
    transaction_date: String,
) {
    let conn = db::init_db();

    match conn.execute(
        "UPDATE transactions
         SET name = ?1,
             amount = ?2,
             note = ?3,
             transaction_date = ?4
         WHERE id = ?5",
        params![
            name,
            amount,
            note,
            transaction_date,
            id
        ],
    ) {
        Ok(_) => println!("Transaction updated"),
        Err(e) => println!("Update error: {:?}", e),
    }
}