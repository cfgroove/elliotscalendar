import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Phone, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function ContactDetailSheet({ contact, open, onOpenChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Warm Lead');
  const [date, setDate] = useState<Date | undefined>();
  const [task, setTask] = useState('');
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone || '');
      setNotes(contact.notes || '');
      setCategory(contact.category as ContactCategory);
      setDate(contact.next_action_date ? new Date(contact.next_action_date) : undefined);
      setTask(contact.next_action_task || '');
      setEditing(false);
    }
  }, [contact]);

  if (!contact) return null;

  const handleSave = async () => {
    try {
      await updateContact.mutateAsync({
        id: contact.id,
        name: name.trim(),
        phone: phone.trim() || null,
        notes: notes.trim() || null,
        category,
        next_action_date: date ? format(date, 'yyyy-MM-dd') : null,
        next_action_task: task.trim() || null,
      });
      toast.success('Updated!');
      setEditing(false);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    try {
      await deleteContact.mutateAsync(contact.id);
      toast.success('Deleted');
      onOpenChange(false);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-3xl border-border bg-card max-h-[85vh]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle className="text-xl">{editing ? 'Edit Contact' : contact.name}</DrawerTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setEditing(!editing)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-4 overflow-y-auto">
          {editing ? (
            <>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} maxLength={100} className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000} className="rounded-xl bg-secondary border-0 min-h-[80px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
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
                        {date ? format(date, 'MMM d') : 'Pick'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl bg-card border-border" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Task</Label>
                <Input value={task} onChange={e => setTask(e.target.value)} maxLength={200} className="rounded-xl bg-secondary border-0 h-11" />
              </div>
              <Button onClick={handleSave} disabled={updateContact.isPending} className="w-full h-12 rounded-xl font-semibold">
                {updateContact.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              {contact.phone && (
                <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${contact.phone}`} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="font-medium">Call</span>
                  </a>
                  <a href={`sms:${contact.phone}`} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-medium">Text</span>
                  </a>
                </div>
              )}
              <div className="p-3 rounded-xl bg-secondary space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p>
                <p className="font-medium">{contact.category}</p>
              </div>
              {contact.next_action_date && (
                <div className="p-3 rounded-xl bg-secondary space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Action</p>
                  <p className="font-medium">{contact.next_action_task || 'Follow up'} — {format(new Date(contact.next_action_date), 'PPP')}</p>
                </div>
              )}
              {contact.notes && (
                <div className="p-3 rounded-xl bg-secondary space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
