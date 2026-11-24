
import './sentEmails.css'

function SentEmails({ emails = [] }) {
  return (
    <div className="sent-container">
      <div className="sent-header">
        <div>
          <h1>Sent Emails</h1>
          <p>View your email sending history</p>
        </div>

        <div className="sent-count">
          <h3>{emails.length}</h3>
          <span>Total Sent</span>
        </div>
      </div>

      <div className="email-table">
        <table>
          <thead>
            <tr>
              <th>Receiver</th>
              <th>Subject</th>
              <th>Sent Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {emails.length > 0 ? (
              emails.map((email) => (
                <tr key={email.jobId}>
                  <td>{email.receiver}</td>
                  <td>{email.subject}</td>
                  <td>{email.date}</td>
                  <td>{email.time}</td>

                  <td>
                    <span className="sent-status">
                      <span className="status-dot"></span>
                      Sent
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-message">
                  <div>
                    <h3>No sent emails yet</h3>
                    <p>Your sent email history will appear here.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SentEmails

