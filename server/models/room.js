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
// Print groups having 3 or more members
Room.find({
  users: "65b8c335b91be6e5cb3d8d49",
})
  .populate("users")
  .exec()
  .then((data) =>
    console.log(data.map((room) => room.users.map((user) => user.name)))
  )
  .catch((err) => console.log(err));
module.exports = Room;
