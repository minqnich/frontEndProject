const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');



const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/style_header.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'style_header.css'), {
        headers: {
            'Content-Type': 'text/css'
        }
    });
});

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'nicha12345', 
    database: 'PROJECT_frontend'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign_up.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/signup', (req, res) => {
    const { email, password, confirmPassword } = req.body;
    console.log('Received form data:', req.body);

    // Check if email, password, and confirmPassword are provided
    if (!email || !password || !confirmPassword) {
        return res.status(400).send('Email, password, and confirmPassword are required');
    }

    // Check if password matches confirmPassword
    if (password !== confirmPassword) {
        return res.status(400).send('Password and Confirm password do not match. Please try again.');
    }

    // Insert user into the database
    const sql = 'INSERT INTO users (email, password, confirmPassword) VALUES (?, ?, ?)';
    connection.query(sql, [email, password, confirmPassword], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error executing SQL query: ' + err.message);
        }
        console.log('User saved successfully:', result);
        res.redirect('/login.html'); // Redirect to success page after sign up
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Received login data:', req.body);

    if (!email || !password) {
        // ถ้าไม่มี email หรือ password ให้แสดงข้อความผิดพลาด
        return res.status(400).sendFile(path.join(__dirname, 'public', 'login.html'));
    }

    // ตรวจสอบ email และ password ในฐานข้อมูล
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error executing SQL query: ' + err.message);
        }

        if (results.length === 0) {
            // ถ้าไม่พบผู้ใช้ในฐานข้อมูล ให้แสดงข้อความผิดพลาด
              
            return res.status(401).sendFile(path.join(__dirname, 'public', 'login.html'));
        }

        // ถ้าล็อกอินสำเร็จ ก็ทำการ redirect ไปยังหน้า home.html
        res.redirect('/home.html');
    });
});




// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
