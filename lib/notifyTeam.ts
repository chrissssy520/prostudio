export async function notifyTeam(subject: string, message: string, emails: string[]) {
  if (!emails || emails.length === 0) return
  try {
    const baseUrl = typeof window !== "undefined" 
      ? window.location.origin 
      : "http://localhost:3000"
    
    await fetch(`${baseUrl}/api/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails, subject, message }),
    })
  } catch (error) {
    console.error("Failed to notify team:", error)
  }
}