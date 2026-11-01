const loginForm = document.getElementById("loginForm")
const message = document.getElementById("message")

// Display logout success message if redirected after logout
const logoutMessage = sessionStorage.getItem("logoutMessage")

if (logoutMessage) {
  message.style.color = "green"
  message.textContent = logoutMessage
  sessionStorage.removeItem("logoutMessage")
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  message.textContent = ""
  message.style.color = "red"

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ username, password })
    })

    const result = await response.json()

    if (!response.ok) {
      message.textContent = result.message
      return
    }

    // Browser automatically stores HTTP-only cookie
    // JWT is no longer available in the JSON response

    window.location.href = "./dashboard.html"
  } catch (error) {
    console.error(error)
    message.textContent = "Unable to connect to server"
  }
})
