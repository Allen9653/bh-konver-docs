CREATE POLICY "Anon cannot insert conversions"
ON public.conversions
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Anon cannot delete conversions"
ON public.conversions
FOR DELETE
TO anon
USING (false);