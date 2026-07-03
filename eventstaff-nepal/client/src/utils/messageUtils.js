import api from '../api/axios';

// Utility to handle message initiation
export const initiateConversation = async (userId, navigate) => {
  try {
    // 1. Check/Create conversation via your existing backend initiation endpoint
    const { data } = await api.post('/messages/initiate', { receiverId: userId });
    
    // 2. Redirect to messages page with the conversation pre-selected
    navigate('/messages', { state: { conversationId: data._id } });
  } catch (err) {
    console.error("Failed to start chat", err);
  }
};
