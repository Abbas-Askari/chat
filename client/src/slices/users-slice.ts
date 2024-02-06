import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Status, User } from "../utils/types";

export const fetchUsersAsync = createAsyncThunk(
  "users/fetchUsers",
  async (_, { dispatch }) => {
    try {
      const response = await fetch("http://localhost:3000/users");
      const data = await response.json();
      console.log("fetchUsersAsync", data);
      data.forEach((user: User) => {
        if (!user.status) user.status = "Offline";
      });
      dispatch(setUsers(data));
    } catch (err) {
      console.error(err);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [] as User[],
  },
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    receiveUser: (state, action) => {
      state.users.push(action.payload);
    },
    setStatus: (state, action) => {
      const user = state.users.find(
        (user) => user._id === action.payload.userId
      );
      if (user) user.status = action.payload.status;
      else console.error("User not found");
    },
  },
});

export const { setUsers, receiveUser, setStatus } = usersSlice.actions;

export default usersSlice.reducer;
