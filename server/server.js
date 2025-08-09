import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db, init, q } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

if (process.argv.includes('--init')) {
  init();
  // create a few products and customers
  db.exec(`
    INSERT OR IGNORE INTO customers (name, email) VALUES
      ('Travis Hurst','thurst@example.com'),
      ('Jon Smith','jonsmith@example.com'),
      ('Amy Jones', 'ajones@example.com');

    INSERT OR IGNORE INTO products (name, price, stock_qty, active) VALUES
      ('Pens 10pk',19.99,50,1),
      ('Wireless Keyboard',89.99,25,1),
      ('Notebook',8.49,200,1);
  `);
  console.log('DB initialized and updated.');
}

// routes
app.get('/api/products', (req,res) => {
  res.json(q.allProducts.all());
});

app.post('/api/orders', (req,res) => {
  const { customer_id, items } = req.body;
  if (!customer_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Bad payload' });
  }
  if (!q.findCustomer.get(customer_id)) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const tx = db.transaction((customer_id, items) => {
    const result = q.insertOrder.run(customer_id);
    const order_id = result.lastInsertRowid;

    for (const it of items) {
      const p = q.getProduct.get(it.product_id);
      if (!p || !p.active) throw new Error(`Product ${it.product_id} not found/active`);
      if (p.stock_qty < it.qty) throw new Error(`Insufficient stock for ${p.name}`);
      q.insertItem.run(order_id, p.product_id, it.qty, p.price); // snapshot price
      q.decStock.run(it.qty, p.product_id);
    }
    db.prepare(`UPDATE orders SET status='paid' WHERE order_id=?`).run(order_id);
    return order_id;
  });

  try {
    const order_id = tx(customer_id, items);
    res.json({ ok: true, order_id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));