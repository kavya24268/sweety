# Sweety – Blood Glucose Tracker

Sweety is a full-stack blood glucose tracking application that allows authenticated users to record, manage, and review their blood glucose readings.

## Features

### Authentication
- User registration with name, email, and password
- Secure password hashing using bcrypt
- JWT-based authentication
- Protected routes for authenticated users
- Users can only access their own readings

### Blood Glucose Readings
Users can add readings for four predefined time slots:
- Morning (fasting)
- After breakfast
- After lunch
- After dinner

Each reading includes:
- Date
- Time slot
- Glucose value in mg/dL

Validation includes:
- Glucose value is required
- Whole numbers only
- Glucose range: 40–600 mg/dL
- Future dates are not allowed
- Maximum of 4 readings per day
- Duplicate readings for the same date and slot are not allowed

Users can:
- Add readings
- View readings
- Edit readings
- Delete readings

### Reports
Sweety provides:
- Daily reports
- Month-to-date reports
- Monthly reports for a selectable calendar month

Reports include:
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
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── database/
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

Create the following tables.

### Users

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

### Readings

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

Create:

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

Do not commit the actual `.env` file or real credentials to Git.

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

## Running the Application

### Start the backend

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

### Start the frontend

From the `client` directory:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Open the application in a browser at:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get the authenticated user |

### Readings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/readings` | Create a reading |
| GET | `/api/readings` | Get the user's readings |
| GET | `/api/readings/:id` | Get a specific reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/month-to-date?date=YYYY-MM-DD` | Month-to-date report |
| GET | `/api/reports/monthly?month=YYYY-MM` | Selected monthly report |

Protected endpoints require:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Security

- Passwords are stored as bcrypt hashes rather than plain text.
- JWT authentication protects user-specific routes.
- Database queries use parameterized SQL.
- Reading queries are scoped to the authenticated user.
- Database-level constraints reinforce glucose range, valid slots, and duplicate prevention.
- Environment secrets are excluded from Git.

## Validation and Business Rules

| Rule | Behaviour |
|---|---|
| Empty glucose value | Rejected |
| Decimal glucose value | Rejected |
| Glucose below 40 mg/dL | Rejected |
| Glucose above 600 mg/dL | Rejected |
| Future date | Rejected |
| Duplicate date + slot | Rejected |
| More than 4 readings/day | Rejected |
| Four valid slots/day | Accepted |
| User accessing another user's readings | Prevented |

## Testing

The core application was tested for:

- Registration
- Login
- Logout
- Protected dashboard route
- Adding readings
- Editing readings
- Deleting readings
- Duplicate reading validation
- Maximum 4 readings per day
- Glucose range validation
- Whole-number validation
- Future-date prevention
- Daily reports
- Month-to-date reports
- Selectable monthly reports
- Empty report states

## Screenshots

The project can include screenshots demonstrating:

1. Login page
2. Dashboard with readings
3. Validation error
4. Edit reading
5. Delete confirmation
6. Daily report
7. Month-to-date report
8. Monthly report
9. Empty report state

Add screenshots to a `screenshots/` folder and reference them here if desired.

Example:

```markdown
![Dashboard](screenshots/dashboard.png)
```

## Git

The project is maintained as a Git repository with meaningful commits documenting major development milestones.

Example commit history:

```text
8f5b9c6  Complete glucose reports and validation
e7b0c61  feat: polish Sweety frontend UI
a3b02c6  feat: complete Sweety glucose tracker
aa08716  feat: configure frontend routing
2f5c99e  fix: return reading dates without timezone shift
```

## Notes

- PostgreSQL is used as the database for this project.
- The frontend and backend run as separate development servers.
- Core functionality was prioritized before optional bonus features.

## Author

Developed as a full-stack application assignment using React, Node.js, Express, and PostgreSQL.
