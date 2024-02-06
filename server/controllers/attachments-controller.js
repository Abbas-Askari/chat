const Attachment = require("../models/attachment");
const { generateSignedUrl } = require("../s3");
const crypto = require("crypto");

async function createAttachment(req, res) {
  const attachment = req.body;
  const key = `${attachment.name}-${crypto.randomBytes(16).toString("hex")}`;
  const url = await generateSignedUrl(key);
  const publicUrl = `https://pub-af5b8606f9fa4102a9bd04f717c4ac50.r2.dev/${key}`;
  console.log({ url, publicUrl, attachment });
  const newAttachment = await Attachment.create({
    name: attachment.name,
    size: attachment.size,
    type: attachment.type || "unknown",
    url: publicUrl,
  });
  res.status(200).json({ url, newAttachment });
}

module.exports = { createAttachment };
