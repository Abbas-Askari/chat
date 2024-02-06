const express = require("express");
const Room = require("../models/room");
const {
  createRoom,
  getRoomsOfUser,
  addMessagetoRoom,
} = require("../controllers/room-controller");
const { validate } = require("../controllers/auth-controller");
const router = express.Router();

router.get("/", validate, getRoomsOfUser);

router.post("/", validate, createRoom);

router.post("/:id", validate, addMessagetoRoom);

module.exports = router;
