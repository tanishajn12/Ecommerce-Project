const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('auth/login'));

// Register Page
router.get('/register', (req, res) => res.render('auth/register'));

// Register Handle
router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('auth/register', { errors, name, email, password, password2 });
    } else {
        try {
            let user = await User.findOne({ email: email });
            if (user) {
                errors.push({ msg: 'Email already exists' });
                res.render('auth/register', { errors, name, email, password, password2 });
            } else {
                const newUser = new User({ name, email, password });

                const salt = await bcrypt.genSalt(10);
                newUser.password = await bcrypt.hash(password, salt);

                await newUser.save();
                req.flash('success_msg', 'You are now registered and can log in');
                res.redirect('/auth/login');
            }
        } catch (err) {
            console.error(err);
            res.redirect('/auth/register');
        }
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
});

module.exports = router;
