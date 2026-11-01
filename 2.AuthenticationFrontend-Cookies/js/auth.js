// Clear browser session and redirect to login page
function clearSession() {
  window.location.replace("./index.html")
}

// Logout by revoking JWT on backend and clearing cookie
async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include"
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || "Logout failed")
    }

    // Store only logout success message, not JWT
    sessionStorage.setItem("logoutMessage", result.message || "Logout successful!!")

    clearSession()
  } catch (error) {
    console.error("Logout API failed:", error)
    alert(error.message || "Unable to logout")
  }
}
