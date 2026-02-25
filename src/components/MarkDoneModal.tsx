import { useState } from 'react';
import { format, addDays, addMonths } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useUpdateContact, useDeleteContact, CATEGORIES, type Contact, type ContactCategory } from '@/hooks/useContacts';
import { toast } from 'sonner';

interface Props {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const datePresets = [
  { label: 'Tomorrow', getValue: () => addDays(new Date(), 1) },
  { label: 'Next Week', getValue: () => addDays(new Date(), 7) },
  { label: '1 Month', getValue: () => addMonths(new Date(), 1) },
  { label: '3 Months', getValue: () => addMonths(new Date(), 3) },
];

export default function MarkDoneModal({ contact, open, onOpenChange }: Props) {
  const [followUp, setFollowUp] = useState(true);
  const [category, setCategory] = useState<ContactCategory>('Monthly Follow Up');
  const [date, setDate] = useState<Date | undefined>();
  const [task, setTask] = useState('');
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  if (!contact) return null;

  const handleFollowUp = async () => {
    if (!date) { toast.error('Pick a follow-up date'); return; }
    try {
      await updateContact.mutateAsync({
        id: contact.id,
        category,
        next_action_date: format(date, 'yyyy-MM-dd'),
        next_action_task: task.trim() || null,
      });
      toast.success('Follow-up scheduled!');
      onOpenChange(false);
    } catch { toast.error('Failed to update'); }
  };

  const handleClose = async () => {
    try {
      await deleteContact.mutateAsync(contact.id);
      toast.success('Lead closed');
      onOpenChange(false);
    } catch { toast.error('Failed to close'); }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-3xl border-border bg-card max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl">Task Complete — {contact.name}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-4 overflow-y-auto">
          <div className="flex gap-2">
            <Button variant={followUp ? 'default' : 'secondary'} className="flex-1 rounded-xl" onClick={() => setFollowUp(true)}>
              Set Follow-Up
            </Button>
            <Button variant={!followUp ? 'destructive' : 'secondary'} className="flex-1 rounded-xl" onClick={() => setFollowUp(false)}>
              Close Lead
            </Button>
          </div>

          {followUp ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Category</Label>
                <Select value={category} onValueChange={v => setCategory(v as ContactCategory)}>
                  <SelectTrigger className="rounded-xl bg-secondary border-0 h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl bg-card border-border">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Next Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full rounded-xl bg-secondary border-0 h-11 justify-start", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl bg-card border-border" align="start">
                    <div className="flex gap-1 p-2 border-b border-border flex-wrap">
                      {datePresets.map(p => (
                        <Button key={p.label} variant="ghost" size="sm" className="rounded-lg text-xs" onClick={() => setDate(p.getValue())}>{p.label}</Button>
                      ))}
                    </div>
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Next Task</Label>
                <Input value={task} onChange={e => setTask(e.target.value)} placeholder='e.g. "Follow up call"' maxLength={200} className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <Button onClick={handleFollowUp} disabled={updateContact.isPending} className="w-full h-12 rounded-xl font-semibold">
                {updateContact.isPending ? 'Saving...' : 'Schedule Follow-Up'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">This will remove <strong>{contact.name}</strong> from your pipeline.</p>
              <Button variant="destructive" onClick={handleClose} disabled={deleteContact.isPending} className="w-full h-12 rounded-xl font-semibold">
                {deleteContact.isPending ? 'Closing...' : 'Close Lead'}
              </Button>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
