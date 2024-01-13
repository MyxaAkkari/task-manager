// Define the server URL
const MY_Server = "http://127.0.0.1:8000";
let tasks = [];
let completedTasks = [];

// Function to check if the user is authenticated
function checkAuthentication() {
    axios.get(`${MY_Server}/api/check-auth`, { withCredentials: true })
        .then(response => {
            if (response.data.authenticated) {
                // User is authenticated, continue with the page
                console.log('User is authenticated');
                // Additional functionality can be added here based on authentication
            }
        })
        .catch(error => {
            window.location.href = './login.html';  // Redirect to the login page
            console.log('User is not authenticated. Redirecting to login.');
            console.error('Error:', error);
        });
}

// Function to submit the login form
function submitLoginForm(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    // Convert FormData to a plain object
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Send data as JSON
    axios.post(`${MY_Server}/api/login`, formObject, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            // Handle successful login
            console.log('Login successful');
            // Redirect to the home page after successful login
            window.location.href = './index.html';
        })
        .catch(error => {
            // Handle login failure          
            console.error('Login failed:', error.response.data);

            // Display error message above the login form
            const errorMessageContainer = document.getElementById('errorMessage');
            errorMessageContainer.textContent = error.response.data.error;

            // You can clear the error message after a certain duration if needed
            setTimeout(() => {
                errorMessageContainer.textContent = '';
            }, 5000); // Clear error message after 5 seconds (adjust as needed)
        });
}

// Function to submit the signup form
function submitSignupForm(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const form = document.querySelector('.loginBxR form'); // Select the form by its class
    const formData = new FormData(form);

    // Convert FormData to a plain object
    const formObject = {};
    formData.forEach((value, key) => {
        formObject[key] = value;
    });

    // Send data as JSON
    axios.post(`${MY_Server}/api/signup`, formObject, {
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            // Handle successful signup
            console.log('Signup successful');
            // Redirect to the login page after successful signup
            window.location.href = './login.html';
        })
        .catch(error => {
            // Handle signup failure
            console.error('Signup failed:', error.response.data);

            // Display error message above the signup form
            const errorMessageContainer = document.getElementById('errorMessage');
            errorMessageContainer.textContent = error.response.data.error;

            // You can clear the error message after a certain duration if needed
            setTimeout(() => {
                errorMessageContainer.textContent = '';
            }, 5000); // Clear error message after 5 seconds (adjust as needed)
        });
}

// Function to handle logout
function logout() {
    axios.get(`${MY_Server}/api/logout`, { withCredentials: true })
        .then(response => {
            // Handle successful logout
            console.log('Logout successful');
            // Redirect to the login page after successful logout
            window.location.href = './login.html';
        })
        .catch(error => {
            // Handle logout failure
            console.error('Logout failed:', error.response.data);
            // You can display an error message to the user or perform other actions here
        });
}

// Function to toggle the visibility of the "Edit Task" form
function toggleEditTaskForm() {
    const editTaskSection = document.getElementById('editTaskSection');
    editTaskSection.style.display = editTaskSection.style.display === 'none' ? 'block' : 'none';
}

// Function to get tasks and display them on the page
function getTasks() {
    axios.get(`${MY_Server}/api/tasks`, { withCredentials: true })
        .then(response => {
            tasks = response.data.tasks;  // Store tasks globally
            displayTasks(tasks);  // Display tasks on the page
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
        });
}

// Function to create a new task
function createTask() {
    const addTaskForm = document.getElementById('addTaskForm');
    const title = addTaskForm.elements['title'].value;
    const description = addTaskForm.elements['description'].value;
    const status = addTaskForm.elements['status'].value;

    if (title && description && status) {
        axios.post(`${MY_Server}/api/tasks`, { title, description, status }, { withCredentials: true })
            .then(response => {
                console.log(response.data.message);
                getTasks(); // Refresh tasks after creating a new one
                addTaskForm.reset(); // Clear form inputs
            })
            .catch(error => {
                console.error('Error creating task:', error);
            });
    }
}

// Function to edit a task
function editTask() {
    const editTaskForm = document.getElementById('editTaskForm');
    const taskId = editTaskForm.dataset.taskId; // Get the task ID from the form's dataset
    const newTitle = editTaskForm.elements['newTitle'].value;
    const newDescription = editTaskForm.elements['newDescription'].value;
    const newStatus = editTaskForm.elements['newStatus'].value;

    if (newTitle || newDescription || newStatus) {
        axios.put(`${MY_Server}/api/tasks/${taskId}`, { title: newTitle, description: newDescription, status: newStatus }, { withCredentials: true })
            .then(response => {
                console.log(response.data.message);
                getTasks(); // Refresh tasks after editing
                closeEditTaskSection(); // Hide the edit task section
            })
            .catch(error => {
                console.error('Error editing task:', error);
            });
    }
}

