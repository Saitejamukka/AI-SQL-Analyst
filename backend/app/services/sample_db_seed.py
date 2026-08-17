import os
import sqlite3
import random
from datetime import datetime, timedelta
from app.core.config import settings

def seed_sample_database(db_path: str = None, force_recreate: bool = False):
    if db_path is None:
        db_path = settings.SAMPLE_DB_PATH
        
    if os.path.exists(db_path) and not force_recreate:
        # Check if tables actually exist inside the DB file
        try:
            chk_conn = sqlite3.connect(db_path)
            chk_cur = chk_conn.cursor()
            chk_cur.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            tbl_count = chk_cur.fetchone()[0]
            chk_conn.close()
            if tbl_count > 0:
                return db_path
        except Exception:
            pass

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Drop existing tables if re-creating
    cursor.execute("DROP TABLE IF EXISTS inventory_logs")
    cursor.execute("DROP TABLE IF EXISTS payments")
    cursor.execute("DROP TABLE IF EXISTS reviews")
    cursor.execute("DROP TABLE IF EXISTS order_items")
    cursor.execute("DROP TABLE IF EXISTS orders")
    cursor.execute("DROP TABLE IF EXISTS products")
    cursor.execute("DROP TABLE IF EXISTS categories")
    cursor.execute("DROP TABLE IF EXISTS customers")

    # Create tables
    cursor.execute("""
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL DEFAULT 'USA',
        status TEXT NOT NULL DEFAULT 'Active',
        created_at DATETIME NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        sku TEXT UNIQUE NOT NULL,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        order_date DATETIME NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Completed',
        shipping_city TEXT,
        payment_method TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        comment TEXT,
        review_date DATETIME NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        payment_date DATETIME NOT NULL,
        amount REAL NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'Success',
        payment_gateway TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
    );
    """)

    cursor.execute("""
    CREATE TABLE inventory_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        change_amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        log_date DATETIME NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    """)

    # Seed Categories
    categories_data = [
        ("Electronics", "Gadgets, computing, audio, and personal devices"),
        ("Apparel", "Men and Women clothing, activewear, and accessories"),
        ("Home & Kitchen", "Furniture, cookware, smart home devices, and decor"),
        ("Books & Stationery", "Fiction, technology, business books, and office supplies"),
        ("Fitness & Sports", "Gym gear, outdoor recreation, and sports equipment")
    ]
    cursor.executemany("INSERT INTO categories (name, description) VALUES (?, ?)", categories_data)

    # Seed Customers (50 realistic records with backdated created_at)
    first_names = ["Alex", "Sarah", "Michael", "Emma", "David", "Jessica", "James", "Emily", "Daniel", "Olivia", 
                   "Robert", "Sophia", "William", "Isabella", "Joseph", "Mia", "Charles", "Charlotte", "Thomas", "Amelia"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Seattle", "Austin", "San Francisco", "Denver", "Boston", "Atlanta"]

    customers_list = []
    base_date = datetime.now() - timedelta(days=500)
    for i in range(1, 61):
        fn = first_names[(i - 1) % len(first_names)]
        ln = last_names[(i * 3) % len(last_names)]
        email = f"{fn.lower()}.{ln.lower()}{i}@example.com"
        city = cities[i % len(cities)]
        created = (base_date + timedelta(days=i * 7)).strftime("%Y-%m-%d %H:%M:%S")
        status = "Active" if i % 7 != 0 else "Inactive"
        customers_list.append((fn, ln, email, city, "USA", status, created))
    
    cursor.executemany("INSERT INTO customers (first_name, last_name, email, city, country, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", customers_list)

    # Seed Products (25 items across categories)
    products_data = [
        (1, "Ultra HD Noise-Canceling Headphones", 249.99, 45, "ELEC-001"),
        (1, "Wireless Ergonomic Mouse", 49.99, 120, "ELEC-002"),
        (1, "Mechanical RGB Gaming Keyboard", 129.99, 15, "ELEC-003"), # low stock
        (1, "4K Curved Monitor 32-inch", 499.99, 8, "ELEC-004"),      # low stock
        (1, "Smart Fitness Watch V2", 199.99, 85, "ELEC-005"),
        
        (2, "Organic Cotton Crewneck T-Shirt", 29.99, 200, "APP-001"),
        (2, "Slim Fit Denim Jeans", 79.99, 60, "APP-002"),
        (2, "Waterproof Outdoor Jacket", 149.99, 12, "APP-003"),       # low stock
        (2, "Breathable Running Shoes", 119.99, 90, "APP-004"),
        (2, "Classic Leather Belt", 39.99, 150, "APP-005"),

        (3, "Stainless Steel Espresso Machine", 349.99, 22, "HOME-001"),
        (3, "Cast Iron Dutch Oven 6-Quart", 89.99, 40, "HOME-002"),
        (3, "Smart HEPA Air Purifier", 179.99, 18, "HOME-003"),        # low stock
        (3, "Memory Foam Pillow Set", 59.99, 110, "HOME-004"),
        (3, "Robot Vacuum with Auto-Empty", 399.99, 5, "HOME-005"),    # low stock

        (4, "Designing Data-Intensive Applications", 45.00, 75, "BOOK-001"),
        (4, "SQL for Data Analytics Masterclass", 39.99, 140, "BOOK-002"),
        (4, "Atomic Habits Hardcover", 27.50, 95, "BOOK-003"),
        (4, "Executive Leather Journal Notebook", 19.99, 210, "BOOK-004"),
        (4, "Ergonomic Desk Organizer Set", 34.99, 65, "BOOK-005"),

        (5, "Adjustable Dumbbell Set 50lbs", 299.99, 14, "FIT-001"),   # low stock
        (5, "Non-Slip Yoga Mat Extra Thick", 35.00, 180, "FIT-002"),
        (5, "Insulated Stainless Water Bottle 32oz", 24.99, 250, "FIT-003"),
        (5, "Resistance Bands Workout Kit", 19.99, 130, "FIT-004"),
        (5, "Foldable Treadmill with Bluetooth", 699.99, 4, "FIT-005")  # low stock
    ]
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    products_with_dates = [(cat, name, price, stock, sku, now_str) for cat, name, price, stock, sku in products_data]
    cursor.executemany("INSERT INTO products (category_id, name, price, stock_quantity, sku, created_at) VALUES (?, ?, ?, ?, ?, ?)", products_with_dates)

    # Seed Orders & Order Items & Payments & Reviews (Distributed over last 180 days)
    order_statuses = ["Completed", "Completed", "Completed", "Completed", "Pending", "Shipped", "Cancelled"]
    payment_methods = ["Credit Card", "Credit Card", "PayPal", "Apple Pay", "Debit Card"]
    gateways = ["Stripe", "PayPal", "Square", "Authorize.Net"]

    orders_count = 120
    random.seed(42) # Deterministic data for clean testing

    # Make sure some customers haven't ordered in the last 90 days
    # Customer IDs 1 to 40 order regularly up to present date
    # Customer IDs 41 to 60 have orders older than 100 days ago!

    for order_id in range(1, orders_count + 1):
        if order_id % 4 == 0:
            # Older customers (id > 40)
            cust_id = random.randint(41, 60)
            days_ago = random.randint(100, 240)
        else:
            cust_id = random.randint(1, 40)
            days_ago = random.randint(1, 90)

        order_dt = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
        order_date_str = order_dt.strftime("%Y-%m-%d %H:%M:%S")
        status = random.choice(order_statuses)
        pm = random.choice(payment_methods)
        city = cities[cust_id % len(cities)]

        # Select 1 to 4 products for this order
        items_num = random.randint(1, 4)
        chosen_products = random.sample(products_data, items_num)

        total_amount = 0.0
        item_rows = []
        for prod in chosen_products:
            prod_id = products_data.index(prod) + 1
            qty = random.randint(1, 3)
            u_price = prod[2]
            t_price = round(qty * u_price, 2)
            total_amount += t_price
            item_rows.append((order_id, prod_id, qty, u_price, t_price))

        total_amount = round(total_amount, 2)

        # Insert order
        cursor.execute("""
            INSERT INTO orders (customer_id, order_date, total_amount, status, shipping_city, payment_method)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (cust_id, order_date_str, total_amount, status, city, pm))

        # Insert order items
        cursor.executemany("""
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
        """, item_rows)

        # Insert payment if completed/shipped/pending
        if status in ["Completed", "Shipped", "Pending"]:
            p_status = "Success" if status != "Pending" else "Pending"
            gw = random.choice(gateways)
            cursor.execute("""
                INSERT INTO payments (order_id, payment_date, amount, payment_status, payment_gateway)
                VALUES (?, ?, ?, ?, ?)
            """, (order_id, order_date_str, total_amount, p_status, gw))

    # Seed Reviews (40 reviews)
    comments = [
        "Outstanding quality! Exceeded my expectations.",
        "Good value for money, fast delivery.",
        "Solid performance, would definitely recommend.",
        "Average product, nothing extraordinary.",
        "Very sleek design and intuitive setup.",
        "Packaging was slightly damaged, but product works fine.",
        "Best purchase I made this year!",
        "Highly durable and works like a charm."
    ]
    reviews_data = []
    for i in range(1, 45):
        p_id = random.randint(1, len(products_data))
        c_id = random.randint(1, 40)
        rating = random.choice([5, 5, 4, 4, 4, 3, 2, 5])
        cmt = random.choice(comments)
        rev_dt = (datetime.now() - timedelta(days=random.randint(5, 150))).strftime("%Y-%m-%d %H:%M:%S")
        reviews_data.append((p_id, c_id, rating, cmt, rev_dt))
    
    cursor.executemany("INSERT INTO reviews (product_id, customer_id, rating, comment, review_date) VALUES (?, ?, ?, ?, ?)", reviews_data)

    # Seed Inventory Logs (30 logs)
    reasons = ["Restock Shipment", "Customer Order Fulfill", "Damaged Item Removal", "Inventory Audit Adjustment"]
    log_rows = []
    for i in range(1, 35):
        p_id = random.randint(1, len(products_data))
        chg = random.choice([50, 100, -5, -10, 25, -2])
        rsn = random.choice(reasons)
        log_dt = (datetime.now() - timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d %H:%M:%S")
        log_rows.append((p_id, chg, rsn, log_dt))

    cursor.executemany("INSERT INTO inventory_logs (product_id, change_amount, reason, log_date) VALUES (?, ?, ?, ?)", log_rows)

    conn.commit()
    conn.close()
    return db_path

if __name__ == "__main__":
    seed_sample_database()
