const express = require("express");
const User = require("../models/user-model");
const {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controllers/user-controller");
const router = express.Router();
const { validate } = require("../controllers/auth-controller");

router.get("/", getAllUsers);

router.post("/", createUser);
router.patch(
  "/:id",
  validate,
  (req, res, next) => {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  },
  updateUser
);
router.delete("/:id", deleteUser);

module.exports = router;
