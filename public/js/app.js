const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const statusMessage = document.getElementById("statusMessage");
const tokenInput = document.getElementById("tokenInput");
const saveTokenButton = document.getElementById("saveTokenButton");
const refreshTasksButton = document.getElementById("refreshTasksButton");
const logoutButton = document.getElementById("logoutButton");

const TOKEN_KEY = "task_manager_token";

const updateStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#ff91a1" : "#b8c3ff";
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  tokenInput.value = token;
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  tokenInput.value = "";
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

const createTaskElement = (task) => {
  const item = document.createElement("li");
  item.className = "task-item";

  const info = document.createElement("div");

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-desc";
  description.textContent = task.description || "No description";

  info.appendChild(title);
  info.appendChild(description);

  const deleteButton = document.createElement("button");
  deleteButton.className = "danger";
  deleteButton.textContent = "Delete";

  deleteButton.addEventListener("click", async () => {
    try {
      const token = getToken();
      if (!token) {
        updateStatus("Login first to delete tasks.", true);
        return;
      }

      await request(`/api/tasks/${task._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      updateStatus("Task deleted.");
      await loadTasks();
    } catch (error) {
      updateStatus(error.message, true);
    }
  });

  item.appendChild(info);
  item.appendChild(deleteButton);

  return item;
};

const loadTasks = async () => {
  taskList.innerHTML = "";

  try {
    const token = getToken();

    if (!token) {
      updateStatus("No token found. Login or paste a token.");
      return;
    }

    const tasks = await request("/api/tasks", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (tasks.length === 0) {
      updateStatus("No tasks found for this user.");
      return;
    }

    tasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });

    updateStatus(`Loaded ${tasks.length} task(s).`);
  } catch (error) {
    updateStatus(error.message, true);
  }
};

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    registerForm.reset();
    updateStatus("Registration successful. Login now.");
  } catch (error) {
    updateStatus(error.message, true);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { token } = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    setToken(token);
    loginForm.reset();
    updateStatus("Login successful.");

    await loadTasks();
  } catch (error) {
    updateStatus(error.message, true);
  }
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const token = getToken();
    if (!token) {
      updateStatus("Login first to create tasks.", true);
      return;
    }

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();

    await request("/api/tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description })
    });

    taskForm.reset();
    updateStatus("Task created.");

    await loadTasks();
  } catch (error) {
    updateStatus(error.message, true);
  }
});

saveTokenButton.addEventListener("click", () => {
  const value = tokenInput.value.trim();
  if (!value) {
    updateStatus("Paste a token first.", true);
    return;
  }

  setToken(value);
  updateStatus("Token saved. You can now load tasks.");
});

refreshTasksButton.addEventListener("click", () => {
  loadTasks();
});

logoutButton.addEventListener("click", () => {
  clearToken();
  taskList.innerHTML = "";
  updateStatus("Token cleared.");
});

const boot = () => {
  const existingToken = getToken();
  if (existingToken) {
    tokenInput.value = existingToken;
    loadTasks();
  }
};

boot();
