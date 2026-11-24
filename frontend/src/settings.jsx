
import './settings.css'

function Settings() {
  return (
    <div className="settings-container">
      <h1>Settings</h1>
      <p>Manage your account preferences</p>

      <div className="settings-card">
        <h2>Profile Settings</h2>

        <label>Name</label>
        <input type="text" placeholder="Enter your name" />

        <label>Email Address</label>
        <input type="email" placeholder="Enter your email" />

        <h2>Email Preferences</h2>

        <label>
          <input type="checkbox" defaultChecked />
          Email notifications
        </label>

        <label>
          <input type="checkbox" />
          Daily email summary
        </label>

        <button>Save Settings</button>
      </div>
    </div>
  )
}

export default Settings
