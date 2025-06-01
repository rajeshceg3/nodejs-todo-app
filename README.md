# Node.js To-Do List Application

This is a simple To-Do List application built with Node.js, Express.js, and MongoDB (using an in-memory server for development). It allows users to add tasks and view their list of tasks.

## Features

- Add new tasks to the To-Do list.
- View all tasks in the list.
- Basic web interface to interact with the application.
- RESTful API for programmatic access.

## Project Structure

```
.
├── index.js            # Main application logic
├── package.json        # Project dependencies and scripts
├── pages/
│   └── index.html      # Basic HTML page for the web interface
├── static/
│   └── style.css       # Basic CSS for the web interface
└── README.md           # This file
```

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (usually comes with Node.js)

## Getting Started

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Open your terminal in the project root directory and run:
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```
    This will start the server, typically on `http://localhost:3000`. You should see a message in the console like: `App listening at http://localhost:3000`.

## How to Use

### Web Interface

Once the application is running, open your web browser and navigate to `http://localhost:3000`. You will see a basic interface.
*(Note: The current `index.html` is very basic and doesn't have functionality to add or display To-Dos yet. This would be a future enhancement.)*

### API Endpoints

You can also interact with the application using its API.

#### 1. Add a To-Do item

-   **Method:** `POST`
-   **URL:** `/list`
-   **Headers:** `Content-Type: application/json`
-   **Body (JSON):**
    ```json
    {
      "text": "My new To-Do item"
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "todo": {
        "content": "My new To-Do item"
      }
    }
    ```
-   **Example using cURL:**
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"text":"Buy milk"}' http://localhost:3000/list
    ```

#### 2. Get all To-Do items

-   **Method:** `GET`
-   **URL:** `/list`
-   **Success Response (200 OK):**
    ```json
    {
      "todos": [
        {
          "_id": "someMongoDbId",
          "content": "Buy milk"
        },
        {
          "_id": "anotherMongoDbId",
          "content": "Learn Node.js"
        }
      ]
    }
    ```
-   **Example using cURL:**
    ```bash
    curl http://localhost:3000/list
    ```

## Development

The application uses `mongodb-memory-server` for development, so you don't need to have a separate MongoDB instance running. The data will be lost when the server stops.

## Future Enhancements

-   Implement functionality in `index.html` to add and display To-Dos.
-   Add options to delete or update To-Do items.
-   Persist data using a permanent MongoDB instance.
-   Add input validation.
-   Implement user authentication.

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/express-simple-ez9fzi)
*(Note: The StackBlitz link might need updating if significant changes are made that affect its compatibility.)*
