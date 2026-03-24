import express from 'express';
import mysql from 'mysql2/promise';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection
let db;
async function initDB() {
  try {
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'ali51214',  // your MySQL password
      database: 'Proctorai'
    });
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}
await initDB();

// ------------------- Signup -------------------
app.post('/signupstudent', async (req, res) => {
  try {
    const { studentid, username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    const sql = 'INSERT INTO signupstudent (studentid, username, email, password) VALUES (?, ?, ?, ?)';
    await db.execute(sql, [parseInt(studentid), username, email, hashedPassword]);

    res.send('Signup successful');
  } catch (err) {
    console.error('Signup error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).send('Student ID or Email already exists');
    } else {
      res.status(500).send('Error creating student');
    }
  }
});

// ------------------- Login -------------------
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.execute('SELECT * FROM signupstudent WHERE email = ?', [email]);

    if (rows.length === 0) return res.status(400).send({ message: 'Email not found' });

    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) return res.status(400).send({ message: 'Incorrect password' });

    res.send({ message: 'Login successful', student: { studentid: rows[0].studentid, username: rows[0].username, email: rows[0].email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ message: 'Database error' });
  }
});

// ------------------- Get all students -------------------
app.get('/students', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT studentid, username, email FROM signupstudent');
    res.json(rows);
  } catch (err) {
    console.error('Fetch students error:', err);
    res.status(500).send({ message: 'Database error fetching students' });
  }
});

// ------------------- Check email for forgot password -------------------
app.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const [rows] = await db.execute('SELECT * FROM signupstudent WHERE email = ?', [email]);

    if (rows.length === 0) return res.send('Email not found');
    res.send('Email exists');
  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).send('Database error');
  }
});

// ------------------- Start server -------------------
app.listen(3000, () => console.log('Server running on http://localhost:3000'));