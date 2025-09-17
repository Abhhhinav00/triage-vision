import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Activity, AlertTriangle, Heart, Thermometer, Droplets, Wind } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Patient = Database['public']['Tables']['patients']['Row'];

interface PatientDetailsModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

const getTriageColor = (level: string) => {
  switch (level) {
    case 'Critical':
      return 'bg-critical text-critical-foreground border-critical';
    case 'Urgent':
      return 'bg-urgent text-urgent-foreground border-urgent';
    case 'Stable':
      return 'bg-stable text-stable-foreground border-stable';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getTriageIcon = (level: string) => {
  switch (level) {
    case 'Critical':
      return <AlertTriangle className="h-5 w-5" />;
    case 'Urgent':
      return <Activity className="h-5 w-5" />;
    case 'Stable':
      return <Clock className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

const getVitalIcon = (key: string) => {
  switch (key.toLowerCase()) {
    case 'heart_rate':
    case 'pulse':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'temperature':
    case 'temp':
      return <Thermometer className="h-4 w-4 text-orange-500" />;
    case 'blood_pressure':
    case 'bp':
      return <Droplets className="h-4 w-4 text-blue-500" />;
    case 'respiratory_rate':
    case 'respiration':
      return <Wind className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const formatVitalKey = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

export function PatientDetailsModal({ patient, isOpen, onClose }: PatientDetailsModalProps) {
  if (!patient) return null;

  const arrivalTime = new Date(patient.arrival_time).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const vitals = patient.vitals as Record<string, any> | null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`${getTriageColor(patient.triage_level)} font-bold text-base px-4 py-2`}
            >
              {getTriageIcon(patient.triage_level)}
              {patient.triage_level}
            </Badge>
            Patient Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient ID and Arrival Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Patient ID</h3>
              <p className="font-mono text-lg bg-muted px-4 py-3 rounded-lg font-bold">
                {patient.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Arrival Time</h3>
              <div className="flex items-center gap-2 bg-muted px-4 py-3 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{arrivalTime}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Symptoms */}
          {patient.symptoms && patient.symptoms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {patient.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Vital Signs */}
          {vitals && Object.keys(vitals).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Vital Signs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(vitals).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3 bg-muted p-4 rounded-lg">
                    {getVitalIcon(key)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {formatVitalKey(key)}
                      </p>
                      <p className="font-mono text-lg font-semibold">
                        {String(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* AI-Generated Explanation */}
          {patient.explanation && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                AI-Generated Explanation
              </h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-foreground leading-relaxed">
                  {patient.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}