// make typescript ignore the next line
// @ts-nocheck
import { FileIcon, defaultStyles } from "react-file-icon";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { changeRoomAsync, sendMessageAsync } from "../slices/rooms-slice";
import { Room, User } from "../utils/types";
import ChatMessage from "./message";
import UserAvatar from "../user-avatar";
import { setTypingAsync } from "../sockets";
import { bytesToSize } from "../utils/general";

function extractRoomName(
  room: Room,
  current: User,
  participants: User[]
): string {
  if (room.name) {
    return room.name;
  }
  if (room.users.length === 1) {
    return "Saved Messages";
  }
  if (room.users.length !== 2) {
    throw new Error("Invalid room");
  }
  const userId =
    room.users.find((userId) => userId !== current._id) ||
    (room.users[0] as string);
  const user = participants.find((user) => user._id === userId);
  return user!.name;
}

function Chat() {
  const params = useParams();
  const userId = params.userId;
  const dispatch = useAppDispatch();
  const { currentRoom, rooms } = useAppSelector((state) => state.rooms);
  const { user } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.rooms);
  const { users } = useAppSelector((state) => state.users);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  const selectedFile = files[selectedFileIndex];
  const room = rooms.find((room) => room._id === currentRoom);

  function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = e.currentTarget.elements[1] as HTMLInputElement;
    // const filesInput = e.currentTarget.elements[0] as HTMLInputElement;
    // const files = filesInput.files;
    const message = content.value;
    for (let file of files!) {
      dispatch(sendMessageAsync({ roomId: room!._id, message, file }));
    }
    setFiles([]);
    // console.log("asdasd", message, content.value, filesInput.files);
    if (message === "") return;
    console.log("sending message", { message });
    if (files!.length === 0) {
      console.log({ message });
      dispatch(sendMessageAsync({ roomId: room!._id, message }));
    }
    content.value = "";
  }

  useEffect(() => {
    if (!loading) {
      dispatch(changeRoomAsync(userId!));
    }
  }, [userId, loading]);

  useEffect(() => {
    const chat = document.getElementById("chat");
    chat?.scrollTo({ left: 0, top: chat.scrollHeight, behavior: "smooth" });
  }, [room?.messages?.length]);

  if (!room) {
    return <div>Loading... {userId}</div>;
  }
  const participants = users.filter((user) =>
    room.users.some((id) => id === user._id)
  );
  const name = extractRoomName(room, user!, participants);

  const otherUser =
    participants.find((u) => u._id !== user!._id) || participants[0];

  const otherTypers = room.typers?.filter((id) => id !== user!._id) || [];
  const amITyping = room.typers?.includes(user!._id) || false;

  return (
    <div className="w-full h-full flex flex-col  justify-between overflow-hidden">
      <div className="bg-base-200 p-3 flex gap-2 items-center">
        <UserAvatar user={otherUser} />
        <div className="text-xl font-semibold">{name}</div>
        <Link to="/" className="ml-auto btn btn-accent md:hidden">
          Back
        </Link>
      </div>

      {files.length > 0 ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between p-4">
            <div className=" font-semibold text-lg">Attachments</div>
            <div
              className="btn btn-circle btn-xs btn-ghost"
              onClick={() => setFiles([])}
            >
              x
            </div>
          </div>

          {/* Show selected file preview if possible, otherwise file details */}
          <div className="flex-1 p-16 flex flex-col items-center justify-center overflow-auto">
            {selectedFile && selectedFile.type.startsWith("image") ? (
              <>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="attachment"
                  className=" object-contain"
                />
                <div className="flex flex-col mt-4 text-center">
                  <div className=" font-semibold ">{selectedFile.name}</div>
                  <div className="text-xs text-neutral-500">
                    {bytesToSize(selectedFile.size)}
                  </div>
                </div>
              </>
            ) : (
              <div className=" p-2">
                <div className=" max-w-48">
                  <FileIcon
                    {...defaultStyles[selectedFile.name.split(".").at(-1)]}
                    extension={selectedFile.name.split(".").at(-1)}
                  />
                </div>
                <div className="flex flex-col mt-4 text-center">
                  <div className=" font-semibold ">{selectedFile.name}</div>
                  <div className="text-xs text-neutral-500">
                    {bytesToSize(selectedFile.size)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 overflow-auto p-4 py-8 justify-center">
            {files.map((file, index) => {
              const parts = file.name.split(".");
              const extension = parts[parts.length - 1];
              return (
                <div
                  className="w-24 flex-none"
                  onClick={() => {
                    setSelectedFileIndex(index);
                  }}
                >
                  <div className="  bg-base-200 p-2 rounded-md relative">
                    <button
                      onClick={() => {
                        setFiles((prev) => prev!.filter((f) => f !== file));
                        if (index === selectedFileIndex) {
                          setSelectedFileIndex(0);
                        }
                      }}
                      className=" bg-neutral-500  w-4 h-4 flex justify-center items-center rounded-full text-xs hover:text-white hover:bg-neutral-600 translate-x-[50%] translate-y-[-50%] absolute  right-0 top-0"
                    >
                      x
                    </button>
                    <FileIcon
                      {...defaultStyles[extension]}
                      extension={extension}
                    />
                  </div>
                  <div className="text-sm truncate text-center">
                    {file.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div id="chat" className="flex-1 overflow-y-auto p-4">
          {room.messages !== undefined &&
            room!.messages.map((message) => (
              <ChatMessage
                key={message._id}
                user={
                  users.find((user) => user._id === (message.user as string))!
                }
                message={message}
                left={message.user !== user!._id}
              />
            ))}
          {otherTypers.length > 0 &&
            otherTypers.map((id) => {
              const user = users.find((user) => user._id === id);
              return (
                <div className="chat chat-start">
                  <UserAvatar
                    user={user!}
                    className="w-8 ring ring-primary ring-offset-base-100 ring-offset-2"
                    isChatImage={true}
                    showOnlineStatus={false}
                  />
                  <div className="chat-bubble max-w-[60%] ">
                    <span className="loading loading-dots loading-md"></span>
                  </div>
                </div>
              );
            })}
          {amITyping && (
            <div className="chat chat-end">
              <UserAvatar
                user={user!}
                className="w-8 ring ring-primary ring-offset-base-100 ring-offset-2"
                isChatImage={true}
                showOnlineStatus={false}
              />
              <div className="chat-bubble max-w-[60%] ">
                <span className="loading loading-dots loading-md"></span>
              </div>
            </div>
          )}
        </div>
      )}

      <form
        className="flex bg-base-200 p-2 gap-2  mt-auto w-full"
        onSubmit={sendMessage}
      >
        <label htmlFor="files">
          <span className="btn">Attach</span>
          <input
            type="file"
            name="files"
            id="files"
            className="hidden"
            multiple={true}
            onChange={(e) => {
              for (let file of e.target.files!) {
                setFiles((prev) => [...prev, file]);
              }
            }}
          />
        </label>

        <input
          onFocus={() =>
            dispatch(
              setTypingAsync({
                roomId: room._id,
                typing: true,
                userId: user!._id,
              })
            )
          }
          onBlur={() =>
            dispatch(
              setTypingAsync({
                roomId: room._id,
                typing: false,
                userId: user!._id,
              })
            )
          }
          type="text"
          placeholder="Type a message"
          name="content"
          className="input flex-1  input-bordered placeholder:opacity-25"
        />
        <button className="btn btn-outline">Send</button>
      </form>
    </div>
  );
}

export default Chat;
