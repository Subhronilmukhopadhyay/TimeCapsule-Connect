import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import 'dotenv/config';

// ✅ User Registration
export const registerUser = async (req, res) => {
  try {
    const { username, email, phoneNo, password, confirmPassword, dateOfBirth } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // ✅ Check if user already exists (Prevents duplicate registrations)
    const checkUserQuery = 'SELECT id FROM UserLogin WHERE email = $1';
    const existingUser = await pool.query(checkUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // ✅ Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert new user into the database (Prevent SQL injection with parameterized query)
    const insertUserQuery = 'INSERT INTO userlogin (username, email, phone_no, password, date_of_birth) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const newUser = await pool.query(insertUserQuery, [username, email, phoneNo, hashedPassword, dateOfBirth]);

    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.rows[0].id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ✅ User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Secure Query to Prevent SQL Injection
    const query = 'SELECT id, email, password FROM UserLogin WHERE email = $1';
    const { rows } = await pool.query(query, [email]);

    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];

    // ✅ Secure Password Hash Comparison
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // ✅ Secure JWT Token with HTTP-Only Cookie
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,   // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'Strict', // Prevents CSRF
      maxAge: 3600000, // 1 hour
    });

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
