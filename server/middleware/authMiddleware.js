import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import 'dotenv/config';
export const registerUser = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, username, email, phoneNo, password, confirmPassword, dateOfBirth } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const checkUserQuery = 'SELECT id FROM userlogin WHERE email = $1';
    const existingEmail = await pool.query(checkUserQuery, [email]);

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const usernameCheckQuery = 'SELECT id FROM userlogin WHERE username = $1';
    const existingUsername = await pool.query(usernameCheckQuery, [username]);

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ error: 'Username already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = 'INSERT INTO userlogin (name, username, email, phone_no, password, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
    const newUser = await pool.query(insertUserQuery, [name, username, email, phoneNo, hashedPassword, dateOfBirth]);
    const token = jwt.sign({ id: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000, 
    });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.rows[0].id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = 'SELECT id, email, password FROM userlogin WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 3600000,
    });

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
