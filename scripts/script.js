const todoList = JSON.parse(localStorage.getItem('todoList')) || [{
  id: '1',
  name: 'Play soccer',
  isCompleted: false,
}, {
  id: '2',
  name: 'Go to the GYM',
  isCompleted: false,
}];
const todoInput = document.querySelector('.todo-input');
const todoAdd = document.querySelector('.todo-add');
const todoClear = document.querySelector('.todo-clear');
const todoFilters = document.querySelector('.todo-filters');

let currentFilter = 'all';
let editTaskId = null;
let isEditing = false;

renderTodoList();
setActiveFilter();

function renderTodoList() {
  let todoListHTML = '';

  const filteredList = todoList.filter(task => {
    if (currentFilter === 'working') {
      return !task.isCompleted;
    } else if (currentFilter === 'done') {
      return task.isCompleted;
    }
    return true;
  });
  
  filteredList.forEach((task) => {
    const html = `
      <li class="todo-task">
        <label for="${task.id}" class="todo-task-container">
          <input type="checkbox" id="${task.id}" ${task.isCompleted ? 'checked' : ''}>
          <div class="${task.isCompleted ? 'completed' : ''} todo-task-name">
            <p>${task.name}</p>
          </div>
          <div class="todo-task-buttons">
            <button class="todo-task-edit">Edit</button>
            <button class="todo-task-delete">Delete</button>
          </div>
        </label>
      </li>
    `;

    todoListHTML += html;
  });

  document.querySelector('.todo-list').innerHTML = todoListHTML;

  document.querySelectorAll('.todo-task-edit')
    .forEach((editButton, index) => {
      editButton.addEventListener('click', () => {
        editTask(filteredList[index].id);
      });
    })

  document.querySelectorAll('.todo-task-delete')
    .forEach((deleteButton, index) => {
      deleteButton.addEventListener('click', () => {
        deleteTask(filteredList[index].id);
      });
    });

  document.querySelectorAll('.todo-task input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener('change', handleCheckboxChange);
    });
}

todoAdd.addEventListener('click', () => {
  if (editTaskId !== null && isEditing) {
    saveEditedTask();
  } else {
    addTask();
    isEditing = false;
  }
});


todoClear.addEventListener('click', clearTasks);

todoFilters.addEventListener('click', (event) => {
  if (event.target.tagName === 'SPAN') {
    currentFilter = event.target.id;
    renderTodoList();
    setActiveFilter();
  }
});

function addTask() {
  const taskName = todoInput.value.trim();

  if (taskName === '') {
    alert('Input cannot be empty!');
    return;
  }

  const newId = (todoList.length > 0 
    ? Math.max(...todoList.map(task => parseInt(task.id))) + 1 
    : 1).toString();

  todoList.push({
    id: newId,
    name: todoInput.value,
    isCompleted: false,
  });

  todoInput.value = '';

  renderTodoList();
  saveToStorage();
}

function clearTasks() {
  if (confirm('Are you sure you want to clear all tasks?')) {
    todoList.length = 0;
    renderTodoList();
    saveToStorage();
  }
}

function editTask(taskId) {
  const task = todoList.find(task => task.id === taskId);
  const editButton = document.querySelector(`label[for="${taskId}"] .todo-task-edit`);

  if (editTaskId === taskId) {
    // Cancel editing if already editing the same task
    editTaskId = null;
    isEditing = false;
    todoInput.value = '';
    editButton.textContent = 'Edit';
  } else {
    // Start editing a new task
    if (editTaskId !== null) {
      // Reset the previous edit button text
      const previousEditButton = document.querySelector(`label[for="${editTaskId}"] .todo-task-edit`);
      previousEditButton.textContent = 'Edit';
    }

    todoInput.value = task.name;
    editTaskId = taskId;
    isEditing = true;
    todoInput.focus();
    editButton.textContent = 'Cancel';
  }
}


function saveEditedTask() {
  const task = todoList.find(task => task.id === editTaskId);
  task.name = todoInput.value;

  const editButton = document.querySelector(`label[for="${editTaskId}"] .todo-task-edit`);
  editButton.textContent = 'Edit';

  editTaskId = null;
  isEditing = false;
  todoInput.value = '';
  renderTodoList();
  saveToStorage();
}


function deleteTask(taskId) {
  const taskIndex = todoList.findIndex(task => task.id === taskId);
  todoList.splice(taskIndex, 1);

  renderTodoList();
  saveToStorage();
}

function handleCheckboxChange(event) {
  if (editTaskId !== null) {
    const editButton = document.querySelector(`label[for="${editTaskId}"] .todo-task-edit`);
    editButton.textContent = 'Edit';

    editTaskId = null;
    isEditing = false;
    todoInput.value = '';
  }

  const taskId = event.target.id;
  const task = todoList.find(task => task.id === taskId);
  task.isCompleted = event.target.checked;

  const taskNameElement = document.querySelector(`label[for="${taskId}"] .todo-task-name`);
  if (task.isCompleted) {
    taskNameElement.classList.add('completed');
  } else {
    taskNameElement.classList.remove('completed');
  }

  saveToStorage();
}


function setActiveFilter() {
  document.querySelectorAll('.todo-filters span')
    .forEach(span => {
      span.classList.remove('active');
    });
  
  document.getElementById(currentFilter).classList.add('active');
}

function saveToStorage() {
  localStorage.setItem('todoList', JSON.stringify(todoList));
}