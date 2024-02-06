const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: [true, "Email is required"],
    // unique: [true, "Email already exists"],
    validate: [
      (value) => {
        return value.includes("@");
      },
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  avatar: String,
});

UserSchema.post("save", function (error, doc, next) {
  if (error.code === 11000) {
    next(new Error("User validation failed: email: Email is already taken"));
  } else {
    next();
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
