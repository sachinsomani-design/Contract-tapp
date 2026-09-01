const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Database initialization
const db = new sqlite3.Database(path.join(__dirname, 'contracts.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      vendor TEXT,
      expiryDate TEXT NOT NULL,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      filename TEXT,
      data BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(contract_id) REFERENCES contracts(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id INTEGER NOT NULL,
      reminder_date TEXT,
      is_recurring BOOLEAN DEFAULT 1,
      recurrence_days INTEGER DEFAULT 30,
      last_sent DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(contract_id) REFERENCES contracts(id) ON DELETE CASCADE
    )
  `);
});

// ============ API Routes ============

// Get all contracts
app.get('/api/contracts', (req, res) => {
  db.all('SELECT * FROM contracts ORDER BY expiryDate ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Add a new contract
app.post('/api/contracts', (req, res) => {
  const { name, vendor, expiryDate } = req.body;
  if (!name || !expiryDate) {
    return res.status(400).json({ error: 'Name and expiry date required' });
  }

  db.run(
    'INSERT INTO contracts (name, vendor, expiryDate) VALUES (?, ?, ?)',
    [name, vendor, expiryDate],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, name, vendor, expiryDate });
    }
  );
});

// Update a contract
app.put('/api/contracts/:id', (req, res) => {
  const { name, vendor, expiryDate } = req.body;
  db.run(
    'UPDATE contracts SET name = ?, vendor = ?, expiryDate = ? WHERE id = ?',
    [name, vendor, expiryDate, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// Delete a contract
app.delete('/api/contracts/:id', (req, res) => {
  db.run('DELETE FROM contracts WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Upload attachment
app.post('/api/contracts/:id/attachments', (req, res) => {
  const { filename, data } = req.body;
  db.run(
    'INSERT INTO attachments (contract_id, filename, data) VALUES (?, ?, ?)',
    [req.params.id, filename, Buffer.from(data, 'base64')],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// Get attachments for a contract
app.get('/api/contracts/:id/attachments', (req, res) => {
  db.all(
    'SELECT id, filename, created_at FROM attachments WHERE contract_id = ?',
    [req.params.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Create reminder
app.post('/api/reminders', (req, res) => {
  const { contractId, reminderDate, isRecurring, recurrenceDays } = req.body;
  db.run(
    'INSERT INTO reminders (contract_id, reminder_date, is_recurring, recurrence_days) VALUES (?, ?, ?, ?)',
    [contractId, reminderDate, isRecurring ? 1 : 0, recurrenceDays || 30],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// ============ Google Calendar Integration ============
const calendar = google.calendar('v3');

// Create Google Calendar event for contract expiry
app.post('/api/calendar/create-event', async (req, res) => {
  try {
    const { contractName, expiryDate, vendor } = req.body;
    
    // This would require OAuth setup - for now, return event template
    const eventTemplate = {
      summary: `Contract Renewal: ${contractName}`,
      description: `Vendor: ${vendor}\nPlease remember to renew this contract.`,
      start: { dateTime: new Date(expiryDate).toISOString() },
      end: { dateTime: new Date(new Date(expiryDate).getTime() + 3600000).toISOString() },
      recurrence: ['RRULE:FREQ=DAILY;INTERVAL=30'],
      reminders: { useDefault: true }
    };

    res.json({ 
      success: true, 
      message: 'Calendar event template created. Use Google Calendar API to add to your calendar.',
      event: eventTemplate 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ Scheduled Reminders (Cron) ============
// Check for contracts expiring soon and send reminders
cron.schedule('0 9 * * *', () => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all(`
    SELECT c.id, c.name, c.vendor, c.expiryDate, r.id as reminder_id
    FROM contracts c
    LEFT JOIN reminders r ON c.id = r.contract_id
    WHERE c.expiryDate <= date('now', '+30 days')
    AND c.expiryDate >= ?
  `, [today], (err, rows) => {
    if (err) {
      console.error('Cron job error:', err);
      return;
    }

    rows.forEach(contract => {
      console.log(`Reminder: Contract "${contract.name}" from ${contract.vendor} expires on ${contract.expiryDate}`);
      // Here you would send an email via a service like Nodemailer or call Google Gmail API
    });
  });
});

// ============ Server Start ============
app.listen(PORT, () => {
  console.log(`Contract Tracker server running on http://localhost:${PORT}`);
  console.log('Database: contracts.db');
  console.log('Reminder scheduler active');
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error(err);
    console.log('Database connection closed');
    process.exit(0);
  });
});
