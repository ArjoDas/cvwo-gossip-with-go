# Gossip with Go - CVWO Assignment

**Name:** Arjo Das

## Project Overview
Gossip with Go is a web forum application built to facilitate discussions across various topics. Users can sign up, create posts with dynamic topic selection, and engage in discussions via comments.

The project implements a **Hybrid Architecture** using Go (Gin) for the backend, React (MUI) for the frontend, and PostgreSQL (Dockerised) for persistence.

## Features
* **User Authentication:** Secure Signup and Login using JWT (stored in HTTP-only cookies).
* **Forum Structure:** View posts by topics (e.g., Tech, Lifestyle).
* **Discussions:** Create posts and comment on existing threads.
* **Performance:** Optimised frontend data fetching using parallel requests (`Promise.all`) to eliminate request waterfalls.
* **Resilience:** Backend handles missing topic data by defaulting to a "General" category.

## Setup Instructions

### Prerequisites
* Go (1.21 or higher)
* Node.js & npm
* Docker Desktop (Required for the database)

### 1. Database Setup
The project uses PostgreSQL with the `pgvector` extension, managed via Docker Compose.

1.  Open a terminal in the project root.
2.  Start the database container:
    ```bash
    docker-compose up -d
    ```
    *Note: The database runs on port **5433** to avoid conflicts with local Postgres instances.*

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create a `.env` file in the `backend/` directory with the following configuration:
    ```env
    PORT=8080
    DB_URL="host=localhost user=user password=password dbname=gossip_db port=5433 sslmode=disable"
    SECRET="your_secret_key_here"
    OPENAI_API_KEY="" # Optional: Leave blank if not using semantic search
    ```
3.  Install dependencies and start the server:
    ```bash
    go mod tidy
    go run main.go
    ```
    *The server will start on `http://localhost:8080`. It automatically handles database migrations and seeds default topics on startup.*

### 3. Frontend Setup
1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser to `http://localhost:5173`.

---

---

## AI Usage Declaration
In accordance with the assignment guidelines, I have utilised AI tools to facilitate my learning and development process. I have vetted all code to ensure I understand the logic and control flow.

**Tools Used:** Google Gemini

**Purpose & Scope:**

1.  **Code Optimisation (Frontend):**
    I used AI to review my data fetching logic in `PostDetailPage.tsx`. It identified that my initial implementation was creating a request waterfall. I utilised this feedback to implement `Promise.all`, allowing the post and comments to load in parallel.

2.  **Concept Learning (Full Stack):**
    * **Frameworks & Languages:** I used AI as a Socratic tutor to accelerate my understanding of the Go language, the Gin web framework, and React's component-based architecture.
    * **External APIs:** I consulted AI to understand the authentication and request structures required for the OpenAI API, which informed my implementation of semantic search features.
    * **GORM Relationships:** I used AI to understand how to handle "Virtual Fields" in Go structs. This research helped me implement the `Preload("User")` logic in my controllers to correctly join user data with posts.

3.  **Code Review & Refinement:**
    * **Backend Architecture:** I requested AI reviews of my Go middleware, models, and controllers to ensure they followed RESTful principles and Go idiomatic patterns.
    * **Frontend Components:** I used AI to audit my React pages and components for proper prop-drilling practices and state management.
    * **Tooling:** I utilised AI to troubleshoot and configure `vite.config.ts`, specifically for setting up development proxies to bypass CORS issues during local testing.

4.  **Syntax Assistance:**
    I used AI to generate boilerplate code for JSON binding in Gin handlers. I heavily refactored this output to include specific business logic, such as the `TopicID` fallback mechanism (`if finalTopicID == 0 { finalTopicID = 1 }`) to ensure data integrity.