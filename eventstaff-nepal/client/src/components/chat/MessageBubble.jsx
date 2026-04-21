import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatDate';

const MessageBubble = ({ message }) => {
  const { user } = useAuth();
  const isOwn = message.sender._id === user.id || message.sender === user.id;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isOwn
            ? 'bg-primary-500/80 text-white rounded-br-none'
            : 'bg-white/10 text-white/90 rounded-bl-none border border-white/10'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-white/60' : 'text-white/40'}`}>
          {formatTime(message.sentAt || message.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;