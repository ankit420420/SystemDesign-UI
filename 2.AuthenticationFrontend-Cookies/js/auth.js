// Redirect to login page
function clearSession() {
  window.location.replace("./index.html")
}

// Get CSRF token from backend
async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/getCSRFToken`, {
    method: "GET",
    credentials: "include"
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Failed to retrieve CSRF token")
  }

  return result.data.csrfToken
}

// Logout by revoking JWT and deleting HTTP-only cookie
async function logout() {
  try {
    // Step 1: Get CSRF token
    const csrfToken = await getCsrfToken()

    // Step 2: Send logout request with JWT cookie and CSRF token
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrfToken
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Logout failed")
    }

    // Step 3: Show logout message on login page
    sessionStorage.setItem("logoutMessage", result.message || "Logout successful!!")

    // Step 4: Redirect
    clearSession()
  } catch (error) {
    console.error("Logout API failed:", error)
    alert(error.message || "Unable to logout")
  }
}