// Function to open the edit task form with pre-filled data
function openEditTaskSection(taskId) {
    const editTaskSection = document.getElementById('editTaskSection');
    const editTaskForm = document.getElementById('editTaskForm');

    // Fetch task data and fill the edit form
    axios.get(`${MY_Server}/api/tasks/${taskId}`, { withCredentials: true })
        .then(response => {
            const taskData = response.data.Task;
            editTaskForm.elements['newTitle'].value = taskData.title;
            editTaskForm.elements['newDescription'].value = taskData.Description;
            editTaskForm.elements['newStatus'].value = taskData.Status;
            editTaskForm.dataset.taskId = taskId; // Set the task ID in the form's dataset

            editTaskSection.style.display = 'block'; // Show the edit task section
        })
        .catch(error => {
            console.error('Error fetching task data:', error);
        });
}

// Function to close the edit task form
function closeEditTaskSection() {
    const editTaskSection = document.getElementById('editTaskSection');
    const editTaskForm = document.getElementById('editTaskForm');
    editTaskForm.reset(); // Clear form inputs
    delete editTaskForm.dataset.taskId; // Remove the task ID from the form's dataset
    editTaskSection.style.display = 'none'; // Hide the edit task section
}

// Function to delete a task
function deleteTask(taskId) {
    const confirmDelete = confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
        axios.delete(`${MY_Server}/api/tasks/${taskId}`, { withCredentials: true })
            .then(response => {
                console.log(response.data.message);
                getTasks(); // Refresh tasks after deleting
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
    }
}

// Function to get completed tasks and display them on the page
function getCompletedTasks() {
    axios.get(`${MY_Server}/api/completed-tasks`, { withCredentials: true })
        .then(response => {
            completedTasks = response.data.completed_tasks;
            displayCompletedTasks(completedTasks);
        })
        .catch(error => {
            console.error('Error fetching completed tasks:', error);
        });
}

// Function to add a completed task back to tasks
function addBackToTasks(completedTaskId) {
    axios.post(`${MY_Server}/api/add-back-to-tasks/${completedTaskId}`, {}, { withCredentials: true })
        .then(response => {
            console.log(response.data.message);
            getCompletedTasks(); // Refresh completed tasks after adding one back
        })
        .catch(error => {
            console.error('Error adding task back to tasks:', error);
        });
}

// Function to search tasks
function searchTasks() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const tasksList = document.getElementById('tasksList');
    const searchResults = [];

    // Loop through tasks and filter based on the search input
    tasks.forEach(task => {
        const title = task.Title.toLowerCase();
        const description = task.Description.toLowerCase();

        if (title.includes(searchInput) || description.includes(searchInput)) {
            searchResults.push(task);
        }
    });

    // Display search results
    displayTasks(searchResults);
}
// Function to display tasks on the page
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = ''; // Clear existing tasks

    // Loop through tasks and append them to the list
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
                    <h2>${task.Title}</h2>
                    <p>${task.Description}</p>
                    <span>Status: ${task.Status}</span>
                    <button onclick="openEditTaskSection(${task.Id}); editTask(${task.Id});">Edit</button>
                    <button onclick="deleteTask(${task.Id})"><i class="fa-solid fa-check"></i></button>
                `;
        tasksList.appendChild(listItem);
    });
}

// Function to search completed tasks
function searchCompletedTasks() {
    const searchInput = document.getElementById('searchCompletedInput').value.toLowerCase();
    const completedTasksList = document.getElementById('completedTasksList');
    const searchResults = [];

    // Loop through completed tasks and filter based on the search input
    completedTasks.forEach(task => {
        const title = task.Title.toLowerCase();
        const description = task.Description.toLowerCase();

        if (title.includes(searchInput) || description.includes(searchInput)) {
            searchResults.push(task);
        }
    });

    // Display search results
    displayCompletedTasks(searchResults);
}

// Function to display completed tasks on the page
function displayCompletedTasks(completedTasks) {
    const completedTasksList = document.getElementById('completedTasksList');
    completedTasksList.innerHTML = ''; // Clear existing completed tasks

    // Loop through completed tasks and append them to the list
    completedTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <h2>${task.Title}</h2>
            <p>${task.Description}</p>
            <span>Status: ${task.Status}</span>
            <button onclick="addBackToTasks(${task.Id})">Add back to tasks</button>
        `;
        completedTasksList.appendChild(listItem);
    });
}

// Add event listeners after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const logoutLink = document.querySelector('.logout-link a');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.querySelector('.loginBxR form');
    const createTaskButton = document.getElementById('createTaskButton');
    const addTaskForm = document.getElementById('addTaskForm');
    const editTaskForm = document.getElementById('editTaskForm');
    const editTaskSection = document.getElementById('editTaskSection');

    // Event listener for logout link
    if (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the link from navigating
            logout();
        });
    }

    // Event listener for login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', submitLoginForm);
    }

    // Event listener for signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', submitSignupForm);
    }

    // Event listener for create task button
    if (createTaskButton) {
        createTaskButton.addEventListener('click', createTask);
    }

    // Event listener for add task form submission
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent the form from submitting normally
            createTask();
        });
    }

    // Event listener for edit task form submission
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent the form from submitting normally
            editTask();
        });
    }

    // Check authentication only when the page is index.html
    if (window.location.pathname === '/frontend/index.html') {
        checkAuthentication();
        getTasks();

        // Add event listener for search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', searchTasks);
        }
    }

    // Check if the page is completed.html and get completed tasks
    if (window.location.pathname === '/frontend/completed.html') {
        getCompletedTasks();
    }
});
