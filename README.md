# Portfolio CMS

A dynamic, luxury-styled portfolio website featuring a custom-built Content Management System (CMS) powered by Node.js and Supabase PostgreSQL.

## Features

- **Luxury UI/UX**: Comes built-in with a premium Harvard-inspired Light Theme and an Apple-inspired Dark Theme.
- **Live Text Editor**: Admins can log in and edit text across the site directly from the frontend interface.
- **Universal Style Inspector**: Point, click, and customize CSS properties (colors, fonts, padding, etc.) globally directly from the frontend.
- **Dynamic Content**: Easily add, edit, or delete Subjects, Skills, Experience, Qualifications, FAQs, and Testimonials.
- **Gallery Management**: Upload new images with custom captions, viewable in a sleek full-screen lightbox modal.
- **Responsive Layout**: Advanced mobile optimization including 'View More / View Less' expandable grids to prevent clutter on small screens.
- **WhatsApp Integration**: Dedicated call-to-action buttons pre-configured for WhatsApp direct messaging.
- **Secure Backend**: Protected by JWT authentication, bcrypt password hashing, and rate-limiting.
- **Stateless Architecture**: Built for easy deployment on Render, Vercel, or Railway with a cloud PostgreSQL backend.

## Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase), using the `pg` driver
- **Security**: jsonwebtoken (JWT), bcryptjs, express-rate-limit

## Installation & Setup

Please refer to `SETUP.md` for a complete step-by-step guide on setting up your local environment and deploying to production.

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file from the `.env.example` template and add your Supabase `DATABASE_URL`.

3. **Start the Server**
   ```bash
   npm start
   ```
   The server will start at `http://localhost:3000`.

4. **Login as Admin**
   - Click the hidden "Admin Login" link in the footer.
   - Use the default password: **`admin123`**
   - Once logged in, use the Admin Panel to enable the Live Text Editor, Universal Style Editor, update your password, manage dynamic content, and customize the Light/Dark themes.

## Important Notes

- **Security**: Please update your default password immediately after your first login via the Admin Panel.
- **Database**: All data is securely stored in Supabase. There are no local database files to worry about.
