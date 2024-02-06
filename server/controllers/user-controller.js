const User = require("../models/user-model");
const { generateSignedUrl } = require("../s3");
const { getActiveUsers } = require("../sockets");

async function getAllUsers(req, res) {
  try {
    let users = await User.find().exec();
    const onlineUsers = getActiveUsers();
    users = users.map((user) => ({
      ...user.toObject(),
      status: onlineUsers.includes(user._id.toString()) ? "Online" : "Offline",
    }));
    res.json(users);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

async function createUser(req, res) {
  try {
    const user = new User(req.body);
    const newUser = await user.save();
    res.json(newUser);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message, error: err });
  }
}

async function updateUser(req, res) {
  try {
    console.log(req.body);
    req.body.password = req.body.newPassword;
    const key = req.user.id.toString() + "-avatar";
    const url = await generateSignedUrl(key);
    const publicUrl = `https://pub-af5b8606f9fa4102a9bd04f717c4ac50.r2.dev/${key}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, avatar: publicUrl },
      {
        new: true,
      }
    ).exec();
    console.log({ updatedUser, url });
    res.json({ updatedUser, url });
  } catch (err) {
    console.log(err);

    res.json({ message: err.message, error: err });
  }
}

async function deleteUser(req, res) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id).exec();
    res.json(deletedUser);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};
