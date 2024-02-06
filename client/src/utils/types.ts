export type Status = "Online" | "Offline" | "Typing...";

export type User = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  status?: Status;
  password?: string;
};

export type Attachment = {
  _id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

export type Message = {
  _id: string;
  content: string;
  createdAt: string;
  user: User | string;
  room: Room;
  attachment: Attachment;
};

export type Room = {
  _id: string;
  name?: string;
  users: User[] | string[];
  messages?: Message[];
  typers: string[];
};
