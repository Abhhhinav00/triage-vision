import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, AlertTriangle } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Patient = Database['public']['Tables']['patients']['Row'];

interface PatientCardProps {
  patient: Patient;
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
      return <AlertTriangle className="h-4 w-4" />;
    case 'Urgent':
      return <Activity className="h-4 w-4" />;
    case 'Stable':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export function PatientCard({ patient }: PatientCardProps) {
  const arrivalTime = new Date(patient.arrival_time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const vitals = patient.vitals as Record<string, any> | null;

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg border-l-4 border-l-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getTriageColor(patient.triage_level)} font-bold text-sm px-3 py-1`}
            >
              {getTriageIcon(patient.triage_level)}
              {patient.triage_level}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            {arrivalTime}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Patient ID:</span>
            <p className="font-mono text-base bg-muted px-3 py-2 rounded-md mt-1 font-semibold">
              {patient.id.slice(-8).toUpperCase()}
            </p>
          </div>
          
          {patient.symptoms && patient.symptoms.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Symptoms:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {patient.symptoms.slice(0, 3).map((symptom, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
                {patient.symptoms.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{patient.symptoms.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {vitals && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Vitals:</span>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                {Object.entries(vitals).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key}:</span>
                    <span className="font-mono">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}