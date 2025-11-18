# EduQuestify App

EduQuestify is an interactive learning platform designed to make studying engaging and effective. It combines gamified elements, real-time progress tracking, and personalized study tools to help users master new concepts.

## Features

*   **Flashcard Sessions**: Create and manage flashcards for various subjects. Engage in interactive study sessions to reinforce learning.
*   **Gamified Learning**: Earn XP, level up, and track your study streak to stay motivated.
*   **Real-time Dashboard**: Monitor your progress with a dynamic dashboard showing XP, level, daily goals, recommended topics, and recent activity.
*   **Quiz Module**: Take quizzes on different subjects and difficulties to test your knowledge.
*   **User Authentication**: Secure user registration and login.
*   **Responsive Design**: Optimized for various devices, from desktops to mobile phones.

## Technologies Used

*   **Frontend**:
    *   Next.js (React Framework)
    *   Tailwind CSS (for styling)
    *   Radix UI (for accessible UI components)
    *   Lucide React (for icons)
    *   `next/dynamic` (for client-side component loading to optimize SSR)
*   **Backend**:
    *   Node.js
    *   MySQL (Database)
    *   `bcrypt` (for password hashing)
*   **Real-time Communication**:
    *   Custom event bus (`@/lib/realtime-bus`) for real-time dashboard updates.

## Getting Started

Follow these instructions to set up and run the EduQuestify app locally.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or Yarn
*   MySQL database

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd eduquestify-app
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file in the root directory and add the following environment variables:
    ```
    DATABASE_URL="mysql://user:password@host:port/database"
    # Example: DATABASE_URL="mysql://root:password@localhost:3306/eduquestify_db"
    ```

4.  **Database Setup**:
    *   Ensure your MySQL server is running.
    *   Create a database (e.g., `eduquestify_db`).
    *   Run database migrations (if any) or manually create the necessary tables. The application expects `users` and `flashcard_sessions` tables.
        *   `users` table: `id`, `email`, `name`, `password_hash`, `role`, `created_at`
        *   `flashcard_sessions` table: `id`, `user_id` (foreign key to `users.id`), `created_at`

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

*   `app/`: Next.js pages and API routes.
    *   `api/`: Backend API endpoints (e.g., `flashcards/session/route.js`).
    *   `study/`: The main study page (`page.jsx`).
    *   `hooks/`: Custom React hooks (e.g., `useRealTimeDashboard.js`).
*   `components/`: Reusable React components.
    *   `ui/`: UI components built with Radix UI and Tailwind CSS.
*   `lib/`: Utility functions and database interactions (e.g., `flashcard-db-mysql.ts`, `realtime-bus.ts`).
*   `public/`: Static assets.

## Deployment

The application can be deployed to any platform that supports Next.js, such as Vercel, Netlify, or a custom Node.js server. Ensure your environment variables are correctly configured for the production environment.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

[Specify your project's license here, e.g., MIT License]
