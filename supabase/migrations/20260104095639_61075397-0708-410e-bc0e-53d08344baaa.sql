-- Omogućava korisnicima da kreiraju vlastiti profil
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);