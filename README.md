# TenTwenty Assessment

This is a Next.js application for a timesheet management system.

## Features

*   **User Authentication:** Users can register and log in to the application.
*   **Timesheet Management:**
    *   Create new timesheets.
    *   View a list of existing timesheets.
    *   View a single timesheet with its details.
    *   Update and delete task.
*   **Task Management:**
    *   Add tasks to a timesheet.
    *   Update and delete tasks within a timesheet.
*   **Dashboard:** A dashboard to display relevant information.
*   **API:** A RESTful API for managing users, timesheets, and tasks.

## Getting Started

### Dummy Account

*   **Email:** johndoe@gmail.com
*   **Password:** password123


### Prerequisites

*   Node.js (v20 or later)
*   npm
*   MongoDB

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/tentwenty-assesment.git
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Set up the environment variables:

    Create a `.env.local` file in the root of the project and add the following variables:

    ```
    MONGODB_URI=<your-mongodb-uri>
    NEXTAUTH_SECRET=<your-nextauth-secret>
    ```

### Running the Application

1.  Start the development server:

    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to `http://localhost:3000`.

## API Endpoints

### Authentication

*   `POST /api/auth/register`: Register a new user.
*   `POST /api/auth/login`: Log in a user.
*   `GET /api/auth/signout`: Log out a user.

### Timesheets

*   `GET /api/timesheets`: Get all timesheets.
*   `POST /api/timesheets`: Create a new timesheet.
*   `GET /api/timesheets/:id`: Get a single timesheet by ID.
*   `PUT /api/timesheets/:id`: Update a timesheet by ID.
*   `DELETE /api/timesheets/:id`: Delete a timesheet by ID.

### Tasks

*   `POST /api/timesheets/:id/tasks`: Add a task to a timesheet.
*   `PUT /api/timesheets/:id/tasks/:taskId`: Update a task by ID.
*   `DELETE /api/timesheets/:id/tasks/:taskId`: Delete a task by ID.

## Technologies Used

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Form Management:** [React Hook Form](https://react-hook-form.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **UI Components:** [Headless UI](https://headlessui.dev/)
*   **Icons:** [Heroicons](https://heroicons.com/)