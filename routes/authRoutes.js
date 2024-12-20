const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = 'THISISJWT_SECRETKEY'; 

//  Signup
router.post('/signup', async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { emailId, password } = req.body;

    try {
        const user = await User.findOne({ email:emailId }).select('+password'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: '1h',
        });

        const { _id, username, email, role } = user;

        res.status(200).json({  message: 'Login successful',
                                token,
                                user: { _id, username, email, role },
                            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = router;
