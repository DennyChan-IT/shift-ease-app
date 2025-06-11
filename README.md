# ShiftEase

![App Screenshot](./ShiftEase%20screenshot.png)

**ShiftEase** is a web-based employee scheduling system designed for restaurants and other businesses. It allows admins and managers to create organizations, manage employee availability, and assign shifts.

---

## Features

- **Multi-Role Authentication:** Secure sign-in/sign-up flows for Admins, Managers, and Employees using Clerk.
- **Organization Management:** Create, update, and delete restaurant locations or business branches.
- **Employee Management:** Add, edit, deactivate, and reactivate employees with soft-delete functionality and email invitations for new accounts.
- **Availability Scheduling:** Set weekly availability windows (all-day or custom time slots) for each employee.
- **Shift Assignment:** Assign and adjust scheduled shifts with start/end times within available slots.

---

## Demo

View it live: [Live Demo](https://shift-ease-app.vercel.app/)

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL with Prisma ORM on Supabase
- **Authentication:** Clerk for user management and invitations

---

## Setup Instructions

Monorepo / Workspace: This repository uses npm workspaces to manage both frontend and backend together. Running npm install at the root will install dependencies for all workspaces.

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/shift-ease-app.git
   cd shift-ease-app

   ```

2. **Install Dependencies**

   At the root (install both frontend and backend):

   ```bash
   npm install

   ```

3. **Configure Environment**

   - Backend (.env)

   ```bash
   PORT=8080
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dbname"
   DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/dbname"
   CLERK_PUBLISHABLE_KEY=pk_test*...
   CLERK_SECRET_KEY=sk_test*...

   ```

   - Frontend (.env.local)

   ```bash
   VITE*CLERK_PUBLISHABLE_KEY=pk_test*...

   ```

4. **Run Database Migrations**

   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma generate

   ```

5. **Run Locally**

   From the root repo directory, start both services:

   ```bash
   npm run dev

   ```

   - Frontend: http://localhost:5173
   - API endpoints: http://localhost:8080/api/

---

## Notes

- Login credentials for demo:

   - Admin    
   Email: `user01@example.com`    
   Password: `shiftease`    

   - Manager    
   Email: `emily.chen@example.com`    
   Password: `shiftease`    

   - Employee    
   Email: `michael.lee@example.com`    
   Password: `shiftease`    

---

## Contact

Have questions or feedback? Feel free to reach out!

- Email: [denny.tanuji@gmail.com](mailto:denny.tanuji@gmail.com)
- LinkedIn: [Denny Chan](https://www.linkedin.com/in/denny-chan-it/)

Thank you for checking out ShiftEase! Stay tuned — more updates, features, and improvements are coming soon. 🚀
