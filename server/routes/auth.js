import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'; // <-- install this
import User from '../models/user.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/login', async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ message: 'Missing id_token' });
  }

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { email, name, sub, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        password: "google-oauth",   // placeholder since they never log in with password
        role: "Employee",           // default role
      });
      await user.save();
    }

    // Create your own JWT for session
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    res.json({ message: 'Login successful', user });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Invalid Google login" });
  }
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});


export default router;

