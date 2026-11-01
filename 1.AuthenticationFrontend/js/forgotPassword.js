const forgotPasswordForm = document.getElementById("forgotPasswordForm")
const resetPasswordBtn = document.getElementById("resetPasswordBtn")
const message = document.getElementById("message")

forgotPasswordForm.addEventListener("submit", async event => {
  event.preventDefault()

  message.textContent = ""
  message.style.color = "red"

  // Step 1: Read form fields
  const userCode = document.getElementById("userCode").value.trim()
  const password = document.getElementById("newPassword").value
  const retype = document.getElementById("retypePassword").value

  // Step 2: Validate fields
  if (!userCode || !password || !retype) {
    message.textContent = "All fields are required"
    return
  }

  // Step 3: Case-sensitive password comparison
  if (password !== retype) {
    message.textContent = "Password and confirm password do not match"
    return
  }

  // Step 4: Prepare request body
  const requestBody = {
    password,
    retype
  }

  try {
    resetPasswordBtn.disabled = true

    // Step 5: Call PATCH API
    const response = await fetch(
      `${API_BASE_URL}/forgetpassword/user/${encodeURIComponent(userCode)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    )

    // Step 6: Read API response
    const result = await response.json()

    // Step 7: Handle API errors
    if (!response.ok) {
      message.textContent = result.message || "Password update failed"
      return
    }

    // Step 8: Display success
    message.style.color = "green"
    message.textContent = result.message || "Password updated successfully"

    // Step 9: Clear form
    forgotPasswordForm.reset()
  } catch (error) {
    console.error(error)
    message.textContent = "Unable to connect to server"
  } finally {
    resetPasswordBtn.disabled = false
  }
})
