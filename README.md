# Personal Expense Tracker – Frontend

## Project Overview

This repository contains the frontend of the Personal Expense Tracker Web Application.

The application provides a user-friendly interface that allows users to register, log in, manage their personal expenses and view spending analytics.

## Technology Stack

- React.js
- Vite
- JavaScript
- Tailwind CSS
- Chart.js

## Features

- User registration and login.
- Expense dashboard.
- Add new expenses.
- View expense records.
- Edit existing expenses.
- Delete expenses.
- Monthly spending summaries.
- Category-wise expense charts.
- Integration with FastAPI backend APIs.

## Project Structure

```text
frontend/
├── public/
├── src/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
└── vite.config.js
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/ShraddhaThitte28/Personal_Expense_Tracker_Frontend.git
```

### 2. Navigate to the project folder

```bash
cd Personal_Expense_Tracker_Frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

For the deployed application, configure the deployed backend URL.

### 5. Start the application

```bash
npm run dev
```

## Live Application

https://personal-expense-tracker-frontend-sigma.vercel.app/

## Backend Repository

https://github.com/ShraddhaThitte28/Personal_Expense_Tracker_Backend

## Deployment

The frontend is deployed using Vercel and communicates with the FastAPI backend through the configured API base URL.

## Conclusion

This frontend provides an interactive interface for managing personal expenses and monitoring spending information.