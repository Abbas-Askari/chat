const User = require("../models/user-model");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User with the provided email dosenot exist",
        path: "email",
      });
    }
    const isMatch = password === user.password;
    // const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Incorrect password", path: "password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message, error: err });
  }
}

async function validate(req, res, next) {
  try {
    const auth = req.headers.authorization;
    const token = auth.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid token" });
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    if (
      err.message.includes("invalid signature") ||
      err.message.includes("jwt malformed") ||
      err.message.includes("split")
    ) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(401).json({ message: "Invalid or non-existing token" });
  }
}

module.exports = {
  login,
  validate,
};
