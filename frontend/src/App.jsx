
import { useState, useEffect } from 'react'
import Settings from './settings.jsx'
import SentEmails from './sentEmails.jsx'
import ScheduledEmails from './scheduleEmails.jsx'
import FailedEmails from './failedEmails.jsx'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import ComposeEmail from './composeEmail'
import './App.css'

const API_URL = 'https://reachinbox-email-scheduler-46qd.onrender.com'

function Dashboard({ emails }) {
  const scheduled = emails.filter(email => email.status === 'scheduled')
  const sent = emails.filter(email => email.status === 'sent')
  const failed = emails.filter(email => email.status === 'failed')

  return (
    <main className="main">
      <h1>Dashboard</h1>
      <p>Welcome to your Email Scheduler!</p>

      <div className="stats">
        <div className="card">
          <h3>Total Emails</h3>
          <h2>{emails.length}</h2>
        </div>

        <div className="card">
          <h3>Scheduled</h3>
          <h2>{scheduled.length}</h2>
        </div>

        <div className="card">
          <h3>Sent</h3>
          <h2>{sent.length}</h2>
        </div>

        <div className="card">
          <h3>Failed</h3>
          <h2>{failed.length}</h2>
        </div>
      </div>

      <div className="welcome">
        <h2>Manage Your Emails Easily</h2>
        <p>Schedule, send and track your emails in one place.</p>

        <Link to="/compose">
          <button>Compose New Email</button>
        </Link>
      </div>
    </main>
  )
}

function App() {
  const [emails, setEmails] = useState([])
  const [error, setError] = useState('')
  const [retryingId, setRetryingId] = useState(null)

  async function loadEmails() {
    try {
      const response = await fetch(`${API_URL}/status`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to fetch emails')
      }

      setEmails(data.jobs || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Backend connection failed')
    }
  }

  useEffect(() => {
    loadEmails()

    const interval = setInterval(loadEmails, 5000)

    return () => clearInterval(interval)
  }, [])

  async function handleScheduleEmail(email) {
    const scheduledAt = new Date(
      `${email.date}T${email.time}`
    ).toISOString()

    const response = await fetch(`${API_URL}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.receiver,
        subject: email.subject,
        body: email.message,
        scheduledAt
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Email scheduling failed')
    }

    await loadEmails()
    return data
  }

  async function handleCancelEmail(jobId) {
    try {
      const response = await fetch(`${API_URL}/cancel/${jobId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Email cancellation failed')
      }

      await loadEmails()
      alert('Email cancelled successfully!')
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleRescheduleEmail(jobId, date, time) {
    try {
      const scheduledAt = new Date(
        `${date}T${time}`
      ).toISOString()

      const response = await fetch(`${API_URL}/reschedule/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduledAt })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Rescheduling failed')
      }

      await loadEmails()
      alert('Email rescheduled successfully!')
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleRetryEmail(jobId) {
    try {
      setRetryingId(jobId)

      const response = await fetch(`${API_URL}/retry/${jobId}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Email retry failed')
      }

      await loadEmails()
      alert('Email sent successfully!')
    } catch (err) {
      alert(err.message || 'Unable to retry email')
      await loadEmails()
    } finally {
      setRetryingId(null)
    }
  }

  const scheduledEmails = emails
    .filter(email => email.status === 'scheduled')
    .map(email => {
      const date = new Date(email.scheduledAt)

      return {
        ...email,
        receiver: email.to,
        date: [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0')
        ].join('-'),
        time: [
          String(date.getHours()).padStart(2, '0'),
          String(date.getMinutes()).padStart(2, '0')
        ].join(':')
      }
    })

  const sentEmails = emails
    .filter(email => email.status === 'sent')
    .map(email => ({
      ...email,
      receiver: email.to,
      date: new Date(email.sentAt || email.scheduledAt).toLocaleDateString('en-GB'),
      time: new Date(email.sentAt || email.scheduledAt).toLocaleTimeString()
    }))

  const failedEmails = emails
    .filter(email => email.status === 'failed')
    .map(email => ({
      ...email,
      receiver: email.to,
      date: new Date(email.scheduledAt).toLocaleDateString('en-GB'),
      time: new Date(email.scheduledAt).toLocaleTimeString()
    }))

  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <h2>ReachInbox</h2>

          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/compose">Compose Email</Link>
            <Link to="/scheduled">Scheduled Emails</Link>
            <Link to="/sent">Sent Emails</Link>
            <Link to="/failed">Failed Emails</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </aside>

        <div>
          {error && <p>{error}</p>}
        </div>

        <Routes>
          <Route
            path="/"
            element={<Dashboard emails={emails} />}
          />

          <Route
            path="/compose"
            element={<ComposeEmail onSchedule={handleScheduleEmail} />}
          />

          <Route
            path="/scheduled"
            element={
              <ScheduledEmails
                emails={scheduledEmails}
                onCancel={handleCancelEmail}
                onReschedule={handleRescheduleEmail}
              />
            }
          />

          <Route
            path="/sent"
            element={<SentEmails emails={sentEmails} />}
          />

          <Route
            path="/failed"
            element={
              <FailedEmails
                emails={failedEmails}
                onRetry={handleRetryEmail}
                retryingId={retryingId}
              />
            }
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
