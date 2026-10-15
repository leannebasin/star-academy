# 🌟 Star Academy - Application de Suivi (iOS PWA & GitHub Pages)

Application web progressive (PWA) optimisée pour iPhone (compatible Android & Desktop) pour suivre les primes, noter les prestations en direct, enregistrer ses pronostics de nominations et partager ses classements avec ses amis.

---

## 🚀 Étape 1 : Activer la base de données Supabase (Multi-utilisateurs)

Pour permettre à plusieurs utilisateurs de créer un compte et de séparer leurs données en toute sécurité :

1. Rendez-vous sur votre tableau de bord [Supabase](https://supabase.com/dashboard/project/zufllaamwiurbapoygwq).
2. Dans le menu latéral de gauche, cliquez sur **SQL Editor**.
3. Cliquez sur **New query** (Nouvelle requête).
4. Ouvrez le fichier [`supabase_setup.sql`](./supabase_setup.sql) inclus dans ce dossier, copiez l'intégralité du contenu et collez-le dans l'éditeur.
5. Cliquez sur le bouton vert **Run** en bas à droite.
6. C'est tout ! Vos tables (`candidates`, `primes`, `user_ratings`, `user_favorites`, `user_predictions`, `profiles`) et vos règles de sécurité RLS sont créées.

---

## 🌐 Étape 2 : Publier sur GitHub Pages

### Option A : En ligne de commande avec Git (Déjà initialisé !)

Dans votre terminal dans le dossier du projet :
```bash
git remote add origin https://github.com/VOTRE_PSEUDO/star-academy.git
git branch -M main
git push -u origin main
```

### Option B : Activer GitHub Pages
1. Sur GitHub, ouvrez votre dépôt `star-academy`.
2. Allez dans **Settings** (Paramètres du repo) > **Pages** (dans le menu de gauche).
3. Sous **Build and deployment** > **Source**, choisissez **Deploy from a branch**.
4. Sélectionnez la branche `main` et le dossier `/ (root)`, puis cliquez sur **Save**.
5. Après 1 à 2 minutes, votre application sera accessible en ligne sur :  
   `https://VOTRE_PSEUDO.github.io/star-academy/`

---

## 📱 Étape 3 : Installer l'application sur iPhone (PWA)

Pour avoir l'application en plein écran avec son icône sur votre écran d'accueil iPhone, exactement comme une vraie application de l'App Store :

1. Ouvrez l'URL de votre site dans **Safari** sur votre iPhone.
2. Touchez le bouton **Partager** (le carré avec la flèche vers le haut `⎋` en bas de l'écran).
3. Faites défiler vers le bas et touchez **« Sur l'écran d'accueil »** (avec l'icône `➕`).
4. Touchez **Ajouter** en haut à droite.
5. L'icône dorée Star Academy est désormais sur votre écran d'accueil !

---

## ✨ Fonctionnalités incluses

- **Authentification & Multi-utilisateurs (Supabase)** : Inscription, connexion sécurisée, profils utilisateurs. Chaque utilisateur a son propre espace et ses notes privées.
- **Primes & Live Notes** :
  - Compte à rebours automatique jusqu'au samedi 21h10 (heure du prime sur TF1).
  - Curseur de notation en direct sur 20 avec appréciation instantanée ("Exceptionnel", "Très bon", etc.).
  - Critères Chant & Danse.
  - Sauvegarde en direct et historique de toutes les prestations notées.
- **Candidats & Étoiles Coup de Cœur** :
  - Liste de la promotion avec statuts en direct (*En lice*, *Nommé*, *Éliminé*).
  - Ajout/Retrait en favoris d'un simple clic sur l'étoile ⭐.
  - Fiche détaillée de chaque élève.
- **Pronostics Nominations** :
  - Pronostiquer qui sera sauvé par le vote du public.
  - Pronostiquer qui sera repêché par les élèves au château.
  - Pronostiquer qui sera éliminé.
- **Mon Podium & Classement Perso** :
  - Calcul dynamique de votre Top 3 (marches 1, 2, 3) selon vos moyennes de notes.
- **Design iOS Natif & Safe Area** :
  - Barre d'onglets iOS floutée en bas d'écran.
  - Prise en charge des encoches iPhone et Dynamic Island (`viewport-fit=cover`).
  - Mode hors-ligne grâce au Service Worker.
