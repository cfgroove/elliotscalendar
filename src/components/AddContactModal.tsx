import { useState } from 'react';
import { format, addDays, addMonths } from 'date-fns';
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

type DatePresetKey = 'today' | 'tomorrow' | 'next_week' | 'next_month' | 'custom';

const datePresets: { key: DatePresetKey; label: string; getValue?: () => Date }[] = [
  { key: 'today', label: 'Today', getValue: () => new Date() },
  { key: 'tomorrow', label: 'Tomorrow', getValue: () => addDays(new Date(), 1) },
  { key: 'next_week', label: 'Next Week', getValue: () => addDays(new Date(), 7) },
  { key: 'next_month', label: 'Next Month', getValue: () => addMonths(new Date(), 1) },
  { key: 'custom', label: 'Custom' },
];

export default function AddContactModal({ open, onOpenChange }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Warm Lead');
  const [date, setDate] = useState<Date | undefined>();
  const [task, setTask] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<DatePresetKey | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const createContact = useCreateContact();

  const reset = () => {
    setName(''); setPhone(''); setNotes(''); setCategory('Warm Lead');
    setDate(undefined); setTask(''); setSelectedPreset(null);
  };

  const handlePreset = (preset: typeof datePresets[number]) => {
    if (preset.key === 'custom') {
      setSelectedPreset('custom');
      setCustomOpen(true);
    } else {
      setSelectedPreset(preset.key);
      setDate(preset.getValue!());
      setCustomOpen(false);
    }
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
      <DialogContent className="rounded-2xl border-border bg-card w-[calc(100%-2rem)] max-w-md p-0 gap-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-xl">Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto max-h-[85vh]">
          {/* Section 1: Contact Info */}
          <div className="p-5 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required maxLength={100} className="rounded-xl bg-secondary border-0 h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" maxLength={20} className="rounded-xl bg-secondary border-0 h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Pipeline Stage</Label>
              <Select value={category} onValueChange={v => setCategory(v as ContactCategory)}>
                <SelectTrigger className="rounded-xl bg-secondary border-0 h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border">
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Meeting context, preferences..." maxLength={1000} className="rounded-xl bg-secondary border-0 min-h-[70px] resize-none" />
            </div>
          </div>

          {/* Section 2: Next Interaction */}
          <div className="border-t border-border">
            <div className="px-5 py-3 bg-primary/10">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">Next Interaction</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Task</Label>
                <Input value={task} onChange={e => setTask(e.target.value)} placeholder='e.g. "Follow up call", "Send proposal"' maxLength={200} className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">When</Label>
                <div className="flex flex-wrap gap-2">
                  {datePresets.map(p => (
                    p.key === 'custom' ? (
                      <Popover key={p.key} open={customOpen} onOpenChange={setCustomOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(
                              "rounded-full px-4 h-9 text-sm",
                              selectedPreset === 'custom'
                                ? "border-primary text-primary bg-primary/10"
                                : "border-border bg-secondary text-foreground"
                            )}
                            onClick={() => handlePreset(p)}
                          >
                            {selectedPreset === 'custom' && date ? format(date, 'MMM d') : 'Custom'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl bg-card border-border" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => { setDate(d); setCustomOpen(false); }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Button
                        key={p.key}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          "rounded-full px-4 h-9 text-sm",
                          selectedPreset === p.key
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border bg-secondary text-foreground"
                        )}
                        onClick={() => handlePreset(p)}
                      >
                        {p.label}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-5 pt-2 border-t border-border">
            <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => { reset(); onOpenChange(false); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createContact.isPending} className="flex-1 h-12 rounded-xl font-semibold">
              {createContact.isPending ? 'Saving...' : 'Save Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
