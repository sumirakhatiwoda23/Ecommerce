import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      name, email, password: hashedPassword, isVerified: false, otp, otpExpires
    });

    if (user) {
      const message = `
        <h2>Welcome to ShopNest, ${name}!</h2>
        <p>Please verify your email to activate your account.</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code expires in 10 minutes.</p>
      `;

      await sendEmail({ email: user.email, subject: 'ShopNest - Verify Your Email', message });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        message: 'Registration successful. Please check your email for a verification code.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid verification code' });
    if (user.otpExpires < new Date()) return res.status(400).json({ message: 'Verification code has expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email is already verified' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const message = `
      <h2>ShopNest Verification Code</h2>
      <p>Your new verification code is: <strong>${otp}</strong></p>
      <p>This code expires in 10 minutes.</p>
    `;

    await sendEmail({ email: user.email, subject: 'ShopNest - New Verification Code', message });

    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before logging in', unverified: true, email: user.email });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, loginUser, getUsers, verifyOtp, resendOtp };