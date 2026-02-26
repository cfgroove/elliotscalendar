import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Search, RotateCcw, Archive as ArchiveIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useArchivedContacts, useRestoreContact } from '@/hooks/useContacts';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

export default function Archive() {
  const { data: contacts = [], isLoading } = useArchivedContacts();
  const restoreContact = useRestoreContact();
  const [search, setSearch] = useState('');

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRestore = async (id: string, name: string) => {
    try {
      await restoreContact.mutateAsync(id);
      toast.success(`${name} restored`);
    } catch {
      toast.error('Failed to restore');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-4 space-y-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold">Archived Leads</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search archived leads..."
            className="pl-10 rounded-xl bg-secondary border-0 h-11"
          />
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <ArchiveIcon className="h-12 w-12 opacity-30" />
            <p className="text-sm">{search ? 'No matching archived leads' : 'No archived leads yet'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border animate-fade-in"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.phone || 'No phone'} · {contact.category}
                  </p>
                  {contact.archived_at && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Archived {format(parseISO(contact.archived_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl shrink-0 gap-1.5"
                  disabled={restoreContact.isPending}
                  onClick={() => handleRestore(contact.id, contact.name)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
