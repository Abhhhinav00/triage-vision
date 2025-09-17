-- Create a table for emergency room patients
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  arrival_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vitals JSONB,
  symptoms TEXT[],
  triage_level TEXT NOT NULL CHECK (triage_level IN ('Critical', 'Urgent', 'Stable')),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an ER dashboard)
CREATE POLICY "Patients are viewable by everyone" 
ON public.patients 
FOR SELECT 
USING (true);

CREATE POLICY "Patients can be inserted by everyone" 
ON public.patients 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Patients can be updated by everyone" 
ON public.patients 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the patients table
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;