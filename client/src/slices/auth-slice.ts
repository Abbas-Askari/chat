import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "../utils/types";

type UserUpdate = {
  name?: string;
  avatar?: string;
  newPassword?: string;
};

export const updateUserAsync = createAsyncThunk(
  "auth/updateUser",
  async (user: UserUpdate, { dispatch }) => {
    try {
      console.log({ user });
      const userId = JSON.parse(localStorage.getItem("user") || "{}")._id;
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND}/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(user),
        }
      );
      console.log({ response });
      const { updatedUser, url } = await response.json();
      console.log({ updatedUser, url });
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: user.avatar,
      });
      console.log({ res });
      dispatch(setUser(updatedUser));
    } catch (err) {
      console.error(err);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user") || "null") as User | null,
    token: localStorage.getItem("token") || "",
  },
  reducers: {
    setUser: (state, action) => {
      localStorage.setItem("user", JSON.stringify(action.payload));
      state.user = action.payload;
    },
    setToken: (state, action) => {
      localStorage.setItem("token", action.payload);
      state.token = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      state.user = null;
      state.token = "";
    },
  },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
