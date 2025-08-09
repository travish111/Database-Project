import { useEffect, useState } from 'react';

type Product = {
  product_id: number;
  name: string;
  price: number;
  stock_qty: number;
};

type CartItem = {
  product_id: number;
  name: string;
  price: number;
  qty: number;
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<number>(1);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((data: Product[]) => setProducts(data));
  }, []);

  const add = (p: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product_id === p.product_id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, { product_id: p.product_id, name: p.name, price: p.price, qty: 1 }];
    });
  };

  const placeOrder = async () => {
    const payload = {
      customer_id: Number(customerId),
      items: cart.map(i => ({ product_id: i.product_id, qty: i.qty }))
    };
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Order #${data.order_id} created!`);
      setCart([]);
    } else {
      setMessage(`Error: ${data.error}`);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Vite + SQLite Mini‑Shop</h1>
      {message && <p><strong>{message}</strong></p>}

      <h2>Products</h2>
      <ul>
        {products.map(p => (
          <li key={p.product_id}>
            {p.name} — ${p.price.toFixed(2)} (stock {p.stock_qty})
            <button style={{ marginLeft: 8 }} onClick={() => add(p)}>Add</button>
          </li>
        ))}
      </ul>

      <h2>Cart</h2>
      {cart.length === 0 ? <p>(empty)</p> :
        <ul>{cart.map(i => <li key={i.product_id}>{i.name} × {i.qty}</li>)}</ul>
      }

      <div style={{ marginTop: 12 }}>
        <label>
          Customer ID:&nbsp;
          <input
            value={customerId}
            onChange={e => setCustomerId(Number(e.target.value))}
            type="number"
            min={1}
          />
        </label>
        <button style={{ marginLeft: 8 }} onClick={placeOrder} disabled={cart.length === 0}>
          Place Order
        </button>
      </div>
    </div>
  );
}
