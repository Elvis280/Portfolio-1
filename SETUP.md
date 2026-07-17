# Portfolio CMS - Complete Setup Guide

Welcome to the Portfolio CMS! This is a luxury-themed portfolio website powered by a custom Node.js backend and a Supabase PostgreSQL database. It allows you to edit content directly on the page without writing code.

This guide will walk you through setting up the project locally for development, and how to deploy it to a live production server.

---

## 1. Local Development Setup

To run this project on your own computer, you will need **Node.js** installed and a **Supabase** account.

### Step 1: Install Dependencies
Open your terminal, navigate to the project directory, and install the required Node.js packages:
```bash
npm install
```

### Step 2: Environment Variables
Copy the `.env.example` file to a new file named `.env` and fill in your connection details:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="super_secret_admin_key_123"
```

### Step 3: Start the Server
Run the local development server:
```bash
npm start
```
The server will start and you will see a message like `Connected to the PostgreSQL database.`

### Step 4: Access the Site
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 2. Using the Admin CMS

This project comes with a built-in content management system.

1. **Login:** Scroll to the bottom of the page and click the hidden **"Admin Login"** link in the footer.
2. **Default Credentials:** 
   - Password: `admin123`
3. **Admin Panel:** Once logged in, a control panel will appear on the right side of your screen. 
   - Click **"Enable Text Editor"** to click and edit any text natively on the page.
   - Use the **"Update Password"** button to change your default password immediately!
   - You will also see "Add" and "Delete" icons appear across the gallery, skills, and subjects sections.

---

## 3. Production Deployment Guide (Render / Vercel / Railway)

Because this project uses an external PostgreSQL database (Supabase), it is completely stateless! This means you can deploy it easily on any modern hosting provider (like Render, Heroku, or Railway) without needing complicated persistent disk storage.

### Step 1: Push to GitHub
Commit your code and push the repository to your own GitHub account.

### Step 2: Deploy to a Hosting Provider
1. Go to your provider of choice (e.g. [Render](https://render.com) or [Railway](https://railway.app)).
2. Create a new Web Service and link your GitHub repository.

### Step 3: Configure Environment Variables
Navigate to the **Environment** settings in your hosting provider and add the following keys:

- `DATABASE_URL` = *(Your Supabase connection string)*
- `JWT_SECRET` = *(Generate a random 32+ character string. This encrypts the admin logins.)*

### Step 4: Deploy
Once you save the variables, your hosting provider will automatically build and deploy your application. You will receive a live URL, and your CMS is officially live!

---

## Troubleshooting

- **I forgot my password:** Connect directly to your Supabase database using the Supabase SQL editor and run `DELETE FROM "config" WHERE key = 'admin_password';`. Restart your server, and the password will reset back to `admin123`.
