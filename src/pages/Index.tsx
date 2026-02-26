import { useState, useMemo } from 'react';
import { format, isToday, isBefore, startOfDay, parseISO, addDays, startOfWeek, endOfWeek, isWithinInterval, isSameDay } from 'date-fns';
import { Plus, Check, Circle, Phone, MessageSquare, ChevronRight, LogOut, Calendar, Clock, CalendarDays, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useContacts, type Contact } from '@/hooks/useContacts';
import AddContactModal from '@/components/AddContactModal';
import MarkDoneModal from '@/components/MarkDoneModal';
import ContactDetailSheet from '@/components/ContactDetailSheet';
import BottomNav from '@/components/BottomNav';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { displayName, signOut } = useAuth();
  const { data: contacts = [], isLoading } = useContacts();
  const [addOpen, setAddOpen] = useState(false);
  const [doneContact, setDoneContact] = useState<Contact | null>(null);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState('daily');
  const [searchQuery, setSearchQuery] = useState('');

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const weekEnd = addDays(today, 7);
  const monthEnd = addDays(today, 30);

  const searchLower = searchQuery.toLowerCase();

  const dailyTasks = useMemo(() =>
    contacts.filter(c => {
      if (!c.next_action_date) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchLower)) return false;
      const d = parseISO(c.next_action_date);
      return isToday(d) || isBefore(d, today);
    }).sort((a, b) => parseISO(a.next_action_date!).getTime() - parseISO(b.next_action_date!).getTime()),
    [contacts, today, searchLower]
  );

  const weeklyTasks = useMemo(() =>
    contacts.filter(c => {
      if (!c.next_action_date) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchLower)) return false;
      const d = startOfDay(parseISO(c.next_action_date));
      return isWithinInterval(d, { start: tomorrow, end: weekEnd });
    }).sort((a, b) => parseISO(a.next_action_date!).getTime() - parseISO(b.next_action_date!).getTime()),
    [contacts, tomorrow, weekEnd, searchLower]
  );

  const monthlyTasks = useMemo(() =>
    contacts.filter(c => {
      if (!c.next_action_date) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchLower)) return false;
      const d = startOfDay(parseISO(c.next_action_date));
      return isWithinInterval(d, { start: addDays(weekEnd, 1), end: monthEnd });
    }).sort((a, b) => parseISO(a.next_action_date!).getTime() - parseISO(b.next_action_date!).getTime()),
    [contacts, weekEnd, monthEnd, searchLower]
  );

  // Group weekly tasks by day
  const weeklyGrouped = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    weeklyTasks.forEach(c => {
      const key = format(parseISO(c.next_action_date!), 'yyyy-MM-dd');
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [weeklyTasks]);

  // Group monthly tasks by week
  const monthlyGrouped = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    monthlyTasks.forEach(c => {
      const d = parseISO(c.next_action_date!);
      const ws = startOfWeek(d, { weekStartsOn: 1 });
      const we = endOfWeek(d, { weekStartsOn: 1 });
      const key = `${format(ws, 'yyyy-MM-dd')}|${format(ws, 'MMM d')}–${format(we, 'd')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [monthlyTasks]);

  const overdueTasks = dailyTasks.filter(c => isBefore(parseISO(c.next_action_date!), today));
  const dueTodayTasks = dailyTasks.filter(c => isToday(parseISO(c.next_action_date!)));

  const summaryText = activeTab === 'daily'
    ? dailyTasks.length > 0
      ? `You have ${dailyTasks.length} action${dailyTasks.length > 1 ? 's' : ''} today.`
      : "You're all caught up — no actions today."
    : activeTab === 'weekly'
      ? weeklyTasks.length > 0
        ? `You have ${weeklyTasks.length} action${weeklyTasks.length > 1 ? 's' : ''} this week.`
        : "No upcoming actions this week."
      : monthlyTasks.length > 0
        ? `You have ${monthlyTasks.length} action${monthlyTasks.length > 1 ? 's' : ''} this month.`
        : "No upcoming actions this month.";

  return (
    <div className="min-h-screen pb-24">
      <header className="px-5 pt-6 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {getGreeting()}, {displayName || 'there'}.
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{summaryText}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      <main className="px-5 space-y-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-9 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-secondary rounded-xl h-11">
            <TabsTrigger value="daily" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="h-3.5 w-3.5" />
              Daily
              {dailyTasks.length > 0 && <span className="ml-1 min-w-5 h-5 rounded-full bg-primary-foreground/20 text-[10px] flex items-center justify-center">{dailyTasks.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Weekly
              {weeklyTasks.length > 0 && <span className="ml-1 min-w-5 h-5 rounded-full bg-primary-foreground/20 text-[10px] flex items-center justify-center">{weeklyTasks.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-lg text-xs font-semibold gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Monthly
              {monthlyTasks.length > 0 && <span className="ml-1 min-w-5 h-5 rounded-full bg-primary-foreground/20 text-[10px] flex items-center justify-center">{monthlyTasks.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4 space-y-6">
            {isLoading ? <LoadingSkeleton /> : dailyTasks.length === 0 ? (
              <EmptyState message="No actions scheduled for today." />
            ) : (
              <>
                {overdueTasks.length > 0 && (
                  <section>
                    <h2 className="text-xs uppercase tracking-wider text-warning font-semibold mb-3">Overdue</h2>
                    <div className="space-y-3">
                      {overdueTasks.map(c => (
                        <TaskCard key={c.id} contact={c} overdue onDone={() => setDoneContact(c)} onTap={() => setDetailContact(c)} />
                      ))}
                    </div>
                  </section>
                )}
                {dueTodayTasks.length > 0 && (
                  <section>
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Today</h2>
                    <div className="space-y-3">
                      {dueTodayTasks.map(c => (
                        <TaskCard key={c.id} contact={c} onDone={() => setDoneContact(c)} onTap={() => setDetailContact(c)} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="mt-4 space-y-6">
            {isLoading ? <LoadingSkeleton /> : weeklyTasks.length === 0 ? (
              <EmptyState message="No actions scheduled this week." />
            ) : (
              weeklyGrouped.map(([dateKey, tasks]) => (
                <section key={dateKey}>
                  <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                    {format(parseISO(dateKey), 'EEEE, MMM d')}
                  </h2>
                  <div className="space-y-3">
                    {tasks.map(c => (
                      <TaskCard key={c.id} contact={c} onDone={() => setDoneContact(c)} onTap={() => setDetailContact(c)} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </TabsContent>

          <TabsContent value="monthly" className="mt-4 space-y-6">
            {isLoading ? <LoadingSkeleton /> : monthlyTasks.length === 0 ? (
              <EmptyState message="No actions scheduled this month." />
            ) : (
              monthlyGrouped.map(([key, tasks]) => {
                const label = key.split('|')[1];
                return (
                  <section key={key}>
                    <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">{label}</h2>
                    <div className="space-y-3">
                      {tasks.map(c => (
                        <TaskCard key={c.id} contact={c} onDone={() => setDoneContact(c)} onTap={() => setDetailContact(c)} />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>

      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddContactModal open={addOpen} onOpenChange={setAddOpen} />
      <MarkDoneModal contact={doneContact} open={!!doneContact} onOpenChange={o => !o && setDoneContact(null)} />
      <ContactDetailSheet contact={detailContact} open={!!detailContact} onOpenChange={o => !o && setDetailContact(null)} />
      <BottomNav />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 rounded-2xl bg-card animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold mb-1">All clear</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function TaskCard({ contact, overdue, onDone, onTap }: { contact: Contact; overdue?: boolean; onDone: () => void; onTap: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border animate-fade-in group/card">
      <button
        onClick={(e) => { e.stopPropagation(); onDone(); }}
        className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all border-2 group/btn hover:animate-none ${overdue ? 'border-warning ring-2 ring-warning/30 animate-pulse hover:bg-warning/10 hover:text-warning' : 'border-primary ring-2 ring-primary/30 animate-pulse hover:bg-primary/10 hover:text-primary'}`}
      >
        <Circle className={`h-5 w-5 group-hover/btn:hidden ${overdue ? 'text-warning/40' : 'text-primary/40'}`} />
        <Check className={`h-5 w-5 hidden group-hover/btn:block ${overdue ? 'text-warning' : 'text-primary'}`} />
      </button>
      <button onClick={onTap} className="flex-1 text-left min-w-0">
        <p className="text-sm font-semibold truncate">{contact.next_action_task || 'Follow up'}</p>
        <p className="text-sm text-muted-foreground truncate">{contact.name}</p>
      </button>
      {contact.phone && (
        <>
          <a href={`sms:${contact.phone}`} onClick={e => e.stopPropagation()} className="shrink-0 h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="h-4 w-4" />
          </a>
          <a href={`tel:${contact.phone}`} onClick={e => e.stopPropagation()} className="shrink-0 h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
          </a>
        </>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}
