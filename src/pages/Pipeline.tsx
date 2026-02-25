import { useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { useContacts, useUpdateContact, CATEGORIES, type Contact, type ContactCategory } from '@/hooks/useContacts';
import ContactDetailSheet from '@/components/ContactDetailSheet';
import AddContactModal from '@/components/AddContactModal';
import BottomNav from '@/components/BottomNav';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Pipeline() {
  const { data: contacts = [], isLoading } = useContacts();
  const updateContact = useUpdateContact();
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const dragItem = useRef<string | null>(null);

  const handleDragStart = (id: string) => {
    dragItem.current = id;
  };

  const handleDrop = async (category: ContactCategory) => {
    if (!dragItem.current) return;
    const contact = contacts.find(c => c.id === dragItem.current);
    if (!contact || contact.category === category) return;
    try {
      await updateContact.mutateAsync({ id: contact.id, category });
      toast.success(`Moved to ${category}`);
    } catch { toast.error('Failed to move'); }
    dragItem.current = null;
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">{contacts.length} total leads</p>
      </header>

      <div className="px-5 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {CATEGORIES.map(cat => {
            const catContacts = contacts.filter(c => c.category === cat);
            return (
              <div
                key={cat}
                className="w-[260px] shrink-0"
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(cat)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{cat}</h3>
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{catContacts.length}</span>
                </div>
                <div className="space-y-2">
                  {catContacts.map(c => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => handleDragStart(c.id)}
                      onClick={() => setDetailContact(c)}
                      className="p-3 rounded-xl bg-card border border-border cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                    >
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      {c.next_action_task && <p className="text-xs text-muted-foreground truncate mt-1">{c.next_action_task}</p>}
                      {c.next_action_date && (
                        <p className="text-xs text-muted-foreground mt-1">{format(parseISO(c.next_action_date), 'MMM d')}</p>
                      )}
                    </div>
                  ))}
                  {catContacts.length === 0 && !isLoading && (
                    <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddContactModal open={addOpen} onOpenChange={setAddOpen} />
      <ContactDetailSheet contact={detailContact} open={!!detailContact} onOpenChange={o => !o && setDetailContact(null)} />
      <BottomNav />
    </div>
  );
}
