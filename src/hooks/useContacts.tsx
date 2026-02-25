import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Contact = Tables<'contacts'>;
export type ContactInsert = TablesInsert<'contacts'>;
export type ContactUpdate = TablesUpdate<'contacts'>;
export type ContactCategory = 'Warm Lead' | 'Call Soon' | 'Ready to Inspect' | 'Monthly Follow Up';

export const CATEGORIES: ContactCategory[] = ['Warm Lead', 'Call Soon', 'Ready to Inspect', 'Monthly Follow Up'];

export function useContacts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('next_action_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contact: Omit<ContactInsert, 'user_id'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...contact, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ContactUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}
