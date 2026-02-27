import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

const ChatPage = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!conversationId || !user) return;
      // Get conversation info
      const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
      if (conv) {
        const otherId = (conv as any).participant1 === user.id ? (conv as any).participant2 : (conv as any).participant1;
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', otherId).single();
        setOtherName(profile?.display_name || 'مستخدم');
      }
      // Get messages
      const { data: msgs } = await supabase.from('chat_messages').select('*')
        .eq('conversation_id', conversationId).order('created_at', { ascending: true });
      setMessages((msgs as any[]) || []);
      setLoading(false);

      // Mark unread as read
      await supabase.from('chat_messages').update({ read: true } as any)
        .eq('conversation_id', conversationId).neq('sender_id', user.id).eq('read', false);
    };
    fetch();

    // Realtime
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          // Mark as read if from other user
          if ((payload.new as any).sender_id !== user?.id) {
            supabase.from('chat_messages').update({ read: true } as any).eq('id', (payload.new as any).id).then();
          }
        }
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!user || !text.trim() || !conversationId) return;
    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: conversationId, sender_id: user.id, content: text.trim(),
    } as any);
    if (!error) {
      setText('');
      // Update conversation updated_at
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() } as any).eq('id', conversationId);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col" dir="rtl">
      <div className="p-4 sm:p-6 pb-0">
        <div className="max-w-2xl mx-auto">
          <PageHeader title={otherName || 'محادثة'} backTo="/market/conversations" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">ابدأ المحادثة...</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground rounded-bl-sm'
                    : 'bg-card border border-border text-foreground rounded-br-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-4 sm:px-6 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input value={text} onChange={e => setText(e.target.value)} placeholder="اكتب رسالة..."
            onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1" />
          <Button size="icon" onClick={handleSend} disabled={sending || !text.trim()}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
