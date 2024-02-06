import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import Users from "./users";
import { useAppDispatch, useAppSelector } from "./utils/hooks";
import { useEffect } from "react";
import { User } from "./utils/types";
import { fetchRoomsAsync } from "./slices/rooms-slice";

function Layout() {
  const user = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { pathname } = useLocation();

  const atHome = pathname === "/";

  console.log({ pathname, atHome });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    dispatch(fetchRoomsAsync());
  }, []);

  return (
    <div className="h-screen flex items-stretch overflow-hidden">
      <div
        className={` w-full md:flex-[2_2_0] md:w-auto basis md:block ${
          !atHome ? "hidden" : ""
        }`}
      >
        <Users />
      </div>
      <div
        className={` flex-[5_5_0] border-l-2 border-neutral-600  overflow-hidden md:block ${
          atHome ? "hidden" : ""
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
