import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./login/login";
import Signup from "./login/signup";
import Layout from "./layout";
import Chat from "./chat/chat";
import Settings from "./settings/settings";
import NewGroup from "./groups/new";
import Users from "./users";
import Home from "./home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { path: "/settings", element: <Settings /> },
      {
        path: "/groups/new",
        element: <NewGroup />,
      },
      {
        path: "/chats",
        element: <Users />,
      },
      {
        path: "/:userId",
        element: <Chat />,
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <Signup /> },
]);

export default router;
