-- Create a new table for logs
CREATE TABLE IF NOT EXISTS public.logs (
  "logID" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "residenceID" UUID NOT NULL REFERENCES public."Residence"("residenceID") ON DELETE CASCADE,
  "userID" UUID NOT NULL REFERENCES public."User"("userID") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "targetTable" TEXT,
  "targetID" UUID,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS logs_residence_idx ON public.logs("residenceID");
CREATE INDEX IF NOT EXISTS logs_user_idx ON public.logs("userID");
CREATE INDEX IF NOT EXISTS logs_created_at_idx ON public.logs("created_at");

-- Create RLS policies
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Allow insert from authenticated users
CREATE POLICY "Allow insert for authenticated users" ON public.logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow select for users with matching residenceID who are management
CREATE POLICY "Allow view for management of same residence" ON public.logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public."User"
      WHERE public."User"."userID" = auth.uid()
      AND public."User"."isManagement" = true
      AND public."User"."residenceID" = public.logs."residenceID"
    )
  ); 