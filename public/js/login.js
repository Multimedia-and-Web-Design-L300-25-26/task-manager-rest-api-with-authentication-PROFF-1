const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const statusMessage = document.getElementById("statusMessage");

const TOKEN_KEY = "task_manager_token";

const updateStatus = (message, isError = false) => {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#ff91a1" : "#b8c3ff";
};

const request = async (url, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
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
    updateStatus("Registration successful. You can login now.");
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

    localStorage.setItem(TOKEN_KEY, token);
    updateStatus("Login successful. Redirecting to tasks...");

    setTimeout(() => {
      window.location.href = "/tasks";
    }, 300);
  } catch (error) {
    updateStatus(error.message, true);
  }
});

const existingToken = localStorage.getItem(TOKEN_KEY);
if (existingToken) {
  updateStatus("Token already exists. Go to /tasks to continue.");
}
