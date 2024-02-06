import React, { useRef, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { Message, User } from "../utils/types";
import { bytesToSize } from "../utils/general";
import { useAppSelector } from "../utils/hooks";
import { set } from "mongoose";
import UserAvatar from "../user-avatar";

function getFileIconType(type: string) {
  const supportedTypes = [
    "3d",
    "acrobat",
    "audio",
    "binary",
    "code",
    "code2",
    "compressed",
    "document",
    "drive",
    "font",
    "image",
    "presentation",
    "settings",
    "spreadsheet",
    "vector",
    "video",
  ];
  return supportedTypes.find((t) => type.includes(t)) || "document";
}

function calculateTimeAgo(time: string) {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) {
    return `${days}d`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return "Just now";
}

function ChatMessage({
  message,
  user,
  left,
}: {
  message: Message;
  user: User;
  left: boolean;
}) {
  // let user = useAppSelector((state) => state.auth.user);

  return (
    <div className={"chat  " + (left ? " chat-start" : " chat-end")}>
      <UserAvatar
        user={user}
        className="w-9 ring ring-primary ring-offset-base-100 ring-offset-2 -translate-y-1"
        isChatImage={true}
        showOnlineStatus={false}
      />
      <div className="chat-bubble p-0">
        {message.attachment && (
          <Attachment
            hasContent={!!message.content}
            attachment={message.attachment}
          />
        )}
        {message.content && (
          <div
            className={` px-4 py-2 max-w-96 ${
              message.attachment ? "max-w-96" : ""
            }`}
          >
            {message.content}
          </div>
        )}
      </div>
      <div className="chat-footer opacity-50 text-xs">
        {calculateTimeAgo(message.createdAt)}
        {!left ? " · Seen" : " · Delivered"}
      </div>
    </div>
  );
}

function Attachment({
  attachment,
  hasContent,
}: {
  hasContent: boolean;
  attachment: Message["attachment"];
}) {
  const downloadFileName = attachment.name;
  const url = attachment.url.replaceAll(" ", "%20");
  const { uploadingAttachments } = useAppSelector((state) => state.rooms);
  const [broken, setBroken] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const loading = uploadingAttachments.includes(attachment._id.toString());

  if (loading || broken) {
    return (
      <div className="bg-base-200 m-1 p-3 rounded-box flex  justify-between gap-6 items-center max-w-96 ">
        <div className="">
          {loading ? "Sending" : "Failed to load file, Retrying..."}{" "}
          {downloadFileName}
        </div>
        <div className=" loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const handleImageDownload = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFileName;
    link.click();
  };

  return (
    <div
      // className={`${
      //   hasContent ? "bg-base-200 m-1 mb-0" : ""
      // } p-3  rounded-box  flex  flex-col items-start w-96`}
      className={`bg-base-200 m-1 p-3 rounded-box flex flex-col items-start max-w-96`}
    >
      {attachment.type.startsWith("image") ? (
        <img
          onClick={handleImageDownload}
          ref={imageRef}
          onLoad={() => {
            console.log("Success!");
          }}
          id={"image-" + attachment._id.toString()}
          title="Click to download"
          onError={(e) => {
            console.log("Error!");
            setBroken(true);
            setTimeout(() => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                setBroken(false);
              };
              // if image is not loaded after 1 second, try again
              setTimeout(() => {
                if (broken) {
                  img.src = url;
                }
              }, 1000);
            }, 1000);
          }}
          src={url}
          alt="attachment"
          className="rounded-box w-full mx-auto object-contain cursor-pointer hover:brightness-75"
        />
      ) : (
        <div className="flex gap-2 items-center pl-2">
          <div className="w-12">
            <FileIcon
              {...defaultStyles[attachment.name.split(".").at(-1)]}
              extension={attachment.name.split(".").at(-1)}
            />{" "}
          </div>
          <div className="flex flex-col">
            <a
              href={url}
              download={downloadFileName}
              className=" font-semibold link link-primary"
            >
              {attachment.name}
            </a>
            <span className=" text-sm ">{bytesToSize(attachment.size)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
