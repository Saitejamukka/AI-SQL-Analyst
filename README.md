# 📊 AI SQL Analyst

> **An AI-powered database analytics application that empowers users to ask questions about relational databases in natural language, safely generates & executes read-only SQL, explains dataset insights, and creates dynamic visualizations.**

[![Live Demo](https://img.shields.io/badge/Netlify-Live%20Demo-8c5a3c?style=for-the-badge&logo=netlify)](https://aisqlanalyst.netlify.app/)
[![Frontend](https://img.shields.io/badge/React-18-58341e?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Backend](https://img.shields.io/badge/FastAPI-Python-8c5a3c?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-58341e?style=for-the-badge)](LICENSE)

---

## 📌 Table of Contents
- [About The Application](#-about-the-application)
- [The Business Problem](#-the-business-problem)
- [Key Features & Capabilities](#-key-features--capabilities)
- [AI Agent Workflow & Architecture](#-ai-agent-workflow--architecture)
- [Security & Read-Only Guardrails](#-security--read-only-guardrails)
- [Technology Stack](#-technology-stack)
- [Sample Database Schema](#-sample-database-schema)
- [Deployment & Setup](#-deployment--setup)

---

## 💡 About The Application

**AI SQL Analyst** bridges the gap between complex relational databases and non-technical stakeholders. Instead of writing manual SQL queries or waiting for data teams to build custom dashboards, users can simply type questions in plain English—such as *"Show me customers who haven't ordered in the last 90 days"* or *"What are total sales by category?"*.

The system analyzes the database schema, constructs safe, optimized SQL `SELECT` queries, executes them against PostgreSQL or SQLite, translates the raw dataset into human-understandable business insights, and renders dynamic interactive charts.

---

## 🎯 The Business Problem

Many business users, product managers, QA engineers, and executives need quick data insights but lack advanced SQL expertise. This creates bottlenecks:
- **Dependency on Analysts**: Technical teams spend repetitive hours writing basic data extraction queries.
- **Delayed Decision Making**: Waiting days for custom report creation hinders business agility.
- **Database Risk**: Unrestricted SQL access risks accidental data deletion or production system modification.

**AI SQL Analyst solves this by offering a secure, self-service natural language analytics platform.**

---

## 🌟 Key Features & Capabilities

### 💬 1. Natural Language to SQL Engine
- Ask questions in conversational English.
- Pre-loaded suggestion chips for instant exploration (*"Top 5 Customers by Revenue"*, *"Low Inventory Products"*, *"Monthly Revenue Trend"*).
- Multi-turn conversation context for follow-up inquiries (*"Now filter by region"*).

### 🛡️ 2. Read-Only Security Guardrails
- Strict AST-level SQL validation parser.
- Automatically blocks dangerous DDL/DML operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`) and script injections.
- Displays explicit **`READ-ONLY GUARANTEED`** compliance badges.

### 🗄️ 3. Interactive Schema & Relational ERD Explorer
- **Table Inspector**: Browse discovered tables, column data types, primary keys (`PK`), foreign keys (`FK`), row counts, and sample row previews.
- **Visual ER Diagram Map**: Node graph connecting tables across foreign key relationships (`customers` ➔ `orders` ➔ `order_items` ➔ `products` ➔ `categories`).

### 📊 4. Dynamic Smart Visualizations (Recharts)
- Auto-recommends optimal chart types based on query output shape:
  - 📊 **Bar Charts**: Categorical comparisons & top performers.
  - 📈 **Line Charts**: Time-series trends & monthly revenue.
  - 🍕 **Pie Charts**: Distribution breakdowns & payment gateway shares.
  - 📉 **Area Charts**: Cumulative metric volume over time.
  - 📋 **Data Tables**: Paginated data grid with CSV/JSON export.

### 💡 5. AI Business Insights Narrative
- Translates raw numerical data tables into plain English summary bullet points.
- Highlights top performers, averages, dataset scope, and key statistical takeaways.

### 💻 6. Direct SQL Studio & Auto Safe Fix
- Raw SQL code editor with syntax formatting and execution metrics (timer in `ms`, record counter).
- One-click **Auto Safe Fix** button that automatically corrects syntax or table typo errors.

### 🔌 7. Multi-Database Connection Hub
- Connect custom **PostgreSQL** or **SQLite** database instances with live connection testing.
- Pre-populated out-of-the-box with a realistic **E-Commerce & SaaS Sample Database**.

### 📜 8. Audit Log & Query History
- Comprehensive log of past questions, generated SQL, execution status (`SUCCESS`, `BLOCKED`, `ERROR`), duration, and 1-click re-run buttons.

---

## 🏗️ AI Agent Workflow & Architecture

```
[ User Question in Natural English ]
                 │
                 ▼
     [ Schema Discovery & Context ]
                 │
                 ▼
       [ SQL Generation Engine ]
                 │
                 ▼
 [ Guardrail Validation (SELECT Only) ]
                 │
      ┌──────────┴──────────┐
   Passed                Failed
      │                     │
      ▼                     ▼
[ Safe DB Execution ]  [ Security Block ]
      │
      ├───────────────────────┐
      ▼                       ▼
[ Result Analysis & ]  [ Dynamic Chart ]
[ Insight Narrative ]  [ Recommendation]
      │                       │
      └──────────┬────────────┘
                 ▼
 [ Rendered UI Dashboard & Data Grid ]
```

---

## 🔒 Security & Read-Only Guardrails

Safety is built into the core execution pipeline:
1. **Read-Only Database Accounts**: Uses read-only database connections where available.
2. **AST Keyword Parser**: Rejects any statement not starting with `SELECT` or `WITH`.
3. **Single Statement Restriction**: Strips comments and blocks multi-statement queries separated by semicolons to prevent injection.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS (Warm Linen Beige & Chestnut Theme), Lucide Icons |
| **Charts** | Recharts (Dynamic Bar, Line, Pie, Area charts) |
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **ORM & Database** | SQLAlchemy, SQLite, PostgreSQL (psycopg2) |
| **Guardrails & AST** | SQLGlot, Regex AST Security Validator |
| **Deployment** | Netlify (Frontend), Docker Compose, Render.com (Backend) |

---

## 🗄️ Sample Database Schema

The built-in E-Commerce database contains 8 interconnected tables with realistic enterprise data:
- `customers` (id, first_name, last_name, email, city, country, status, created_at)
- `categories` (id, name, description)
- `products` (id, category_id, name, price, stock_quantity, sku, created_at)
- `orders` (id, customer_id, order_date, total_amount, status, payment_method)
- `order_items` (id, order_id, product_id, quantity, unit_price, total_price)
- `reviews` (id, product_id, customer_id, rating, comment, review_date)
- `payments` (id, order_id, payment_date, amount, payment_status, payment_gateway)
- `inventory_logs` (id, product_id, change_amount, reason, log_date)

---

## 🚀 Quick Setup & Deployment

### Live Netlify Link
👉 **[https://aisqlanalyst.netlify.app/](https://aisqlanalyst.netlify.app/)**

### Local Setup
```bash
# Clone the repository
git clone https://github.com/saitejamukka/ai-sql-analyst.git
cd ai-sql-analyst

# Backend Setup
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend Setup (in a new terminal)
cd frontend
npm install
npm run dev
```

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for more details.
