const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  users: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    required: true,
    validate: {
      validator: function (users) {
        console.log(users);
        return users.length > 0;
      },
      message: "At least one user is required in the room",
    },
  },
  name: {
    type: String,
    minlength: [2, "Room name must be at least 2 characters"],
  },
});

const Room = mongoose.model("Room", RoomSchema);

// Room.find()
//   .exec()
//   .then((rooms) => {
//     console.log(rooms);
//   });

module.exports = Room;
