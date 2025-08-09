// server/db.js
import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH || './data.sqlite';
export const db = new Database(DB_PATH);

export let q; // <-- make this assignable

export function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS staff (
      staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock_qty INTEGER NOT NULL CHECK(stock_qty >= 0),
      active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
      order_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS order_items (
      order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(product_id),
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      unit_price REAL NOT NULL CHECK(unit_price >= 0),
      PRIMARY KEY (order_id, product_id)
    );
  `);

  // prepare AFTER tables exist
  q = {
    allProducts: db.prepare(`SELECT * FROM products WHERE active = 1 ORDER BY name`),
    getProduct: db.prepare(`SELECT * FROM products WHERE product_id = ?`),
    decStock:   db.prepare(`UPDATE products SET stock_qty = stock_qty - ? WHERE product_id = ?`),

    insertOrder: db.prepare(`INSERT INTO orders (customer_id,status) VALUES (?, 'pending')`),
    insertItem:  db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)`),

    findCustomer: db.prepare(`SELECT customer_id FROM customers WHERE customer_id = ?`)
  };
}
