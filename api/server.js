const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'sogetsu-registration.db'));
db.run('PRAGMA foreign_keys = ON');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

app.post('/api/login', async (req, res) => {
  const { email, pin } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (pin !== 'megumi') {
    return res.status(401).json({ success: false, message: 'Invalid email or PIN' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or PIN' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await dbAll(
      `SELECT course.id, course.date, course.materials, course.am, users.name, users.email
       FROM course
       JOIN users ON course.email = users.email
       ORDER BY course.date ASC, course.am DESC, course.id ASC`
    );
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { date, email, materials, am } = req.body;
  try {
    await dbRun(
      'INSERT INTO course (date, email, materials, am) VALUES (?, ?, ?, ?)',
      [date, email, materials ? 1 : 0, am ? 1 : 0]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.delete('/api/bookings', async (req, res) => {
  const { date, email } = req.body;
  if (!email || !date) {
    return res.status(400).json({ success: false, message: 'Email and date are required' });
  }
  try {
    await dbRun('DELETE FROM course WHERE date = ? AND email = ?', [date, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/api/dates', async (req, res) => {
  try {
    const dates = await dbAll('SELECT date, am, pm FROM dates');
    res.json(dates);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.post('/api/dates', async (req, res) => {
  const { date, am, pm } = req.body;
  try {
    if (!am && !pm) {
      await dbRun('DELETE FROM dates WHERE date = ?', [date]);
    } else {
      await dbRun(
        'INSERT INTO dates (date, am, pm) VALUES (?, ?, ?) ON CONFLICT(date) DO UPDATE SET am = ?, pm = ?',
        [date, am ? 1 : 0, pm ? 1 : 0, am ? 1 : 0, pm ? 1 : 0]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
