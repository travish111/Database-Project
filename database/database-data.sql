CREATE TABLE staff (
  staff_id      SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  role          VARCHAR(50)  NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customers (
  customer_id   SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id    SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  price         DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock_qty     INT NOT NULL CHECK (stock_qty >= 0),
  active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
  order_id      SERIAL PRIMARY KEY,
  customer_id   INT NOT NULL REFERENCES customers(customer_id),
  order_date    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
);

CREATE TABLE order_items (
  order_id      INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id    INT NOT NULL REFERENCES products(product_id),
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price    DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, product_id)
);
