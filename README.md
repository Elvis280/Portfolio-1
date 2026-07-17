# Portfolio CMS

A dynamic, luxury-styled portfolio website featuring a custom-built Content Management System (CMS) powered by Node.js and SQLite.

## Features

- **Luxury UI/UX**: Dark mode aesthetic with gold accents, smooth micro-animations, and dynamic gradient dividers.
- **Live Text Editor**: Admins can log in and edit text across the site directly from the frontend interface.
- **Dynamic Content**: Easily add, edit, or delete Subjects, Skills, Experience, Qualifications, and FAQs.
- **Gallery Management**: Upload new images and manage your portfolio gallery directly from the web interface.
- **Secure Backend**: Protected by JWT authentication, bcrypt password hashing, and rate-limiting to prevent brute force attacks.

## Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Security**: jsonwebtoken (JWT), bcryptjs, express-rate-limit

## Installation & Setup

1. **Install Dependencies**
   Make sure you have [Node.js](https://nodejs.org/) installed, then run:
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   The server will start at `http://localhost:3000`.

3. **Login as Admin**
   - Click the "Admin Login" link in the footer (or trigger the login modal).
   - Use the default password: **`admin123`**
   - Once logged in, you can use the Admin Panel on the right side of the screen to enable the Live Text Editor, update your password, or manage dynamic content.

## Important Notes

- **Database**: The `portfolio.db` file will be automatically generated upon your first run.
- **Security**: Please update your password immediately after your first login via the Admin Panel.
- **Unused Files**: Older migration scripts and unused assets have been moved to the `unused/` directory.
