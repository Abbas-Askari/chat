import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Room, User } from "../utils/types";
import { RootState } from "../store";
import { socket } from "../sockets";

export const fetchRoomsAsync = createAsyncThunk(
  "rooms/fetchRooms",
  async (_, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      console.log(import.meta.env);
      const response = await fetch(`${import.meta.env.VITE_BACKEND}/rooms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      data.forEach((room: Room) => {
        if (!room.typers) room.typers = [];
      });
      console.log({ data });
      dispatch(setRooms(data));
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

function roomExists(rooms: Room[], roomId: string) {
  if (rooms.some((room) => room._id === roomId)) return true;
  return rooms.some(({ users }) => {
    if (users.length === 0) return false;
    if (typeof users[0] === "string")
      return (users as string[]).includes(roomId);
    else return (users as User[]).map((user) => user._id).includes(roomId);
  });
}

export const createRoomAsync = createAsyncThunk(
  "rooms/createRoom",
  async ({ users, name }: { users: string[]; name?: string }, { dispatch }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND}/rooms/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ users, name }),
      });
      const data = await response.json();
      dispatch(addRoom(data)); // Dispatch the addRoom action with the data response
      dispatch(setCurrentRoom(data._id)); // Dispatch the setCurrentRoom action with the data response
      // dispatch(setUsers(data));
    } catch (err) {
      console.log(err);
    }
  }
);

export const changeRoomAsync = createAsyncThunk(
  "rooms/changeRoom",
  async (roomId: string, { dispatch, getState }) => {
    try {
      const rooms = (getState() as RootState).rooms.rooms;
      if (!roomExists(rooms, roomId)) {
        // create the new Room, the roomId is the other user's id
        const users = [roomId, (getState() as RootState).auth.user!._id];
        dispatch(createRoomAsync({ users }));
      } else {
        let roomWithId = rooms.find((room) => room._id === roomId);
        if (!roomWithId) {
          console.log("finding room with id", roomId);
          roomWithId = rooms.find(({ users }) => {
            if (users.length !== 2) return false;
            if (typeof users[0] === "string")
              return (users as string[]).includes(roomId);
            else
              return (users as User[]).map((user) => user._id).includes(roomId);
          });
        }

        dispatch(setCurrentRoom(roomWithId?._id));
        console.log("changeRoomAsync", roomWithId);
        console.log("change to existing room");
      }
      // dispatch(setUsers(data));
    } catch (err) {
      console.log(err);
    }
  }
);

export const sendMessageAsync = createAsyncThunk(
  "rooms/sendMessage",
  async (
    { roomId, message, file }: { roomId: string; message: string; file?: File },
    { dispatch }
  ) => {
    setLoading(true);
    try {
      let attachment;
      if (file) {
        const { url, newAttachment } = await (
          await fetch(`${import.meta.env.VITE_BACKEND}/attachments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              name: file.name,
              size: file.size,
              type: file.type,
            }),
          })
        ).json();

        console.log(url);
        attachment = newAttachment;
        dispatch(startedUploadingAttachments(newAttachment._id.toString()));
        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          body: file,
        }).then((res): void => {
          console.log("File uploaded!", res);
          dispatch(finishedUploadingAttachments(newAttachment._id.toString()));
        });
      }

      console.log(`${import.meta.env.VITE_BACKEND}/rooms/${roomId}`);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/rooms/${roomId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: message, attachment }),
        }
      );
      const data = await response.json();
      if (attachment) data.attachment = attachment;
      socket.emit("message", data);
      dispatch(addMessageToRoom({ roomId, message: data }));
      console.log("Added message to room");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }
);

const roomsSlice = createSlice({
  name: "rooms",
  initialState: {
    rooms: [] as Room[],
    currentRoom: null as string | null,
    loading: true,
    uploadingAttachments: [] as string[],
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRooms: (state, action) => {
      state.rooms = action.payload;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    addRoom: (state, action) => {
      state.rooms.push(action.payload);
    },
    addMessageToRoom: (state, action) => {
      const { roomId, message } = action.payload;
      const room = state.rooms.find((room) => room._id === roomId);
      if (room) {
        if (!room.messages) room.messages = [];
        room.messages?.push(message);
      }
    },
    receiveRoom: (state, action) => {
      state.rooms.push(action.payload);
    },
    receiveMessage: (state, action) => {
      const message = action.payload;
      const room = state.rooms.find((room) => room._id === message.room);
      if (room) {
        if (!room.messages) room.messages = [];
        room.messages?.push(message);
      } else {
        console.error("Received message from non-existing room!", message);
      }
    },
    setTyping: (state, action) => {
      const { roomId, userId, typing } = action.payload;
      const room = state.rooms.find((room) => room._id === roomId);
      if (room) {
        if (typing) {
          if (!room.typers) room.typers = [];
          if (!room.typers.includes(userId)) room.typers.push(userId);
        } else {
          room.typers = room.typers?.filter((typer) => typer !== userId);
        }
      } else {
        console.error("Room not found!");
      }
    },
    startedUploadingAttachments: (state, action) => {
      state.uploadingAttachments.push(action.payload);
    },
    finishedUploadingAttachments: (state, action) => {
      state.uploadingAttachments = state.uploadingAttachments.filter(
        (id) => id !== action.payload
      );
    },
  },
});

export const {
  setRooms,
  setCurrentRoom,
  setLoading,
  addRoom,
  addMessageToRoom,
  receiveMessage,
  receiveRoom,
  setTyping,
  startedUploadingAttachments,
  finishedUploadingAttachments,
} = roomsSlice.actions;

export default roomsSlice.reducer;
