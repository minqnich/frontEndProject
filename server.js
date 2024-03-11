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
            return res.status(401).sendFile(path.join(__dirname, 'public', 'login.html'));
        }

        // Check if the user is admin
        const user = results[0];
        if (user.email === 'admin' && user.password === 'admin') {
            res.redirect('/categoryManage.html'); // Redirect to the admin dashboard
        } else {
            res.redirect('/home.html'); // Redirect to the user profile page
        }
    });
});

// add category section
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).send('Error executing SQL query: ' + err.message);
        }
        const categories = results.map(result => {
            return { id: result.id, category_name: result.category_name };
        });
        res.json(categories); // ส่งข้อมูลหมวดหมู่กลับไปยังหน้าเว็บไซต์ Category Management ในรูปแบบ JSON
    });
});

app.post('/api/addCategory', (req, res) => {
    const { category_name } = req.body;
  
    // เพิ่มหมวดหมู่ลงในฐานข้อมูล
    const sql = 'INSERT INTO categories (category_name) VALUES (?)';
    connection.query(sql, [category_name], (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).send('Error executing SQL query: ' + err.message);
      }
      console.log('Category added successfully:', result);
      res.sendStatus(200); // ส่งกลับสถานะ 200 OK เมื่อเพิ่มหมวดหมู่สำเร็จ
    });
});

app.delete('/api/deleteCategory/:id', (req, res) => {
    const categoryId = req.params.id;
    // Validate categoryId before using it in the query
    if (!categoryId) {
        console.error('Invalid category ID:', categoryId);
        res.status(400).send('Invalid category ID');
        return;
    }
    connection.query('DELETE FROM categories WHERE id = ?', categoryId, (error, results) => {
        if (error) {
            console.error('Error deleting category:', error);
            res.status(500).send('Failed to delete category');
            return;
        }
        console.log('Category deleted successfully');
        res.sendStatus(200);
    });
});


  
// Update category
app.put('/api/updateCategory/:id', (req, res) => {
    const id = req.params.id;
    const newName = req.body.category_name;
  
    // ตรวจสอบว่ามีข้อมูลที่ถูกส่งมาหรือไม่
    if (!newName || newName.trim() === '') {
      return res.status(400).send('Category name cannot be empty');
    }
  
    // อัพเดตหมวดหมู่ในฐานข้อมูล
    const sql = 'UPDATE categories SET category_name = ? WHERE id = ?';
    connection.query(sql, [newName, id], (err, result) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).send('Error updating category');
      }
      console.log('Category updated successfully:', result);
      res.sendStatus(200);
    });
});

  



// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
