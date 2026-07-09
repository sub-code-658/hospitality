import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/formatDate";

const ConversationList = ({ conversations, selectedUser, onSelect }) => {
  const { user } = useAuth();

  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-[color:var(--text-main)]/50 text-[color:var(--text-primary)]/50">
          {t("common.no_conversations_yet", "No conversations yet")}
        </p>
        <p className="text-[color:var(--text-main)]/30 text-[color:var(--text-primary)]/30 text-sm mt-1">
          {t(
            "common.start_chatting_with_organizers",
            "Start chatting with organizers or workers",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[500px]">
      {conversations.map((conv) => {
        const partner = conv.partner;
        const isSelected = selectedUser?._id === partner._id;
        const isOnline = partner.isOnline;

        return (
          <div
            key={partner._id}
            onClick={() => onSelect(partner)}
            className={`p-4 border-b border-white/5 cursor-pointer transition-all duration-300 ${
              isSelected
                ? "bg-[color:var(--surface-raised)]"
                : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary-500/30 flex items-center justify-center">
                  <span className="text-primary-200 font-semibold text-lg">
                    {partner.name?.charAt(0) || "U"}
                  </span>
                </div>
                {isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[color:var(--surface-raised)] rounded-full border-2 border-transparent"></div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[color:var(--text-main)] text-[color:var(--text-primary)] truncate">
                    {partner.name}
                  </span>
                  <span className="text-xs text-[color:var(--text-main)]/40 text-[color:var(--text-primary)]/40">
                    {conv.lastMessage &&
                      formatDate(conv.lastMessage.sentAt, {
                        format: "relative",
                      })}
                  </span>
                </div>
                <p className="text-sm text-[color:var(--text-main)]/50 text-[color:var(--text-primary)]/50 truncate">
                  {conv.lastMessage?.content || "No messages"}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="ml-2 bg-primary-500 text-[color:var(--text-main)] text-[color:var(--text-primary)] text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
