const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

export const register = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    if (!fullname || !email || !phoneNumber || !password || !role) {
      return res
        .status(400)
        .json({ success: false, msg: 'All fields are required' });
    }
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, msg: 'User already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    await User.create({
      fullname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });

    // Save user to database
    await user.save();

    res
      .status(201)
      .json({ success: true, msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({
      mssg: 'Server error',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: 'All fields are required' });
    }
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: 'Invalid credentials' });
    }
    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, msg: 'Invalid credentials' });
    }
    // role
    if (user.role !== role) {
      return res
        .status(400)
        .json({ success: false, msg: 'Invalid credentials' });
    }
    // Create session

    const tokenData = {
      userId: user._id,
    };
    const token = jwt.sign(tokenData, process.env.SECRECT_KEY, {
      expiersIn: '1d',
    });

    user = {
      userId: user._id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profile: user.profile,
    };
    return res
      .status(200)
      .cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true })
      .json({ success: true, msg: `Welcome Back ${user.fullname}`, user });
  } catch (err) {
    res.status(500).json({
      mssg: 'Server error',
    });
  }
};
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie('token', '', { maxAge: 0 })
      .json({ success: true, msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({
      success: false,
      mssg: 'Server error',
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { fullname, email, phoneNumber, skills, bio } = req.body;
    // const file = req.file;
    if (!fullname || !email || !phoneNumber || !role || !profile) {
      return res
        .status(400)
        .json({ success: false, mssg: 'All fields are required' });
    }

    // file functionality left
    const skillsArray = skills.split(',');
    const userId = req.user.userId;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, mssg: 'User not found' });
    }
    // updating data
    user.fullname = fullname;
    user.email = email;
    user.phoneNumber = phoneNumber;
    user.profile.bio = bio;
    user.profile.skills = skillsArray;

    // resume left
    await user.save();

    user = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };
    return res.status(200).json({
      success: true,
      mssg: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      mssg: 'Server error',
    });
  }
};
