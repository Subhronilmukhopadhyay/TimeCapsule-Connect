import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import 'dotenv/config';

const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * One definition of the session cookie for every sign-in path.
 *
 * Production serves the client and API from different hosts, so the cookie must
 * be SameSite=None; Secure. Locally both are on localhost (cookies ignore the
 * port) where Lax works and None would be rejected outright for lacking Secure.
 */
export const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'None' : 'Lax',
  maxAge: 3600000,
});

export const registerUser = async (req, res) => {
  try {
    // console.log(req.body);
    const { name, username, email, phoneNo, password, confirmPassword, dateOfBirth } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Compare case-insensitively so "Ada@x.com" cannot become a second account
    // alongside "ada@x.com" — the Google merge looks users up the same way.
    const checkUserQuery = 'SELECT id, google_id FROM userlogin WHERE LOWER(email) = LOWER($1)';
    const existingEmail = await pool.query(checkUserQuery, [email]);

    if (existingEmail.rows.length > 0) {
      if (existingEmail.rows[0].google_id) {
        return res.status(400).json({
          error: 'This email already signs in with Google. Use "Continue with Google" instead.',
        });
      }
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

    res.cookie('token', token, sessionCookieOptions());

    res.status(201).json({ message: 'User registered successfully', userId: newUser.rows[0].id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    // console.log('Received CSRF header:', req.headers['x-csrf-token']);
    const { email, password } = req.body;

    const query =
      'SELECT id, username, email, password, google_id FROM userlogin WHERE LOWER(email) = LOWER($1)';
    const { rows } = await pool.query(query, [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];

    // Accounts created through Google have no password to compare against.
    if (!user.password) {
      return res.status(401).json({
        error: 'This account uses Google sign-in. Use "Continue with Google" to log in.',
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, sessionCookieOptions());

    // Never ship the password hash back to the browser.
    const { password: _password, ...safeUser } = user;
    res.json({ message: 'Login successful', user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Logout route
export const logout = async (req, res) => {
  // clearCookie only matches when the attributes match how it was set.
  const { maxAge: _maxAge, ...options } = sessionCookieOptions();
  res.clearCookie('token', options);
  res.status(200).json({ message: 'Logged out successfully' });
};