import { useState, useRef } from 'react';
import { PatientCard } from '@/components/PatientCard';
import { PatientDetailsModal } from '@/components/PatientDetailsModal';
import { usePatients } from '@/hooks/usePatients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Users, Clock, AlertTriangle, Play, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Patient = Database['public']['Tables']['patients']['Row'];

export default function Dashboard() {
  const { patients, loading, error } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };

  const generateRandomPatient = () => {
    const names = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emma Davis', 'James Wilson', 'Lisa Garcia', 'David Miller', 'Anna Martinez', 'Robert Lopez', 'Jennifer Taylor'];
    const symptomsList = ['chest pain', 'shortness of breath', 'headache', 'nausea', 'dizziness', 'fever', 'abdominal pain', 'fatigue'];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const age = Math.floor(Math.random() * 80) + 18;
    const vitals = {
      heart_rate: Math.floor(Math.random() * 60) + 60,
      blood_pressure_systolic: Math.floor(Math.random() * 80) + 100,
      blood_pressure_diastolic: Math.floor(Math.random() * 40) + 60,
      spo2: Math.floor(Math.random() * 20) + 80,
      temperature: (Math.random() * 4 + 96.5).toFixed(1),
      respiratory_rate: Math.floor(Math.random() * 20) + 12
    };
    
    const numSymptoms = Math.floor(Math.random() * 3) + 1;
    const symptoms = Array.from(
      { length: numSymptoms }, 
      () => symptomsList[Math.floor(Math.random() * symptomsList.length)]
    ).filter((symptom, index, arr) => arr.indexOf(symptom) === index);
    
    // Rule-based triage classification
    let triage_level = 'Stable';
    let explanation = 'Vital signs and symptoms are stable.';
    
    if (vitals.spo2 < 90 || vitals.blood_pressure_systolic > 180) {
      triage_level = 'Critical';
      explanation = 'Critically low spO2 or high blood pressure.';
    } else if (symptoms.includes('chest pain')) {
      triage_level = 'Urgent';
      explanation = 'Patient is reporting chest pain.';
    }
    
    return {
      symptoms,
      vitals,
      triage_level,
      explanation
    };
  };

  const startSimulation = () => {
    setIsSimulating(true);
    simulationIntervalRef.current = setInterval(async () => {
      const patientData = generateRandomPatient();
      
      const { error } = await supabase
        .from('patients')
        .insert([patientData]);
      
      if (error) {
        console.error('Error inserting patient:', error);
      }
    }, 5000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  };

  const criticalCount = patients.filter(p => p.triage_level === 'Critical').length;
  const urgentCount = patients.filter(p => p.triage_level === 'Urgent').length;
  const stableCount = patients.filter(p => p.triage_level === 'Stable').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive font-semibold">Error loading patients</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Emergency Room Triage
              </h1>
              <p className="text-muted-foreground text-sm">Live patient queue</p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{patients.length} patients</span>
              </div>
              <Badge className="bg-critical text-critical-foreground">
                {criticalCount} Critical
              </Badge>
              <Badge className="bg-urgent text-urgent-foreground">
                {urgentCount} Urgent
              </Badge>
              <Badge className="bg-stable text-stable-foreground">
                {stableCount} Stable
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Simulation Controls */}
        <div className="mb-6 flex justify-center">
          <Button 
            onClick={isSimulating ? stopSimulation : startSimulation}
            variant={isSimulating ? "destructive" : "default"}
            className="gap-2"
          >
            {isSimulating ? (
              <>
                <Square className="h-4 w-4" />
                Stop Patient Simulation
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Patient Simulation
              </>
            )}
          </Button>
        </div>

        {patients.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No patients in queue</h2>
            <p className="text-muted-foreground">New patients will appear here automatically</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {patients.map((patient) => (
              <PatientCard 
                key={patient.id} 
                patient={patient} 
                onClick={handlePatientClick}
              />
            ))}
          </div>
        )}

        {/* Patient Details Modal */}
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </main>
    </div>
  );
}