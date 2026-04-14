const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// =========================
// SIGNUP
// =========================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (user && user.isVerified) {
      return res.status(400).json({
        message: "User already registered. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
      user.isVerified = false;
    } else {
      user = new User({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        otp,
        otpExpire: new Date(Date.now() + 5 * 60 * 1000),
        isVerified: false,
        role: "customer",
      });
    }

    await user.save();

    await sendEmail(
      normalizedEmail,
      "E-Garage OTP Verification",
      `Your OTP for E-Garage account verification is ${otp}. It is valid for 5 minutes.`
    );

    return res.status(200).json({
      message: "OTP sent successfully",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({
      message: "Server error during signup",
    });
  }
};

// =========================
// VERIFY OTP
// =========================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({
        message: "No OTP found. Please signup again.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (new Date(user.otpExpire) < new Date()) {
      return res.status(400).json({
        message: "OTP expired. Please request a new OTP.",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpire = null;

    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res.status(500).json({
      message: "Server error during OTP verification",
    });
  }
};

// =========================
// RESEND OTP
// =========================
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User is already verified. Please login.",
      });
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendEmail(
      normalizedEmail,
      "E-Garage OTP Resend",
      `Your new OTP for E-Garage verification is ${otp}. It is valid for 5 minutes.`
    );

    return res.status(200).json({
      message: "OTP resent successfully",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error.message);
    return res.status(500).json({
      message: "Server error while resending OTP",
    });
  }
};

// =========================
// LOGIN
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your OTP before login",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Password not set for this user",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};



// FORGOT PASSWORD - SEND RESET OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = generateOtp();

    user.resetOtp = otp;
    user.resetOtpExpire = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendEmail(
      normalizedEmail,
      "E-Garage Password Reset OTP",
      `Your password reset OTP is ${otp}. It is valid for 5 minutes.`
    );

    return res.status(200).json({
      message: "Reset OTP sent successfully",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res.status(500).json({
      message: "Server error during forgot password",
    });
  }
};

// VERIFY RESET OTP
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetOtp || !user.resetOtpExpire) {
      return res.status(400).json({
        message: "No reset OTP found",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid reset OTP",
      });
    }

    if (new Date(user.resetOtpExpire) < new Date()) {
      return res.status(400).json({
        message: "Reset OTP expired",
      });
    }

    return res.status(200).json({
      message: "Reset OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify Reset OTP Error:", error.message);
    return res.status(500).json({
      message: "Server error during reset OTP verification",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetOtp || !user.resetOtpExpire) {
      return res.status(400).json({
        message: "No reset OTP found",
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        message: "Invalid reset OTP",
      });
    }

    if (new Date(user.resetOtpExpire) < new Date()) {
      return res.status(400).json({
        message: "Reset OTP expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpire = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({
      message: "Server error during password reset",
    });
  }
};