from flask import Flask, request, jsonify, session, abort
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from icecream import ic

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///taskManager.db'
app.config['SECRET_KEY'] = 'your_secret_key'  # Change this to a secure value
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Define User model for the database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userName = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    tasks = db.relationship('Tasks', backref='user', lazy=True)

# Define Tasks model for the database
class Tasks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(1000), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Define CompletedTasks model for the database
class CompletedTasks(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(1000), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Route to check if a user is authenticated
@app.route('/api/check-auth')
def check_auth():
    if 'user_id' in session:
        ic("success")
        return jsonify({'authenticated': True}), 200
    else:
        ic("not logged")
        return jsonify({'authenticated': False}), 401

# Route to handle user signup
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    user_name = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Invalid input'}), 400

    # Hash the password before storing it in the database
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(userName=user_name, email=email, password_hash=hashed_password)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        print(str(e))
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500

# Route to handle user login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # Store user_id in the session upon successful login
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# Route to handle user logout
@app.route('/api/logout')
def logout():
    if 'user_id' in session:
        # Remove user_id from the session upon logout
        session.pop('user_id', None)
        return jsonify({'message': 'Logout successful'}), 200
    else:
        return jsonify({'message': 'User not logged in'}), 401

# CRUD endpoints for Tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user_id = session.get('user_id')

    if user_id:
        tasks = Tasks.query.filter_by(user_id=user_id).all()
        tasks_data = [{'Id': task.id, 'Title': task.title, 'Description': task.description, 'Status': task.status} for task in tasks]
        return jsonify({'tasks': tasks_data})
    else:
        return jsonify({'error': 'User not authenticated'}), 401

# Route to get details of a specific task
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    user_id = session.get('user_id')

    task = Tasks.query.get(task_id)

    if task and user_id == task.user_id:
        task_data = {'Id': task.id, 'title': task.title, 'Description': task.description, 'Status': task.status}
        return jsonify({'Task': task_data})
    else:
        abort(404)  # Task not found or not associated with the logged-in user

# Route to create a new task
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    status = data.get('status')

    if not title or not description or not status:
        return jsonify({'error': 'Invalid input'}), 400

    # Get the user ID from the session
    user_id = session.get('user_id')

    # Create a new task associated with the current user
    new_task = Tasks(title=title, description=description, status=status, user_id=user_id)

    try:
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task created successfully'}), 201
    except Exception as e:
        print(str(e))
        db.session.rollback()
        return jsonify({'error': 'Failed to create task'}), 500

# Route to update an existing task
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_atask(task_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    status = data.get('status')

    task = Tasks.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    user_id = session.get('user_id')
    if user_id != task.user_id:
        return jsonify({'error': 'Unauthorized to update this task'}), 403

    if status.lower() == 'completed':
        # Move task to CompletedTasks table
        completed_task = CompletedTasks(title=task.title, description=task.description, status=task.status, user_id=user_id)
        db.session.add(completed_task)
        db.session.delete(task)  # Remove task from Tasks table
        try:
            db.session.commit()
            return jsonify({'message': 'Task completed successfully'}), 200
        except Exception as e:
            print(str(e))
            db.session.rollback()
            return jsonify({'error': 'Failed to complete task'}), 500
    else:
        # Update task in Tasks table
        task.title = title if title else task.title
        task.description = description if description else task.description
        task.status = status if status else task.status

        try:
            db.session.commit()
            return jsonify({'message': 'Task updated successfully'}), 200
        except Exception as e:
            print(str(e))
            db.session.rollback()
            return jsonify({'error': 'Failed to update task'}), 500

# Route to delete a task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Tasks.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404

    user_id = session.get('user_id')
    if user_id != task.user_id:
        return jsonify({'error': 'Unauthorized to delete this task'}), 403

    try:
        # Move task to CompletedTasks table
        completed_task = CompletedTasks(title=task.title, description=task.description, status=task.status, user_id=user_id)
        db.session.add(completed_task)
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        print(str(e))
        db.session.rollback()
        return jsonify({'error': 'Failed to delete task'}), 500

# Route to get completed tasks
@app.route('/api/completed-tasks', methods=['GET'])
def get_completed_tasks():
    user_id = session.get('user_id')
    if user_id:
        completed_tasks = CompletedTasks.query.filter_by(user_id=user_id).all()
        completed_tasks_data = [{'Id': task.id, 'Title': task.title, 'Description': task.description, 'Status': task.status} for task in completed_tasks]
        return jsonify({'completed_tasks': completed_tasks_data})
    else:
        return jsonify({'error': 'User not authenticated'}), 401

# Route to add a completed task back to tasks
@app.route('/api/add-back-to-tasks/<int:completed_task_id>', methods=['POST'])
def add_back_to_tasks(completed_task_id):
    user_id = session.get('user_id')
    completed_task = CompletedTasks.query.get(completed_task_id)

    if completed_task and user_id == completed_task.user_id:
        # Add completed task back to tasks
        new_task = Tasks(title=completed_task.title, description=completed_task.description, status=completed_task.status, user_id=user_id)
        db.session.add(new_task)
        db.session.delete(completed_task)  # Remove task from CompletedTasks table

        try:
            db.session.commit()
            return jsonify({'message': 'Task added back to tasks successfully'}), 200
        except Exception as e:
            print(str(e))
            db.session.rollback()
            return jsonify({'error': 'Failed to add task back to tasks'}), 500
    else:
        return jsonify({'error': 'Task not found or unauthorized'}), 404

# Main execution block
if __name__ == '__main__':
    # Create the database tables
    with app.app_context():
        db.create_all()
    # Run the Flask application
    app.run(debug=True, port=8000)
