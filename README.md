# Sweety – Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking application that allows authenticated users to record, manage, and review their blood glucose readings.

## Features

### Authentication

- User registration with name, email, and password
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected application routes
- Users can only access their own glucose readings

### Blood Glucose Readings

Users can record blood glucose readings for four predefined time slots:

- Morning (fasting)
- After breakfast
- After lunch
- After dinner

Each reading contains:

- Date
- Time slot
- Glucose value in mg/dL

Users can:

- Add readings
- View readings
- Edit readings
- Delete readings

### Validation

The application enforces the following rules:

- Glucose value is required
- Whole numbers only
- Glucose range: 40–600 mg/dL
- Future dates are not allowed
- Maximum of 4 readings per day
- Duplicate readings for the same date and slot are not allowed
- Only the four predefined slots are accepted

Validation is implemented at the application level and reinforced with PostgreSQL constraints.

## Reports

Sweety provides three report types.

### Daily Report

Displays readings for a selected date and provides:

- Highest glucose value
- Lowest glucose value
- Average glucose value
- Total number of readings
- Detailed reading list with date, slot, and glucose value

### Month-to-Date Report

Displays readings from the first day of the selected date's month through the selected date.

It provides:

- Highest glucose value
- Lowest glucose value
- Average glucose value
- Total number of readings
- Detailed reading list

### Monthly Report

Displays the **entire previous calendar month**, as specified in the assignment.

For example, if the current month is November 2026, the monthly report covers:

```text
1 October 2026 – 31 October 2026
```

It provides:

- Highest glucose value
- Lowest glucose value
- Average glucose value
- Total number of readings
- Detailed reading list

Average glucose values are rounded to one decimal place.

## Tech Stack

### Frontend

- React
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express.js
- JWT
- bcrypt
- CORS

### Database

- PostgreSQL
- node-postgres (`pg`)

## Project Structure

```text
Sweety/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── seed.js
│   │   ├── test.js
│   │   └── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── screenshots/
│   ├── 01-login.png
│   ├── 02-dashboard.png
│   ├── 03-validation.png
│   ├── 04-edit-reading.png
│   ├── 05-delete-confirmation.png
│   ├── 06-delete-success.png
│   ├── 07-daily-report.png
│   ├── 08-month-to-date-report.png
│   ├── 09-monthly-report.png
│   └── 10-empty-report.png
│
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js
- npm
- PostgreSQL
- Git

## Database Setup

Create a PostgreSQL database named:

```text
sweety_db
```

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Readings Table

```sql
CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reading_date DATE NOT NULL,
    slot VARCHAR(30) NOT NULL,
    glucose_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_slot CHECK (
        slot IN (
            'Morning',
            'After breakfast',
            'After lunch',
            'After dinner'
        )
    ),

    CONSTRAINT valid_glucose_value CHECK (
        glucose_value BETWEEN 40 AND 600
    ),

    CONSTRAINT unique_user_date_slot UNIQUE (
        user_id,
        reading_date,
        slot
    )
);
```

## Environment Variables

Create the following file:

```text
server/.env
```

Use the following structure:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_postgresql_password

JWT_SECRET=your_long_random_jwt_secret
```

The actual `.env` file contains local credentials and must not be committed to Git.

A safe example configuration is provided in:

```text
server/.env.example
```

The `.env.example` file contains placeholders only and does not contain real credentials.

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Sweety
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure environment variables

Create:

```text
server/.env
```

and configure the PostgreSQL connection and JWT secret using the structure shown in `.env.example`.

## Running the Application

### Start the Backend

From the `server` directory:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### Start the Frontend

From the `client` directory:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the application at:

```text
http://localhost:5173
```

## Seed Demo Data

The project includes a seed script that creates a demo user and sample glucose readings.

From the `server` directory:

```bash
npm run seed
```

The seed script creates:

```text
Demo email:
demo@sweety.com

Demo password:
SweetyDemo123!
```

It also creates four sample glucose readings for the demo user.

The seed script can be run again safely because it resets the demo user's sample readings