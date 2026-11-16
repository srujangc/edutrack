import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'edutrack_jwt_secret_key_982347293847293847293847',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, college, semester, department, rollNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A student account with this email already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      college: college || 'National Institute of Technology',
      semester: semester || 'Semester 5',
      department: department || 'Computer Science & Engineering',
      rollNumber: rollNumber || ''
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        semester: user.semester,
        department: user.department,
        rollNumber: user.rollNumber,
        targetAttendance: user.targetAttendance,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Authenticate student & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        semester: user.semester,
        department: user.department,
        rollNumber: user.rollNumber,
        targetAttendance: user.targetAttendance,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login'
    });
  }
};

// @desc    Get current student profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching profile'
    });
  }
};

// @desc    Update student profile & settings
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const { name, college, semester, department, rollNumber, targetAttendance, theme } = req.body;

    if (name) user.name = name;
    if (college !== undefined) user.college = college;
    if (semester !== undefined) user.semester = semester;
    if (department !== undefined) user.department = department;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (targetAttendance !== undefined) user.targetAttendance = Number(targetAttendance);
    if (theme && ['light', 'dark'].includes(theme)) user.theme = theme;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        semester: updatedUser.semester,
        department: updatedUser.department,
        rollNumber: updatedUser.rollNumber,
        targetAttendance: updatedUser.targetAttendance,
        theme: updatedUser.theme
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error changing password'
    });
  }
};
