import { useState } from 'react';

export const useChatbot = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  const openChatbot = () => {
    setShowChatbot(true);
  };

  const closeChatbot = () => {
    setShowChatbot(false);
  };

  return {
    showChatbot,
    openChatbot,
    closeChatbot,
  };
};