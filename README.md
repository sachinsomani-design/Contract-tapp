# 📋 Contract Expiry Tracker - Full Stack

A powerful contract management system with real-time tracking, Google Calendar integration, and automated reminders.

## Features

✅ **Contract Management**
- Add, edit, and delete contracts
- Track vendor/partner information
- Set custom expiry dates

✅ **Smart Alerts**
- Real-time expiry status tracking
- Upcoming alerts dashboard
- Categorized by status (Active, Expiring Soon, Expired)

✅ **File Attachments**
- Upload contract documents
- Store PDFs, images, and text files
- Organize by contract

✅ **Google Calendar Integration**
- Auto-create calendar events for contract renewals
- Set recurring reminders (every 30 days by default)
- Sync with your Google Calendar

✅ **Email Reminders**
- Send reminder emails to your legal team
- Customizable recipient (default: legal@tractorjunction.com)
- Scheduled cron jobs for automatic reminders

✅ **Import/Export**
- Export contracts to CSV
- Import contracts from CSV file
- Easy data portability

✅ **Persistent Database**
- SQLite backend
- All data stored locally
- No data loss on browser close

✅ **Scheduled Reminders**
- Automated daily reminders at 9 AM
- Recurring reminder scheduler
- 30-day recurring intervals

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Scheduler**: node-cron
- **APIs**: Google Calendar API, Gmail API
- **CORS**: Enabled for frontend-backend communication

## Quick Start

### Prerequisites
- Node.js (v14+)
- npm
- Google Cloud account (for Calendar/Gmail integration)

### Installation

1. **Clone/Setup**
   ```bash
   cd Contract-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Google credentials
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the app**
   ```
   http://localhost:3000/app.html
   ```

## Project Structure

```
Contract-tracker/
├── index.html           # Original static version
├── app.html            # New API-connected frontend
├── server.js           # Express backend
├── package.json        # Node.js dependencies
├── contracts.db        # SQLite database (created on first run)
├── .env.example        # Environment template
├── SETUP.md            # Google Calendar setup guide
└── README.md           # This file
```

## API Endpoints

### Contracts
- `GET /api/contracts` - List all contracts
- `POST /api/contracts` - Create new contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

### Attachments
- `POST /api/contracts/:id/attachments` - Upload file
- `GET /api/contracts/:id/attachments` - List files

### Reminders
- `POST /api/reminders` - Create reminder
- `POST /api/calendar/create-event` - Generate calendar event

## Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Calendar API and Gmail API
4. Create OAuth 2.0 credentials (Desktop app)
5. Download credentials.json
6. Copy credentials to project directory
7. Update `.env` file with credentials

See [SETUP.md](SETUP.md) for detailed steps.

## Usage

### Adding a Contract
1. Click "Add Contract" tab
2. Enter contract name, vendor, and expiry date
3. Click "Add Contract"

### Setting Reminders
1. Click "Reminder" tab
2. Set reminder date and recurrence interval
3. Enable "recurring reminder" checkbox
4. Use "Open Reminder Email" or "Add to Google Calendar" buttons

### Exporting Data
1. Go to "All Contracts" section
2. Click "Export CSV"
3. File downloads to your computer

### Importing Data
1. Go to "All Contracts" section
2. Click "Import CSV"
3. Select a CSV file
4. Contracts are added automatically

## Scheduled Reminders

The server runs a cron job at **9 AM every day** to:
- Check for contracts expiring within 30 days
- Log reminder messages
- (Optional) Send emails to your legal team

Configure the schedule in `server.js`:
```javascript
cron.schedule('0 9 * * *', () => {
  // Runs at 9 AM daily
});
```

## Database Schema

### Contracts Table
```sql
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  vendor TEXT,
  expiryDate TEXT NOT NULL,
  status TEXT,
  created_at DATETIME
);
```

### Reminders Table
```sql
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY,
  contract_id INTEGER,
  reminder_date TEXT,
  is_recurring BOOLEAN,
  recurrence_days INTEGER,
  last_sent DATETIME
);
```

### Attachments Table
```sql
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY,
  contract_id INTEGER,
  filename TEXT,
  data BLOB,
  created_at DATETIME
);
```

## Customization

### Change Reminder Email
Edit `server.js` line 129:
```javascript
REMINDER_EMAIL=your-email@company.com
```

### Change Recurring Interval
Default is 30 days. Modify in `server.js`:
```javascript
recurrence: ['RRULE:FREQ=DAILY;INTERVAL=30']
```

### Change Cron Schedule
Edit `server.js` line 149 for different reminder time:
```javascript
cron.schedule('0 14 * * *', () => { // 2 PM daily
```

## Troubleshooting

**Port 3000 already in use?**
```bash
# Change PORT in .env
PORT=3001
```

**SQLite database locked?**
```bash
# Delete contracts.db and restart
rm contracts.db
npm start
```

**Google Calendar not working?**
- Verify credentials.json is in project directory
- Check .env has correct GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- See SETUP.md for detailed configuration

**CORS errors?**
- Ensure frontend and backend are on the same origin
- Check server.js has `cors()` middleware enabled

## Production Deployment

For production use:

1. Use a production database (PostgreSQL, MySQL)
2. Set up proper OAuth flow for Google integration
3. Use environment variables for secrets
4. Add authentication/authorization
5. Deploy to Heroku, AWS, or similar
6. Set up SSL/HTTPS

Example production start:
```bash
NODE_ENV=production npm start
```

## Support

For issues or questions:
1. Check the logs in terminal
2. Review SETUP.md for configuration issues
3. Verify all dependencies are installed: `npm install`
4. Check that port 3000 is available

## License

MIT

## Next Steps

- ✅ Basic contract tracker
- ✅ Google Calendar integration
- ✅ CSV import/export
- ✅ Attachment support
- ⬜ Email notifications via Nodemailer
- ⬜ User authentication
- ⬜ Team collaboration
- ⬜ Webhook notifications
- ⬜ Mobile app
