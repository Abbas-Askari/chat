// TODO: filter users based on search

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import UserAvatar from "../user-avatar";
import { createRoomAsync } from "../slices/rooms-slice";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { User } from "../utils/types";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters long",
  }),
  participants: z.array(z.string()).min(2, {
    message: "Group must have at least 2 participants",
  }),
});

type Errors = {
  name?: string;
  participants?: string;
};

function NewGroup() {
  const [search, setSearch] = useState("");
  let { users } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  const [participants, setParticipants] = useState<User[]>([user!]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  users = users.filter((u) => u._id !== user!._id && u.name.includes(search));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const name = (e.currentTarget.elements[0] as HTMLInputElement).value;
      const validation = formSchema.parse({
        name,
        participants: participants.map((p) => p._id),
      });

      // console.log({ participants });
      dispatch(createRoomAsync({ users: validation.participants, name }));
      // setTimeout(() => {
    } catch (error) {
      console.log(error);
      if (error instanceof z.ZodError) {
        setErrors({});
        (error as z.ZodError<{ [k: string]: string }>).errors.forEach(
          (error) => {
            console.log(error.path[0], error.message);
            setErrors((errors: Errors) => ({
              ...errors,
              [error.path[0]]: error.message,
            }));
          }
        );
      }
    } finally {
      setLoading(false);
    }
    // }, 1000);
  }

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="mx-auto p-8 ">
        <h1 className="font-bold text-lg">New Group</h1>

        <label className="form-control w-full ">
          <div className="label">
            <span className="label-text">Group Name</span>
            <span className="label-text-alt text-error text-sm">
              {errors.name}
            </span>
          </div>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full placeholder:opacity-50 "
          />
        </label>

        <label className="form-control w-full ">
          <div className="label">
            <span className="label-text">Search Users</span>
            <span className="label-text-alt text-error text-sm"></span>
          </div>
          <input
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search Users"
            className="input input-bordered w-full  placeholder:opacity-50"
          />

          <div className="flex flex-col gap-4 mt-4">
            {users.map((user) => (
              <label
                key={user._id}
                htmlFor={user._id}
                className="flex gap-4 items-center"
              >
                <UserAvatar user={user} />
                <div className="">
                  <div className=" font-semibold">{user.name}</div>
                  <div className=" text-sm">{user.email}</div>
                </div>
                <input
                  type="checkbox"
                  id={user._id}
                  name={user._id}
                  className=" ml-auto checkbox-primary checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setParticipants([...participants, user]);
                    } else {
                      setParticipants(
                        participants.filter((p) => p._id !== user._id)
                      );
                    }
                  }}
                />
              </label>
            ))}
          </div>

          <label className="form-control w-full ">
            <div className="label">
              <span className="label-text">Add or Remove Participents</span>
              <span className="label-text-alt text-error text-sm">
                {errors.participants}
              </span>
            </div>
            <textarea
              placeholder=""
              disabled={true}
              value={participants
                .map((p) => p.name + (p === user ? " (You)" : ""))
                .join(", ")}
              className=" textarea textarea-ghost w-full  h-fit resize-none"
            />
          </label>
        </label>
        <div className="flex mt-4 gap-4">
          <button
            className="btn flex-1"
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </button>
          <button
            disabled={loading}
            type="submit"
            className=" btn btn-primary flex-1 "
          >
            Create Group
            {loading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewGroup;
