import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useContacts, useUpdateContact, CATEGORIES, type Contact, type ContactCategory } from '@/hooks/useContacts';
import ContactDetailSheet from '@/components/ContactDetailSheet';
import AddContactModal from '@/components/AddContactModal';
import BottomNav from '@/components/BottomNav';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, ChevronLeft, ChevronRight, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const SHORT_LABELS: Record<ContactCategory, string> = {
  'Warm Lead': 'Warm',
  'Call Soon': 'Call',
  'Ready to Inspect': 'Ready',
  'Monthly Follow Up': 'Follow Up',
};

export default function Pipeline() {
  const { data: contacts = [], isLoading } = useContacts();
  const updateContact = useUpdateContact();
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const moveContact = async (contact: Contact, direction: -1 | 1) => {
    const currentIndex = CATEGORIES.indexOf(contact.category as ContactCategory);
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= CATEGORIES.length) return;
    const newCategory = CATEGORIES[newIndex];
    try {
      await updateContact.mutateAsync({ id: contact.id, category: newCategory });
      toast.success(`Moved to ${newCategory}`);
    } catch {
      toast.error('Failed to move');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">{contacts.length} total leads</p>
      </header>

      <Tabs defaultValue={CATEGORIES[0]} className="px-5">
        <TabsList className="w-full grid grid-cols-4">
          {CATEGORIES.map(cat => {
            const count = contacts.filter(c => c.category === cat).length;
            return (
              <TabsTrigger key={cat} value={cat} className="text-xs px-1">
                {SHORT_LABELS[cat]} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CATEGORIES.map((cat, catIndex) => {
          const catContacts = contacts.filter(c => c.category === cat);
          return (
            <TabsContent key={cat} value={cat} className="mt-4 space-y-3">
              {catContacts.map(c => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setDetailContact(c)}
                    >
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      {c.next_action_task && (
                        <p className="text-xs text-muted-foreground truncate mt-1">{c.next_action_task}</p>
                      )}
                      {c.next_action_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(c.next_action_date), 'MMM d')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {catIndex > 0 && (
                        <button
                          onClick={() => moveContact(c, -1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      {catIndex < CATEGORIES.length - 1 && (
                        <button
                          onClick={() => moveContact(c, 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                  {c.phone && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                      <a
                        href={`tel:${c.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </a>
                      <a
                        href={`sms:${c.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
              {catContacts.length === 0 && !isLoading && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No leads in this stage
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

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
