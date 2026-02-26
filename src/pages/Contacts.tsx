import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import ContactDetailSheet from '@/components/ContactDetailSheet';
import AddContactModal from '@/components/AddContactModal';
import { useContacts, type Contact } from '@/hooks/useContacts';

export default function Contacts() {
  const { data: contacts = [], isLoading } = useContacts();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 pt-12 pb-3 space-y-3">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl bg-secondary border-0 h-10"
          />
        </div>
      </div>

      <div className="px-4 pt-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <Users className="h-12 w-12 opacity-40" />
            <p className="text-sm">{search ? 'No contacts match your search' : 'No contacts yet'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(contact => (
              <button
                key={contact.id}
                onClick={() => { setSelected(contact); setSheetOpen(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{contact.name}</p>
                  {contact.phone && <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{contact.category}</Badge>
                  {contact.next_action_date && (
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(contact.next_action_date), 'MMM d')}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <ContactDetailSheet contact={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
      <AddContactModal open={addOpen} onOpenChange={setAddOpen} />
      <BottomNav />
    </div>
  );
}
