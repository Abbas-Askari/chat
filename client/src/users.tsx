import { useEffect, useState } from "react";
import { Room, User } from "./utils/types";
import { Link, useParams, useSearchParams } from "react-router-dom";
import usersSlice, { fetchUsersAsync } from "./slices/users-slice";
import { RootState } from "@reduxjs/toolkit/query";
import { AppDispatch } from "./store";
import { useAppDispatch, useAppSelector } from "./utils/hooks";
import UserAvatar from "./user-avatar";

function Users() {
  let { users } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  let [searchParams, setSearchParams] = useSearchParams();
  const { rooms } = useAppSelector((state) => state.rooms);
  let groups = rooms.filter((room) => !!room.name);

  console.log({ searchParams });
  users = users.filter((u) => u._id !== user?._id);

  const q = searchParams.get("q");

  if (q) {
    users = users.filter((u) =>
      u.name
        .split(" ")
        .some((part) => part.toLowerCase().startsWith(q?.toLowerCase()))
    );
  }

  useEffect(() => {
    dispatch(fetchUsersAsync());
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-base-200 min-w-min  overflow-auto pb-4  ">
      <div className="flex p-4 gap-4 items-center">
        <UserAvatar user={user!} className="" showOnlineStatus={false} />
        <div className="">
          <div className="font-semibold text-lg">{user!.name}</div>
          <div className="text-xs">{user?.email}</div>
        </div>
        <Link to={"/settings"} className="ml-auto btn btn-outline">
          Settings
        </Link>
      </div>
      <form
        action=""
        className=" bg-base-300 m-4 mt-0 px-3 py-2 rounded-lg flex"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          id="q"
          className=" w-0 flex-shrink bg-inherit outline-none placeholder:opacity-25 flex-1"
          placeholder="Search users"
        />
        <button
          className="btn btn-xs btn-circle p-0 btn-ghost"
          type="button"
          onClick={() => {
            document.getElementById("q")!.value = "";
            setSearchParams({ q: "" });
          }}
        >
          x
        </button>
      </form>
      <h1 className="font-semibold text-lg">Users</h1>
      <div className="flex flex-col ">
        {users.map((user) => (
          <Link
            key={user._id}
            to={"/" + user._id}
            className="flex px-4 py-3 gap-4 hover:bg-base-300"
          >
            <UserAvatar user={user} />
            <div className="">
              <div className="text-lg ">{user.name}</div>
              <div className="text-xs">{user.email}</div>
            </div>
          </Link>
        ))}
        {users.length === 0 && (
          <div className="w-full text-center pt-4 font-semibold text-error">
            No users found
          </div>
        )}
      </div>

      <h1 className="font-semibold text-lg">Groups</h1>
      <div className="flex flex-col ">
        {groups.map((group) => (
          <Link
            key={group._id}
            to={"/" + group._id}
            className="flex px-4 py-3 gap-4 hover:bg-base-300"
          >
            <div className={`avatar placeholder`}>
              <div
                className={`bg-neutral text-neutral-content rounded-full w-12`}
              >
                <span className="text-xl">
                  {group
                    .name!.split(" ")
                    .map((word) => word[0].toUpperCase())
                    .join("")}
                </span>
              </div>
            </div>

            <div className="">
              <div className="text-lg">{group.name}</div>
              <div className="text-xs ">
                {group.users
                  .map((id) => {
                    const participant = users.find((u) => u._id === id);
                    return participant?.name ?? user?.name;
                  })
                  .join(", ")}
              </div>
            </div>
          </Link>
        ))}
        {groups.length === 0 && (
          <div className="w-full text-center pt-4 font-semibold text-error">
            No Groups found
          </div>
        )}
      </div>
      <Link
        to={"/groups/new"}
        className="btn btn-primary mt-auto mx-4 btn-outline"
      >
        Creat a new Group
      </Link>
    </div>
  );
}

export default Users;
