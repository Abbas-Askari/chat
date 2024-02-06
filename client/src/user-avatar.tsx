import { User } from "./utils/types";

function UserAvatar({
  user,
  className,
  isChatImage,
  showOnlineStatus,
}: {
  user: User;
  className?: string;
  isChatImage?: boolean;
  showOnlineStatus?: boolean;
}) {
  if (showOnlineStatus === undefined) {
    showOnlineStatus = true;
  }
  return (
    <div
      className={`avatar ${isChatImage ? "chat-image" : ""} placeholder ${
        showOnlineStatus
          ? ["Online", "Typing"].includes(user.status!)
            ? "online"
            : "offline"
          : ""
      }`}
    >
      <div
        className={`bg-neutral text-neutral-content rounded-full w-12 ${className}`}
      >
        {
          // if user has an avatar
          user.avatar ? (
            <img src={user.avatar} alt="avatar" />
          ) : (
            // if user does not have an avatar
            <span className="text-xl">
              {user.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </span>
          )
        }
      </div>
    </div>
  );
}

export default UserAvatar;
