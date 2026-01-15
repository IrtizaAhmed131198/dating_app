import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const ChatPage = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages/${matchId}`);
      setMessages(response.data);
    } catch (error) {
      if (loading) {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Get receiver ID from messages (the other user in the match)
      const receiverId = messages.length > 0 
        ? messages[0].sender_id === user.user_id 
          ? messages[0].receiver_id 
          : messages[0].sender_id
        : null;

      if (!receiverId) {
        toast.error('Unable to send message');
        return;
      }

      await axios.post(`${API}/messages/send`, {
        receiver_id: receiverId,
        content: newMessage
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-2xl font-bold text-purple-600">Loading chat...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
        <Card className="flex-1 flex flex-col bg-white shadow-lg border-2 border-pink-200">
          <CardHeader className="border-b border-pink-100">
            <CardTitle className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              💬 Chat
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start the conversation! 👋
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.user_id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.sender_id === user.user_id
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t border-pink-100">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border-2 border-pink-200 focus:border-pink-400"
                data-testid="message-input"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                data-testid="send-btn"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
