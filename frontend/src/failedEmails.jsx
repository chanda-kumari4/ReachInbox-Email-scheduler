
import './failedEmails.css'

function FailedEmails({ emails = [], onRetry, retryingId }) {
  return (
    <div className="failed-container">
      <div className="failed-header">
        <div>
          <h1>Failed Emails</h1>
          <p>View and retry emails that could not be sent</p>
        </div>

        <div className="failed-count">
          <h2>{emails.length}</h2>
          <span>Total Failed</span>
        </div>
      </div>

      <div className="failed-table">
        <table>
          <thead>
            <tr>
              <th>Receiver</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Error</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {emails.length > 0 ? (
              emails.map(email => (
                <tr key={email.jobId}>
                  <td>{email.receiver}</td>
                  <td>{email.subject}</td>
                  <td>{email.date}</td>
                  <td>{email.time}</td>
                  <td className="error-text">
                    {email.error || 'Email sending failed'}
                  </td>
                  <td>
                    <span className="failed-status">Failed</span>
                  </td>
                  <td>
                    <button
                      className="retry-btn"
                      onClick={() => onRetry(email.jobId)}
                      disabled={retryingId === email.jobId}
                    >
                      {retryingId === email.jobId ? 'Retrying...' : 'Retry'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="empty-failed">
                  <h3>No Failed Emails</h3>
                  <p>All your emails are looking good!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FailedEmails
