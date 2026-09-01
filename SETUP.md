# Google Calendar Integration Setup

## Steps to Enable Google Calendar Reminders:

1. Go to https://console.cloud.google.com/
2. Create a new project: "Contract Tracker"
3. Enable the Google Calendar API
4. Enable the Gmail API
5. Create OAuth 2.0 credentials (Desktop app type)
6. Download the credentials JSON
7. Save it as credentials.json in this directory

## Environment Variables

Create a .env file in this directory:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
REMINDER_EMAIL=legal@tractorjunction.com
DATABASE_PATH=./contracts.db
PORT=3000
```

## Running the Server

```bash
npm install
npm start
```

The server will run on http://localhost:3000 and serve the frontend + API.

## API Endpoints

- GET /api/contracts - List all contracts
- POST /api/contracts - Add new contract
- PUT /api/contracts/:id - Update contract
- DELETE /api/contracts/:id - Delete contract
- POST /api/contracts/:id/attachments - Upload file
- GET /api/contracts/:id/attachments - List attachments
- POST /api/reminders - Create reminder
- POST /api/calendar/create-event - Create calendar event
