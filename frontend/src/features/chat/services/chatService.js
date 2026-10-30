import { mentors, messagesByMentor } from "../mock/chatData";

const wait = (value) => Promise.resolve(structuredClone(value));

export const chatService = {
  getConversations: () => wait(mentors),
  getMessages: (conversationId) => wait(messagesByMentor[conversationId] || []),
  sendMessage: (message) => wait(message),
  markAsRead: () => wait({ success: true }),
  uploadFile: (file) => wait({ name: file.name, size: file.size }),
  connectSignalR: () => wait({ connected: false, mock: true }),
  disconnectSignalR: () => wait({ connected: false, mock: true }),
};

export default chatService;
