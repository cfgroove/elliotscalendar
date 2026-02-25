import { useState, useMemo } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useContacts, type Contact } from '@/hooks/useContacts';
import ContactDetailSheet from '@/components/ContactDetailSheet';
import AddContactModal from '@/components/AddContactModal';
import BottomNav from '@/components/BottomNav';
import { Plus, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarView() {
  const { data: contacts = [] } = useContacts();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const datesWithActions = useMemo(() => {
    const dates = new Set<string>();
    contacts.forEach(c => {
      if (c.next_action_date) dates.add(c.next_action_date);
    });
    return dates;
  }, [contacts]);

  const selectedContacts = useMemo(() =>
    contacts.filter(c => c.next_action_date && isSameDay(parseISO(c.next_action_date), selectedDate)),
    [contacts, selectedDate]
  );

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">{format(selectedDate, 'MMMM yyyy')}</p>
      </header>

      <div className="px-5 flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={d => d && setSelectedDate(d)}
          className="p-3 pointer-events-auto rounded-2xl bg-card border border-border"
          modifiers={{ hasAction: (date) => datesWithActions.has(format(date, 'yyyy-MM-dd')) }}
          modifiersClassNames={{ hasAction: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary' }}
        />
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h2>
        {selectedContacts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No actions on this date.</p>
        ) : (
          <div className="space-y-2">
            {selectedContacts.map(c => (
              <button
                key={c.id}
                onClick={() => setDetailContact(c)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.next_action_task || 'Follow up'}</p>
                </div>
                {c.phone && (
                  <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()} className="shrink-0 h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </button>
            ))}
          </div>
        )}
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
