-- ============================================================
-- SCRIPT D'INITIALISATION COMPLET - STAR ACADEMY APP (SUPABASE)
-- ============================================================
-- Exécutez ce script dans votre tableau de bord Supabase :
-- Allez dans : SQL Editor -> Nouveau Script -> Coller tout -> RUN (Exécuter)
-- ============================================================

-- 1. Activation des extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE DES PROFILS UTILISATEURS (reliée à auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    favorite_candidate_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS pour les profils
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profils visibles par tous" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre profil" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Trigger automatique pour créer un profil lors de l'inscription Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id::text)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. TABLE DES CANDIDATS (Élèves de la saison)
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

-- RLS pour les candidats
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidats visibles par tout le monde" 
    ON public.candidates FOR SELECT 
    USING (true);

CREATE POLICY "Candidats modifiables par les utilisateurs authentifiés" 
    ON public.candidates FOR ALL 
    USING (auth.role() = 'authenticated');


-- 4. TABLE DES PRIMES
CREATE TABLE IF NOT EXISTS public.primes (
    id SERIAL PRIMARY KEY,
    week_number INT NOT NULL,
    title TEXT NOT NULL,
    date DATE,
    theme TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS pour les primes
ALTER TABLE public.primes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Primes visibles par tous" 
    ON public.primes FOR SELECT 
    USING (true);

CREATE POLICY "Primes modifiables par utilisateurs connectés" 
    ON public.primes FOR ALL 
    USING (auth.role() = 'authenticated');


-- 5. TABLE DES FAVORIS DES UTILISATEURS
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_candidate_fav UNIQUE (user_id, candidate_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favoris visibles par leur propriétaire" 
    ON public.user_favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Favoris gérés par leur propriétaire" 
    ON public.user_favorites FOR ALL 
    USING (auth.uid() = user_id);


-- 6. TABLE DES NOTES ET ÉVALUATIONS (User Ratings)
CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    prime_id INT REFERENCES public.primes(id) ON DELETE SET NULL,
    song_title TEXT,
    score NUMERIC(4, 1) NOT NULL CHECK (score >= 0 AND score <= 20),
    dance_score NUMERIC(4, 1) CHECK (dance_score >= 0 AND dance_score <= 20),
    singing_score NUMERIC(4, 1) CHECK (singing_score >= 0 AND singing_score <= 20),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes visibles par tout le monde pour classements" 
    ON public.user_ratings FOR SELECT 
    USING (true);

CREATE POLICY "Utilisateurs peuvent insérer/modifier leurs propres notes" 
    ON public.user_ratings FOR ALL 
    USING (auth.uid() = user_id);


-- 7. TABLE DES PRONOSTICS (User Predictions)
CREATE TABLE IF NOT EXISTS public.user_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prime_id INT NOT NULL REFERENCES public.primes(id) ON DELETE CASCADE,
    saved_by_public_id TEXT REFERENCES public.candidates(id) ON DELETE SET NULL,
    saved_by_students_id TEXT REFERENCES public.candidates(id) ON DELETE SET NULL,
    eliminated_id TEXT REFERENCES public.candidates(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_prime_prediction UNIQUE (user_id, prime_id)
);

ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pronostics visibles par leur auteur et la communauté" 
    ON public.user_predictions FOR SELECT 
    USING (true);

CREATE POLICY "Utilisateurs gèrent leurs propres pronostics" 
    ON public.user_predictions FOR ALL 
    USING (auth.uid() = user_id);


-- ============================================================
-- 8. DONNÉES INITIALES (Candidats de la promotion & Primes)
-- ============================================================

INSERT INTO public.candidates (id, first_name, last_name, age, city, bio, photo_url, status)
VALUES
    ('marine', 'Marine', 'Delplace', 24, 'Lille', 'Chanteuse à la voix puissante, étudiante en chirurgie dentaire.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'active'),
    ('ebony', 'Ebony', 'Cham', 20, 'L''Île-Saint-Denis', 'Artiste complète, fille d''artiste, passionnée de soul et RnB.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'active'),
    ('charles', 'Charles', 'Coste', 18, 'Pléneuf-Val-André', 'Jeune prodige de la chanson française et du chant classique.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'active'),
    ('franck', 'Franck', 'Diakhaby', 22, 'Bagneux', 'Voix gospel envoûtante, sensible et charismatique.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'active'),
    ('marguerite', 'Marguerite', 'Boucher', 23, 'Paris', 'Univers pop poétique théâtral et haute en couleur.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'active'),
    ('maia', 'Maïa', 'Kopania', 21, 'Valence', 'Énergie communicative, grande force émotionnelle et passion.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80', 'nominated'),
    ('ulysse', 'Ulysse', 'Mars', 24, 'Marseille', 'Âme de rocker au timbre éraillé et sensibilité à fleur de peau.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', 'nominated'),
    ('julie', 'Julie', 'Neveu', 19, 'Suisse', 'Grande technicienne vocale au répertoire musical international.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'active'),
    ('masseo', 'Masséo', 'Dufour', 18, 'Soullans', 'Danseur et chanteur pop ultra talentueux et perfectionniste.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80', 'nominated'),
    ('thomas', 'Thomas', 'Bernard', 21, 'Leuville', 'Tonalité chaude et générosité musicale sur scène.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('emma', 'Emma', 'Perrier', 22, 'Lesquin', 'Énergie pop explosive, showgirl et présence scénique incroyable.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('noah', 'Noah', 'Guerin', 20, 'Carcassonne', 'Musicien autodidacte, grain de voix unique.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('paul', 'Paul', 'Miles', 23, 'Vannes', 'Personnalité flamboyante et style dandy rock glam.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80', 'eliminated'),
    ('maylis', 'Maylis', 'Bort', 23, 'Belgique', 'Douceur électro-pop et compositions inspirantes.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'eliminated')
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    status = EXCLUDED.status;

-- PRIMES
INSERT INTO public.primes (week_number, title, date, theme, is_active)
VALUES
    (1, 'Prime 1 - Le Grand Lancement', '2024-10-12', 'Arrivée au Château de Dammarie-les-Lys', false),
    (2, 'Prime 2 - Première Épreuve', '2024-10-19', 'Duos de Légende', false),
    (3, 'Prime 3 - Tous Chœur', '2024-10-26', 'Accompagnement par orchestre philharmonique', false),
    (4, 'Prime 4 - Soirée Événement', '2024-11-02', 'Grandes comédies musicales', false),
    (5, 'Prime 5 - Spéciale Nominations', '2024-11-09', 'Surprises et artistes invités', true),
    (6, 'Prime 6 - Carte Blanche aux Élèves', '2024-11-16', 'Choix des titres par les académiciens', false),
    (7, 'Prime 7 - La Tournée en Ligne de Mire', '2024-11-23', 'Qualifications pour le Star Ac Tour', false),
    (8, 'Prime 8 - La Demi-Finale 1', '2024-11-30', 'Face-à-face au sommet', false),
    (9, 'Prime 9 - La Grande Finale', '2024-12-07', 'Sacre du gagnant Star Academy', false)
ON CONFLICT DO NOTHING;
