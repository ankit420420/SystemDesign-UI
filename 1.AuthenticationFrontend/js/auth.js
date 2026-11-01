function saveToken(token) {
  sessionStorage.setItem("accessToken", token)
}

function getToken() {
  return sessionStorage.getItem("accessToken")
}

// Clear browser session without calling Logout API
function clearSession() {
  sessionStorage.removeItem("accessToken")
  window.location.replace("./index.html")
}

// Logout by revoking JWT on backend
async function logout() {
  const token = getToken()

  if (!token) {
    clearSession()
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!response.ok) {
      console.error("Server-side logout failed:", response.status)
    }
  } catch (error) {
    console.error("Logout API failed:", error)
  } finally {
    clearSession()
  }
}
