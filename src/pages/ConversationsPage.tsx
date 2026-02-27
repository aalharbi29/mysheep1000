import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Loader2, MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  listing_id: string;
  participant1: string;
  participant2: string;
  updated_at: string;
  otherName?: string;
  lastMessage?: string;
  unreadCount?: number;
}

const ConversationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (!data) { setLoading(false); return; }

      const enriched = await Promise.all((data as any[]).map(async (conv) => {
        const otherId = conv.participant1 === user.id ? conv.participant2 : conv.participant1;
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', otherId).single();
        const { data: lastMsg } = await supabase.from('chat_messages').select('content,read,sender_id')
          .eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1).single();
        const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id).eq('read', false).neq('sender_id', user.id);
        return {
          ...conv,
          otherName: profile?.display_name || 'مستخدم',
          lastMessage: (lastMsg as any)?.content || '',
          unreadCount: count || 0,
        };
      }));

      setConversations(enriched);
      setLoading(false);
    };
    fetchConversations();
  }, [user]);

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="المحادثات" backTo="/market" />
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">لا توجد محادثات</p>
          </div>
        ) : (
          <div className="space-y-3 mt-6">
            {conversations.map(conv => (
              <button key={conv.id} onClick={() => navigate(`/market/chat/${conv.id}`)}
                className="w-full bg-card rounded-xl p-4 shadow-sm border border-border text-right flex items-center gap-3 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{conv.otherName}</span>
                    {conv.unreadCount! > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
