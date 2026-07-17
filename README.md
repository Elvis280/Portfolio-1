# Portfolio CMS

A dynamic, luxury-styled portfolio website featuring a custom-built Content Management System (CMS) powered by Node.js and Supabase PostgreSQL.

## Features

- **Luxury UI/UX**: Dark mode aesthetic with premium metallic blue accents, smooth micro-animations, and dynamic glowing dividers.
- **Live Text Editor**: Admins can log in and edit text across the site directly from the frontend interface.
- **Dynamic Content**: Easily add, edit, or delete Subjects, Skills, Experience, Qualifications, FAQs, and Testimonials.
- **Gallery Management**: Upload new images and manage your portfolio gallery directly from the web interface.
- **Secure Backend**: Protected by JWT authentication, bcrypt password hashing, and rate-limiting to prevent brute force attacks.
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
   - Once logged in, you can use the Admin Panel on the right side of the screen to enable the Live Text Editor, update your password, or manage dynamic content.

## Important Notes

- **Security**: Please update your default password immediately after your first login via the Admin Panel.
- **Database**: All data is securely stored in Supabase. There are no local database files to worry about.
