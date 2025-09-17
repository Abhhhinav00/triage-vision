import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Patient = Database['public']['Tables']['patients']['Row'];

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('arrival_time', { ascending: false });

        if (error) {
          throw error;
        }

        setPatients(data || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('patients-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patients'
        },
        (payload) => {
          console.log('New patient:', payload.new);
          setPatients(current => [payload.new as Patient, ...current]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'patients'
        },
        (payload) => {
          console.log('Patient updated:', payload.new);
          setPatients(current => 
            current.map(patient => 
              patient.id === payload.new.id ? payload.new as Patient : patient
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'patients'
        },
        (payload) => {
          console.log('Patient deleted:', payload.old);
          setPatients(current => 
            current.filter(patient => patient.id !== payload.old.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Sort patients by triage priority
  const sortedPatients = patients.sort((a, b) => {
    const priority = { Critical: 3, Urgent: 2, Stable: 1 };
    const aPriority = priority[a.triage_level] || 0;
    const bPriority = priority[b.triage_level] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // If same priority, sort by arrival time (oldest first)
    return new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime();
  });

  return {
    patients: sortedPatients,
    loading,
    error
  };
}