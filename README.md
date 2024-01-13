# Task Manager

Task Manager is a web-based application that allows users to manage their tasks effectively. Users can create, edit, delete, and search for tasks, as well as move completed tasks to a separate section.

## Features

- **User Authentication:** Users can sign up, log in, and log out securely. Authentication ensures that each user's tasks are private.

- **Task Management:**
  - Create new tasks with a title, description, and status.
  - Edit existing tasks, update their details, and change their status.
  - Delete tasks that are no longer needed.
  - Search for tasks based on titles and descriptions.

- **Task Completion:**
  - Mark tasks as completed.
  - View and manage completed tasks separately.

## Technologies Used

- **Frontend:**
  - HTML
  - CSS
  - JavaScript
  - Axios (for making HTTP requests)

- **Backend:**
  - Flask (Python web framework)
  - SQLAlchemy (ORM for database interactions)
  - Flask-Bcrypt (for password hashing)
  - Flask-CORS (Cross-Origin Resource Sharing)

- **Database:**
  - SQLite (for simplicity; can be replaced with other databases for production)

## API Endpoints

### Authentication

- **Check Authentication:**
  - Endpoint: `/api/check-auth`
  - Method: `GET`
  - Returns: `{ 'authenticated': True }` if the user is authenticated, `{ 'authenticated': False }` otherwise.

- **Sign Up:**
  - Endpoint: `/api/signup`
  - Method: `POST`
  - Data: `{ 'username': 'example', 'email': 'example@example.com', 'password': 'password' }`
  - Returns: `{ 'message': 'User created successfully' }` on success.

- **Login:**
  - Endpoint: `/api/login`
  - Method: `POST`
  - Data: `{ 'email': 'example@example.com', 'password': 'password' }`
  - Returns: `{ 'message': 'Login successful' }` on success.

- **Logout:**
  - Endpoint: `/api/logout`
  - Method: `GET`
  - Returns: `{ 'message': 'Logout successful' }` on success.

### Task Management

- **Get Tasks:**
  - Endpoint: `/api/tasks`
  - Method: `GET`
  - Returns a list of tasks associated with the logged-in user.

- **Get Task by ID:**
  - Endpoint: `/api/tasks/<int:task_id>`
  - Method: `GET`
  - Returns details of a specific task if it belongs to the logged-in user.

- **Create Task:**
  - Endpoint: `/api/tasks`
  - Method: `POST`
  - Data: `{ 'title': 'Task Title', 'description': 'Task Description', 'status': 'Pending' }`
  - Returns: `{ 'message': 'Task created successfully' }` on success.

- **Update Task:**
  - Endpoint: `/api/tasks/<int:task_id>`
  - Method: `PUT`
  - Data: `{ 'title': 'Updated Title', 'description': 'Updated Description', 'status': 'Completed' }`
  - Returns: `{ 'message': 'Task updated successfully' }` on success.

- **Delete Task:**
  - Endpoint: `/api/tasks/<int:task_id>`
  - Method: `DELETE`
  - Returns: `{ 'message': 'Task deleted successfully' }` on success.

### Completed Tasks

- **Get Completed Tasks:**
  - Endpoint: `/api/completed-tasks`
  - Method: `GET`
  - Returns a list of completed tasks associated with the logged-in user.

- **Add Back to Tasks:**
  - Endpoint: `/api/add-back-to-tasks/<int:completed_task_id>`
  - Method: `POST`
  - Returns: `{ 'message': 'Task added back to tasks successfully' }` on success.

## Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/task-manager.git
   cd task-manager
2. **Install Dependencies:**
  ```bash
  pip install -r requirements.txt
3. **Run the Application:**
  ```bash
  python app.py
The application will be accessible at `http://127.0.0.1:8000`.
4. **Access the Application:**
  Open your web browser and go to `http://127.0.0.1:8000` to use the Task Manager.

