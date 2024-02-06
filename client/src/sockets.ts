import { createAsyncThunk } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { receiveMessage, receiveRoom, setTyping } from "./slices/rooms-slice";
import { receiveUser, setStatus } from "./slices/users-slice"; // Import removeUser action
import { store } from "./store";

export const socket = io("http://localhost:3000", {
  autoConnect: false,
});

export function connectSocket(token: string) {
  socket.auth = { token };
  socket.connect();
}

export const initEventHandlersAsync = createAsyncThunk(
  "socket/initEventHandlers",
  async (_, { dispatch }) => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });

    console.log("registering event handlers");

    socket.on("message", (message) => {
      if (typeof message.room !== "string") {
        console.error("Received message with invalid room", message);
        return;
      }
      console.log("Received message", message);
      dispatch(receiveMessage(message));
    });

    socket.on("room", (room) => {
      console.log("Received room", room);
      dispatch(receiveRoom(room));
    });

    socket.on("user", (user) => {
      console.log("Received user", user);
      dispatch(receiveUser(user));
    });

    socket.on("user-connected", (userId) => {
      console.log("User connected", userId);
      dispatch(setStatus({ userId, status: "Online" }));
    });

    socket.on("user-disconnected", (userId) => {
      console.log("User disconnected", userId);
      dispatch(setStatus({ userId, status: "Offline" }));
    });

    socket.on("typing", ({ userId, typing, roomId }) => {
      console.log("User typing", userId, typing, roomId);

      dispatch(setTyping({ userId, typing, roomId }));
    });
  }
);

export const removeEventHandlers = () => {
  socket.offAny();
};

export const setTypingAsync = createAsyncThunk(
  "socket/setTyping",
  async (
    {
      roomId,
      userId,
      typing,
    }: { roomId: string; userId: string; typing: boolean },
    { dispatch }
  ) => {
    console.log("setTypingAsync", roomId, userId, typing);
    dispatch(setTyping({ roomId, userId, typing }));
    socket.emit("typing", { roomId, userId, typing });
  }
);
