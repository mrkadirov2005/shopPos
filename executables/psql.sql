-- Superuser table
CREATE TABLE IF NOT EXISTS superuser (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  lastname VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phonenumber VARCHAR(255) NOT NULL,
  isloggedin BOOLEAN NOT NULL DEFAULT FALSE,
  password VARCHAR(255) NOT NULL,
  refreshtoken VARCHAR(255),
  accesstoken VARCHAR(255),
  shopname VARCHAR(255),
  img_url VARCHAR(255),
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Admin table
CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  isloggedin BOOLEAN NOT NULL DEFAULT FALSE,
  work_start VARCHAR(255),
  work_end VARCHAR(255),
  salary FLOAT NOT NULL DEFAULT 0,
  sales FLOAT NOT NULL DEFAULT 0,
  ispaidthismonth BOOLEAN NOT NULL DEFAULT FALSE,
  expenses FLOAT NOT NULL DEFAULT 0,
  bonuses FLOAT NOT NULL DEFAULT 0,
  permissions TEXT[] NOT NULL,
  img_url VARCHAR(255),
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Brand table
CREATE TABLE IF NOT EXISTS brand (
  id SERIAL PRIMARY KEY,
  brand_name VARCHAR(255) UNIQUE NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  provider_last_name VARCHAR(255) NOT NULL,
  provider_phone VARCHAR(255) NOT NULL,
  provider_card_number VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  product_counts INT NOT NULL DEFAULT 0,
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Category table
CREATE TABLE IF NOT EXISTS category (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) UNIQUE NOT NULL,
  products_available INT NOT NULL DEFAULT 0,
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Permission table
CREATE TABLE IF NOT EXISTS permission (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sales table  -- Moved up here
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  sale_id VARCHAR(255) UNIQUE NOT NULL,
  admin_number VARCHAR(255) NOT NULL,
  admin_name VARCHAR(255) NOT NULL,
  total_price FLOAT NOT NULL,
  total_net_price FLOAT NOT NULL,
  profit FLOAT NOT NULL,
  sale_time VARCHAR(255),
  sale_day INT,
  sales_month INT,
  sales_year INT,
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product table
CREATE TABLE IF NOT EXISTS product (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  categoryid INT NOT NULL,
  brandid INT NOT NULL,
  scale FLOAT NOT NULL,
  img_url VARCHAR(255),
  availability INT NOT NULL,
  total INT NOT NULL,
  receival_date TIMESTAMP WITH TIME ZONE,
  expire_date TIMESTAMP WITH TIME ZONE,
  is_expired BOOLEAN NOT NULL DEFAULT FALSE,
  net_price FLOAT NOT NULL,
  sell_price FLOAT NOT NULL,
  supplier VARCHAR(255),
  cost_price FLOAT,
  last_restocked TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_brand FOREIGN KEY (brandid) REFERENCES brand (id) ON DELETE CASCADE,
  CONSTRAINT fk_category FOREIGN KEY (categoryid) REFERENCES category (id) ON DELETE CASCADE
);

-- SoldProduct table
CREATE TABLE IF NOT EXISTS soldproduct (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  amount INT NOT NULL,
  net_price FLOAT NOT NULL,
  sell_price FLOAT NOT NULL,
  productid INT NOT NULL,
  salesid INT NOT NULL,
  CONSTRAINT fk_product FOREIGN KEY (productid) REFERENCES product (id) ON DELETE CASCADE,
  CONSTRAINT fk_sales FOREIGN KEY (salesid) REFERENCES sales (id) ON DELETE CASCADE
);

-- WeekStats table
CREATE TABLE IF NOT EXISTS weekstats (
  id SERIAL PRIMARY KEY,
  week_range VARCHAR(255) NOT NULL,
  month VARCHAR(255) NOT NULL,
  net_sales FLOAT NOT NULL,
  net_profit FLOAT NOT NULL,
  createdat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updatedat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
