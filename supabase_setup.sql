-- ============================================================
-- SCRIPT COMPLET DE MISE À JOUR - STAR ACADEMY APP (SUPABASE)
-- ============================================================
-- Copiez tout ce script et collez-le dans Supabase :
-- SQL Editor -> New query -> Coller -> RUN
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE PROFILES (Mise à jour avec colonne role)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Définir les comptes modérateurs
UPDATE public.profiles 
SET role = 'moderator' 
WHERE username IN ('leanneba', 'leanne') OR id IN ('8e97c706-1490-4b1d-88d2-dfce36b5893b', '69c243f8-b365-4f38-8721-5f4ac15c6505');

-- 3. TABLE CANDIDATS
CREATE TABLE IF NOT EXISTS public.candidates (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    age INT,
    city TEXT,
    bio TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'nominated', 'eliminated', 'immune')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidats visibles par tous" ON public.candidates;
CREATE POLICY "Candidats visibles par tous" ON public.candidates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Candidats modifiables par les utilisateurs connectés" ON public.candidates;
CREATE POLICY "Candidats modifiables par les utilisateurs connectés" ON public.candidates FOR ALL USING (auth.role() = 'authenticated');

-- 4. TABLE DES ÉVALUATIONS
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    candidate_id TEXT NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    song_title TEXT,
    artist TEXT,
    singing_score NUMERIC(4, 1) CHECK (singing_score >= 0 AND singing_score <= 20),
    dance_score NUMERIC(4, 1) CHECK (dance_score >= 0 AND dance_score <= 20),
    theatre_score NUMERIC(4, 1) CHECK (theatre_score >= 0 AND theatre_score <= 20),
    user_review TEXT,
    teachers_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_week_candidate UNIQUE (user_id, week_number, candidate_id)
);

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Evaluations visibles par le propriétaire" ON public.evaluations;
CREATE POLICY "Evaluations visibles par le propriétaire" ON public.evaluations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Evaluations gérées par le propriétaire" ON public.evaluations;
CREATE POLICY "Evaluations gérées par le propriétaire" ON public.evaluations FOR ALL USING (auth.uid() = user_id);

-- 5. TABLE DES PRIMES
CREATE TABLE IF NOT EXISTS public.primes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    title TEXT,
    date DATE,
    theme TEXT,
    eliminated_candidate_id TEXT REFERENCES public.candidates(id) ON DELETE SET NULL,
    guests JSONB DEFAULT '[]'::jsonb,
    gate_217_guests JSONB DEFAULT '[]'::jsonb,
    overall_review TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ajouter les colonnes au cas où la table primes existait déjà
ALTER TABLE public.primes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.primes ADD COLUMN IF NOT EXISTS eliminated_candidate_id TEXT REFERENCES public.candidates(id) ON DELETE SET NULL;
ALTER TABLE public.primes ADD COLUMN IF NOT EXISTS guests JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.primes ADD COLUMN IF NOT EXISTS gate_217_guests JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.primes ADD COLUMN IF NOT EXISTS overall_review TEXT;
ALTER TABLE public.primes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

ALTER TABLE public.primes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Primes lecture par tous" ON public.primes;
CREATE POLICY "Primes lecture par tous" ON public.primes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Primes gestion par utilisateurs authentifiés" ON public.primes;
CREATE POLICY "Primes gestion par utilisateurs authentifiés" ON public.primes FOR ALL USING (auth.role() = 'authenticated');

-- 6. TABLE DES PRESTATIONS (Performances lors d'un prime)
CREATE TABLE IF NOT EXISTS public.performances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prime_id INT REFERENCES public.primes(id) ON DELETE CASCADE,
    prime_week_number INT,
    performance_type TEXT NOT NULL DEFAULT 'chant',
    is_medley BOOLEAN DEFAULT false,
    songs JSONB DEFAULT '[]'::jsonb, -- tableau de {title, artist}
    candidate_ids JSONB DEFAULT '[]'::jsonb, -- tableau d'identifiants candidats
    guest_names JSONB DEFAULT '[]'::jsonb, -- invités participants
    individual_ratings JSONB DEFAULT '{}'::jsonb, -- { candidate_id: note }
    user_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prestations visibles par propriétaire" ON public.performances;
CREATE POLICY "Prestations visibles par propriétaire" ON public.performances FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Prestations gérées par propriétaire" ON public.performances;
CREATE POLICY "Prestations gérées par propriétaire" ON public.performances FOR ALL USING (auth.uid() = user_id);

-- 7. TABLE DES CLASSEMENTS HEBDOMADAIRES (Drag & drop)
CREATE TABLE IF NOT EXISTS public.weekly_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    ranked_candidate_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_weekly_ranking UNIQUE (user_id, week_number)
);

ALTER TABLE public.weekly_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Classements visibles par propriétaire" ON public.weekly_rankings;
CREATE POLICY "Classements visibles par propriétaire" ON public.weekly_rankings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Classements gérés par propriétaire" ON public.weekly_rankings;
CREATE POLICY "Classements gérés par propriétaire" ON public.weekly_rankings FOR ALL USING (auth.uid() = user_id);

-- 8. PEUPLEMENT INITIAL DES CANDIDATS (au cas où)
INSERT INTO public.candidates (id, first_name, last_name, age, city, bio, photo_url, status)
VALUES
    ('marine', 'Marine', 'Delplace', 24, 'Lille', 'Chanteuse à la voix puissante, étudiante en chirurgie dentaire.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'active'),
    ('ebony', 'Ebony', 'Cham', 20, 'L''Île-Saint-Denis', 'Artiste complète, fille d''artiste, passionnée de soul et RnB.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'active'),
    ('charles', 'Charles', 'Coste', 18, 'Pléneuf-Val-André', 'Jeune prodige de la chanson française et du chant classique.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'active'),
    ('franck', 'Franck', 'Diakhaby', 22, 'Bagneux', 'Voix gospel envoûtante, sensible et charismatique.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'active'),
    ('marguerite', 'Marguerite', 'Boucher', 23, 'Paris', 'Univers pop poétique théâtral et haute en couleur.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'active'),
    ('maia', 'Maïa', 'Kopania', 21, 'Valence', 'Énergie communicative, grande force émotionnelle et passion.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', 'active'),
    ('ulysse', 'Ulysse', 'Mars', 24, 'Marseille', 'Âme de rocker au timbre éraillé et sensibilité à fleur de peau.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', 'active'),
    ('julie', 'Julie', 'Neveu', 19, 'Suisse', 'Grande technicienne vocale au répertoire musical international.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'active'),
    ('masseo', 'Masséo', 'Dufour', 18, 'Soullans', 'Danseur et chanteur pop ultra talentueux et perfectionniste.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', 'active'),
    ('thomas', 'Thomas', 'Bernard', 21, 'Leuville', 'Tonalité chaude et générosité musicale sur scène.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('emma', 'Emma', 'Perrier', 22, 'Lesquin', 'Énergie pop explosive, showgirl et présence scénique incroyable.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('noah', 'Noah', 'Guerin', 20, 'Carcassonne', 'Musicien autodidacte, grain de voix unique.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('paul', 'Paul', 'Miles', 23, 'Vannes', 'Personnalité flamboyante et style dandy rock glam.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('maylis', 'Maylis', 'Bort', 23, 'Belgique', 'Douceur électro-pop et compositions inspirantes.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'eliminated')
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    status = EXCLUDED.status;
