# Database Setup Guide

This guide provides brief instructions for initializing the database for the Travel Agency application.

## Prerequisites

- Node.js installed
- npm installed

## Setup Steps

1. **Navigate to the server directory**:
   ```
   cd server
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Create .env file**:
   Copy the `.env.example` file to `.env`:
   ```
   copy .env.example .env
   ```

4. **Run database migrations**:
   ```
   npx prisma migrate dev
   ```

5. **Seed the database with initial data**:
   ```
   node prisma/seed.js
   ```

6. **Verify database setup** (optional):
   ```
   node check-db.js
   ```

After completing these steps, your database will be initialized with destinations, clients, and sample reservations.