# Portfolio CMS - Complete Setup Guide

Welcome to the Portfolio CMS! This is a luxury-themed portfolio website powered by a custom Node.js and SQLite backend that allows you to edit content directly on the page without writing code.

This guide will walk you through setting up the project locally for development, and how to deploy it to a live production server.

---

## 1. Local Development Setup

To run this project on your own computer, you will need **Node.js** installed.

### Step 1: Install Dependencies
Open your terminal, navigate to the project directory, and install the required Node.js packages:
```bash
npm install
```

### Step 2: Start the Server
Run the local development server:
```bash
npm start
```
The server will start and you will see a message like `Server running on http://localhost:3000`. 
*(Note: A local database file named `portfolio.db` will automatically be generated in your project folder.)*

### Step 3: Access the Site
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

## 3. Production Deployment Guide (Railway)

To host this website live on the internet, we recommend using **Railway** because it supports the persistent disk storage required for our SQLite database.

### Step 1: Push to GitHub
Commit your code and push the repository to your own GitHub account.

### Step 2: Create a Railway Project
1. Go to [Railway.app](https://railway.app/) and log in.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select this repository.

### Step 3: Add a Persistent Volume
Because this project uses SQLite, you **must** attach a persistent volume. If you skip this, your database (and all your text/image edits) will wipe clean every time Railway restarts!
1. In your Railway dashboard for this service, navigate to the **Volumes** tab.
2. Click **Add Volume**.
3. Set the **Mount Path** to `/data`.

### Step 4: Configure Environment Variables
Navigate to the **Variables** tab in Railway and add the following keys:

- `PORT` = `3000`
- `JWT_SECRET` = *(Generate a random 32+ character string. This encrypts the admin logins.)*
- `DB_PATH` = `/data/portfolio.db` *(This maps your database file to the persistent volume you created in Step 3.)*

### Step 5: Deploy
Once you save the variables, Railway will automatically rebuild and deploy your application. You will receive a live URL (e.g., `your-portfolio.up.railway.app`), and your CMS is officially live!

---

## Troubleshooting

- **I forgot my password:** If you are locked out, simply delete the `portfolio.db` file from your local directory and restart the server. It will recreate the database and reset the password back to `admin123`. *(Note: This will also delete your gallery and text edits!)*
- **Changes aren't saving on my live site:** Double-check that your `DB_PATH` variable exactly matches your Volume's Mount Path in Railway.
