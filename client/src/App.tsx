import "./App.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { useEffect } from "react";
import {
  connectSocket,
  initEventHandlersAsync,
  removeEventHandlers,
  socket,
} from "./sockets";
import { useAppDispatch, useAppSelector } from "./utils/hooks";

function App() {
  const { token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let timeout: number | undefined;
    if (token) {
      connectSocket(token);
      timeout = setTimeout(() => {
        if (socket.connected) {
          console.log("socket connected and event handlers initialized");
          dispatch(initEventHandlersAsync());
          // dispatch(initEventHandlersAsync());
        }
      }, 1000);
    }

    return () => {
      removeEventHandlers();
      clearTimeout(timeout);
    };
  }, [token, socket.connected]);

  return <RouterProvider router={router} />;
}

export default App;
