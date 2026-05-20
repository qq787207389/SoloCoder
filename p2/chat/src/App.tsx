import { useEffect } from 'react';
import { useChatStore } from './store/useChatStore';
import { LoginForm } from './components/LoginForm';
import { ChatRoom } from './components/ChatRoom';

function App() {
  const currentUser = useChatStore((state) => state.currentUser);
  const isDarkMode = useChatStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return currentUser ? <ChatRoom /> : <LoginForm />;
}

export default App;
