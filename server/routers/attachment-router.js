const express = require("express");
const { createAttachment } = require("../controllers/attachments-controller");
const { validate } = require("../controllers/auth-controller");
const router = express.Router();

router.post("/", validate, createAttachment);
// router.patch("/:id");
// router.delete("/:id", deleteUser);

module.exports = router;
