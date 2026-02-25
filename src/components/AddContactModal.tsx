import { useState } from 'react';
import { format, addDays, addMonths } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useCreateContact, CATEGORIES, type ContactCategory } from '@/hooks/useContacts';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const datePresets = [
  { label: 'Tomorrow', getValue: () => addDays(new Date(), 1) },
  { label: 'Next Week', getValue: () => addDays(new Date(), 7) },
  { label: '2 Weeks', getValue: () => addDays(new Date(), 14) },
  { label: '1 Month', getValue: () => addMonths(new Date(), 1) },
  { label: '3 Months', getValue: () => addMonths(new Date(), 3) },
];

export default function AddContactModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Warm Lead');
  const [date, setDate] = useState<Date | undefined>();
  const [task, setTask] = useState('');
  const createContact = useCreateContact();

  const reset = () => {
    setName(''); setPhone(''); setNotes(''); setCategory('Warm Lead'); setDate(undefined); setTask('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createContact.mutateAsync({
        name: name.trim(),
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        category,
        next_action_date: date ? format(date, 'yyyy-MM-dd') : null,
        next_action_task: task.trim() || null,
      });
      toast.success('Lead added!');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to add lead');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border bg-card max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required maxLength={100} className="rounded-xl bg-secondary border-0 h-11" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" maxLength={20} className="rounded-xl bg-secondary border-0 h-11" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Meeting context, preferences..." maxLength={1000} className="rounded-xl bg-secondary border-0 min-h-[80px] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={v => setCategory(v as ContactCategory)}>
                <SelectTrigger className="rounded-xl bg-secondary border-0 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border">
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Next Action</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full rounded-xl bg-secondary border-0 h-11 justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'MMM d') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-xl bg-card border-border" align="start">
                  <div className="flex gap-1 p-2 border-b border-border flex-wrap">
                    {datePresets.map(p => (
                      <Button key={p.label} variant="ghost" size="sm" className="rounded-lg text-xs" onClick={() => setDate(p.getValue())}>
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Task</Label>
            <Input value={task} onChange={e => setTask(e.target.value)} placeholder='e.g. "Follow up call", "Send proposal"' maxLength={200} className="rounded-xl bg-secondary border-0 h-11" />
          </div>
          <Button type="submit" disabled={createContact.isPending} className="w-full h-12 rounded-xl text-base font-semibold">
            {createContact.isPending ? 'Adding...' : 'Add Lead'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
