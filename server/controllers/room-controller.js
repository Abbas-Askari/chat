const Attachment = require("../models/attachment");
const Message = require("../models/message");
const Room = require("../models/room");

async function createRoom(req, res) {
  try {
    const users = req.body.users;
    if (users.length === 2 && users[0] === users[1]) {
      users.shift();
    }
    const room = {
      name: req.body.name,
      users: req.body.users,
    };

    console.log({ room, reqBody: req.body, users });

    // const newRoom = await Room.populate(await new Room(room).save(), {
    //   path: "users",
    // });
    const newRoom = await new Room(room).save();
    res.json(newRoom);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

async function updateRoom(req, res) {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();
    res.json(updatedRoom);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

async function deleteRoom(req, res) {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id).exec();
    res.json(deletedRoom);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

async function getAllRooms(req, res) {
  try {
    const rooms = await Room.find().exec();
    res.json(rooms);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

async function getRoomsOfUser(req, res) {
  try {
    // return rooms joined with messages
    // const rooms = await Room.find({ users: req.user.id }).exec();
    const rooms = await Room.aggregate([
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "room",
          as: "messages",
        },
      },
      // {
      //   $match: {
      //     users: req.user.id,
      //   },
      // },
      {
        $sort: {
          "messages.createdAt": -1,
        },
      },
    ]);
    const roomsPopulated = await Attachment.populate(rooms, {
      path: "messages.attachment",
    });
    res.json(roomsPopulated);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

async function addMessagetoRoom(req, res) {
  try {
    const message = await new Message({
      user: req.user.id,
      content: req.body.content,
      attachment: req.body.attachment,
      room: req.params.id,
    }).save();
    res.json(message);
  } catch (err) {
    console.log(err);
    res.json({ message: err.message, error: err });
  }
}

module.exports = {
  createRoom,
  updateRoom,
  deleteRoom,
  getAllRooms,
  getRoomsOfUser,
  addMessagetoRoom,
};
