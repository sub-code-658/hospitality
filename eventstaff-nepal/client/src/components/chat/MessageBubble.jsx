import { useAuth } from "../../context/AuthContext";
import { formatTime } from "../../utils/formatDate";

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.sender._id === user.id || message.sender === user.id;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isOwn
            ? "bg-primary-500/80 text-[color:var(--text-main)] text-[color:var(--text-primary)] rounded-br-none"
            : "bg-[color:var(--surface-raised)] text-[color:var(--text-main)]/90 text-[color:var(--text-primary)]/90 rounded-bl-none border border-[color:var(--border)]"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${isOwn ? "text-[color:var(--text-main)]/60 text-[color:var(--text-primary)]/60" : "text-[color:var(--text-main)]/40 text-[color:var(--text-primary)]/40"}`}
        >
          {formatTime(message.sentAt || message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
