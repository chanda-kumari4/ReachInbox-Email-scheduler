
import './scheduleEmails.css'

function ScheduledEmails({ emails = [], onCancel }) {
  return (
    <div className="scheduled-container">
      <h1>Scheduled Emails</h1>
      <p>Manage all your upcoming emails</p>

      <div className="email-table">
        <table>
          <thead>
            <tr>
              <th>Receiver</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
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
                  <td className="pending">Scheduled</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onCancel(email.jobId)}
                    >
                      Cancel Email
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No scheduled emails yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ScheduledEmails


