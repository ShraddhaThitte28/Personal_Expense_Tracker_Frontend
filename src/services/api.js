const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Common request wrapper with JSON serialization, Bearer token injection,
 * and structured error handling.
 */
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    ...options.headers,
  };

  // Attach Content-Type for requests with a payload
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new Error(
      "Unable to connect to the backend server. Please verify the server is running at http://127.0.0.1:8000."
    );
  }

  // Handle 204 No Content (DELETE responses)
  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let message = "Request failed.";
    if (data && data.detail) {
      if (Array.isArray(data.detail)) {
        // Pydantic validation errors (HTTP 422)
        message = data.detail.map((d) => d.msg || "Invalid input").join("; ");
      } else if (typeof data.detail === "string") {
        message = data.detail;
      }
    } else if (response.status === 401) {
      message = "Unauthorized. Please log in again.";
    } else if (response.status === 404) {
      message = "The requested expense was not found.";
    } else if (response.status === 400) {
      message = "Invalid request.";
    } else if (response.status >= 500) {
      message = "Server error occurred. Please try again later.";
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ---------------------------------------------------------------------------
// Authentication Services
// ---------------------------------------------------------------------------

export async function registerUser({ name, email, password }) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ---------------------------------------------------------------------------
// Expense CRUD Services (Protected by Bearer Token)
// ---------------------------------------------------------------------------

export async function getExpenses(token) {
  return request("/expenses", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getExpenseById(token, expenseId) {
  return request(`/expenses/${expenseId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createExpense(token, { amount, category, date, description }) {
  const payload = {
    amount: Number(amount),
    category: category.trim(),
    date,
  };
  if (description !== undefined && description !== null && description.trim() !== "") {
    payload.description = description.trim();
  }

  return request("/expenses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function updateExpense(token, expenseId, { amount, category, date, description }) {
  const payload = {};
  if (amount !== undefined && amount !== null && amount !== "") {
    payload.amount = Number(amount);
  }
  if (category !== undefined && category !== null && category.trim() !== "") {
    payload.category = category.trim();
  }
  if (date !== undefined && date !== null && date !== "") {
    payload.date = date;
  }
  if (description !== undefined) {
    payload.description = description ? description.trim() : null;
  }

  return request(`/expenses/${expenseId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function deleteExpense(token, expenseId) {
  return request(`/expenses/${expenseId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
