import express from 'express';
import 'dotenv/config';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { registerUser, loginUser } from '../middleware/authMiddleware.js'

const router = express.Router();

// User Registration
// router.post('/register', validateRegister, async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ error: 'Email already in use' });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = new User({ email, password: hashedPassword });
//     await newUser.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.post('/register', validateRegister, registerUser);

// User Login
// router.post('/login', validateLogin, async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

router.post('/login', validateLogin, loginUser);

// router.post('/register', validateLogin, loginUser);


export default router;