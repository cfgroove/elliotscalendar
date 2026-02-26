import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = ['Bug', 'Feature Request', 'General'] as const;

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>('General');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { user, displayName } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: {
          message: message.trim(),
          category,
          userName: displayName || 'Unknown',
          userEmail: user?.email || '',
        },
      });
      if (error) throw error;
      toast({ title: 'Feedback sent!', description: 'Thanks for your input 🙌' });
      setMessage('');
      setCategory('General');
      setOpen(false);
    } catch (err) {
      toast({ title: 'Failed to send', description: 'Please try again later.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 left-5 z-40 h-12 w-12 rounded-full bg-secondary text-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Send feedback"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      {/* Feedback panel */}
      {open && (
        <div className="fixed bottom-20 left-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl bg-card border border-border shadow-xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Send Feedback</h3>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-3">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  category === c
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="What's on your mind?"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="min-h-[100px] rounded-xl resize-none mb-3"
          />

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
            className="w-full rounded-xl gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Feedback'}
          </Button>
        </div>
      )}
    </>
  );
}
