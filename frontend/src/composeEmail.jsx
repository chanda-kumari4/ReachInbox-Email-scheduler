
import { useState } from 'react'
import './composeEmail.css'

function ComposeEmail({ onSchedule }) {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('')

    const form = e.target

    const email = {
      receiver: form.receiver.value,
      subject: form.subject.value,
      message: form.message.value,
      date: form.date.value,
      time: form.time.value
    }

    const scheduledDateTime = new Date(
      `${email.date}T${email.time}`
    )

    if (scheduledDateTime <= new Date()) {
      setStatus('Please select a future date and time.')
      return
    }

    try {
      setLoading(true)

      const result = await onSchedule(email)

      setStatus(result.message || 'Email scheduled successfully!')
      form.reset()
    } catch (error) {
      setStatus(error.message || 'Failed to schedule email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="compose-container">
      <h1>Compose Email</h1>
      <p>Schedule a new email</p>

      <form className="email-form" onSubmit={handleSubmit}>
        <label>Receiver Email</label>
        <input
          type="email"
          name="receiver"
          placeholder="Enter receiver email"
          required
        />

        <label>Subject</label>
        <input
          type="text"
          name="subject"
          placeholder="Enter email subject"
          required
        />

        <label>Message</label>
        <textarea
          name="message"
          placeholder="Write your message..."
          rows="6"
          required
        />

        <label>Schedule Date</label>
        <input type="date" name="date" required />

        <label>Schedule Time</label>
        <input type="time" name="time" required />

        <button type="submit" disabled={loading}>
          {loading ? 'Scheduling...' : 'Schedule Email'}
        </button>

        {status && <p role="status">{status}</p>}
      </form>
    </div>
  )
}

export default ComposeEmail

