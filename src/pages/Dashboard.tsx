import { PatientCard } from '@/components/PatientCard';
import { usePatients } from '@/hooks/usePatients';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { patients, loading, error } = usePatients();

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
        {patients.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No patients in queue</h2>
            <p className="text-muted-foreground">New patients will appear here automatically</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}