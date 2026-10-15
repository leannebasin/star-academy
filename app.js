/**
 * STAR ACADEMY - APPLICATION DE SUIVI iOS PWA
 * Gestion de l'état, de l'authentification Supabase, des Primes, Notes & Pronostics.
 */

// Configuration Supabase
const SUPABASE_URL = "https://zufllaamwiurbapoygwq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_X0jNnbaK34Z4xD0Ek7DnXA_6dsHdqb4";

// Initialisation du client Supabase
let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Données de secours / initiales (au cas où les tables Supabase ne sont pas encore créées)
const DEFAULT_CANDIDATES = [
  { id: 'marine', first_name: 'Marine', last_name: 'Delplace', age: 24, city: 'Lille', status: 'active', bio: 'Chanteuse à la voix puissante, étudiante en chirurgie dentaire.', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'ebony', first_name: 'Ebony', last_name: 'Cham', age: 20, city: 'L\'Île-Saint-Denis', status: 'active', bio: 'Artiste complète, fille d\'artiste, passionnée de soul et RnB.', photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 'charles', first_name: 'Charles', last_name: 'Coste', age: 18, city: 'Pléneuf-Val-André', status: 'active', bio: 'Jeune prodige de la chanson française et du chant classique.', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'franck', first_name: 'Franck', last_name: 'Diakhaby', age: 22, city: 'Bagneux', status: 'active', bio: 'Voix gospel envoûtante, sensible et charismatique.', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 'marguerite', first_name: 'Marguerite', last_name: 'Boucher', age: 23, city: 'Paris', status: 'active', bio: 'Univers pop poétique théâtral et haute en couleur.', photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { id: 'maia', first_name: 'Maïa', last_name: 'Kopania', age: 21, city: 'Valence', status: 'nominated', bio: 'Énergie communicative, grande force émotionnelle et passion.', photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
  { id: 'ulysse', first_name: 'Ulysse', last_name: 'Mars', age: 24, city: 'Marseille', status: 'nominated', bio: 'Âme de rocker au timbre éraillé et sensibilité à fleur de peau.', photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
  { id: 'julie', first_name: 'Julie', last_name: 'Neveu', age: 19, city: 'Suisse', status: 'active', bio: 'Grande technicienne vocale au répertoire musical international.', photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { id: 'masseo', first_name: 'Masséo', last_name: 'Dufour', age: 18, city: 'Soullans', status: 'nominated', bio: 'Danseur et chanteur pop ultra talentueux et perfectionniste.', photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { id: 'thomas', first_name: 'Thomas', last_name: 'Bernard', age: 21, city: 'Leuville', status: 'eliminated', bio: 'Tonalité chaude et générosité musicale sur scène.', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { id: 'emma', first_name: 'Emma', last_name: 'Perrier', age: 22, city: 'Lesquin', status: 'eliminated', bio: 'Énergie pop explosive, showgirl et présence scénique incroyable.', photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' },
  { id: 'noah', first_name: 'Noah', last_name: 'Guerin', age: 20, city: 'Carcassonne', status: 'eliminated', bio: 'Musicien autodidacte, grain de voix unique.', photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' },
  { id: 'paul', first_name: 'Paul', last_name: 'Miles', age: 23, city: 'Vannes', status: 'eliminated', bio: 'Personnalité flamboyante et style dandy rock glam.', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  { id: 'maylis', first_name: 'Maylis', last_name: 'Bort', age: 23, city: 'Belgique', status: 'eliminated', bio: 'Douceur électro-pop et compositions inspirantes.', photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' }
];

const DEFAULT_PRIMES = [
  { id: 1, week_number: 1, title: 'Prime 1 - Le Grand Lancement', is_active: false },
  { id: 2, week_number: 2, title: 'Prime 2 - Première Épreuve', is_active: false },
  { id: 3, week_number: 3, title: 'Prime 3 - Tous Chœur Philharmonique', is_active: false },
  { id: 4, week_number: 4, title: 'Prime 4 - Comédies Musicales', is_active: false },
  { id: 5, week_number: 5, title: 'Prime 5 - Soirée Spéciale Évaluations', is_active: true },
  { id: 6, week_number: 6, title: 'Prime 6 - Carte Blanche aux Élèves', is_active: false },
  { id: 7, week_number: 7, title: 'Prime 7 - La Tournée en Ligne de Mire', is_active: false },
  { id: 8, week_number: 8, title: 'Prime 8 - La Demi-Finale', is_active: false },
  { id: 9, week_number: 9, title: 'Prime 9 - La Grande Finale', is_active: false }
];

// État Global de l'application
const AppState = {
  currentUser: null,
  profile: null,
  candidates: [...DEFAULT_CANDIDATES],
  primes: [...DEFAULT_PRIMES],
  userRatings: [],
  userFavorites: new Set(),
  userPredictions: {},
  activeFilter: 'all',
  activeSearch: '',
  activeTab: 'home',
  selectedCandidateForModal: null,
  isAuthModeSignUp: false,
  isSupabaseDbReady: false
};

// Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', async () => {
  setupPWA();
  setupCountdownTimer();
  await initSupabaseAuth();
  await loadAppData();
  renderApp();
  checkIfStandalone();
});

// Enregistrement du Service Worker PWA
function setupPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('Service Worker enregistré:', reg.scope))
        .catch((err) => console.warn('Service Worker non enregistré:', err));
    });
  }
}

// Détection si l'application est déjà lancée en mode écran d'accueil (standalone iOS)
function checkIfStandalone() {
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const promptBox = document.getElementById('ios-prompt-box');
  if (promptBox && isStandalone) {
    promptBox.style.display = 'none';
  }
}

// -------------------------------------------------------------
// GESTION DU COMPTE À REBOURS DU PRIME (Samedi 21h10)
// -------------------------------------------------------------
function setupCountdownTimer() {
  function getNextSaturdayPrime() {
    const now = new Date();
    const target = new Date(now);
    // Jour de la semaine : 0=dimanche, 6=samedi
    const day = now.getDay();
    let diff = (6 - day + 7) % 7;
    // Si c'est déjà samedi et passé 23h30, viser le samedi suivant
    if (diff === 0 && (now.getHours() > 23 || (now.getHours() === 23 && now.getMinutes() >= 30))) {
      diff = 7;
    }
    target.setDate(now.getDate() + diff);
    target.setHours(21, 10, 0, 0); // 21h10 heure de diffusion du Prime
    return target;
  }

  function update() {
    const now = new Date();
    const target = getNextSaturdayPrime();
    const distance = target - now;

    const cdDays = document.getElementById('cd-days');
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');
    const statusText = document.getElementById('countdown-status-text');

    if (distance <= 0 && distance > - (3 * 3600 * 1000)) {
      // En cours de direct !
      if (statusText) statusText.textContent = "EN DIRECT MAINTENANT SUR TF1 !";
      if (cdDays) cdDays.textContent = "00";
      if (cdHours) cdHours.textContent = "00";
      if (cdMins) cdMins.textContent = "00";
      if (cdSecs) cdSecs.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((distance % (1000 * 60)) / 1000);

    if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
    if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
    if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// -------------------------------------------------------------
// GESTION AUTHENTIFICATION SUPABASE
// -------------------------------------------------------------
async function initSupabaseAuth() {
  if (!supabaseClient) return;

  try {
    // Vérification de la session en cours
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      AppState.currentUser = session.user;
      await fetchUserProfile(session.user.id);
    }

    // Écoute des changements d'état d'authentification
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        AppState.currentUser = session.user;
        await fetchUserProfile(session.user.id);
        await loadUserData();
      } else {
        AppState.currentUser = null;
        AppState.profile = null;
        loadLocalUserData();
      }
      updateAuthUI();
      renderApp();
    });
  } catch (err) {
    console.warn("Session check fallback:", err);
    loadLocalUserData();
  }
}

async function fetchUserProfile(userId) {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      AppState.profile = data;
    } else {
      AppState.profile = {
        username: AppState.currentUser.email ? AppState.currentUser.email.split('@')[0] : 'StarFan',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`
      };
    }
  } catch (e) {
    console.warn("Could not fetch profile:", e);
  }
}

// -------------------------------------------------------------
// CHARGEMENT DES DONNÉES (Supabase & Local)
// -------------------------------------------------------------
async function loadAppData() {
  // 1. Tenter de charger les candidats depuis Supabase
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from('candidates').select('*').order('first_name');
      if (!error && data && data.length > 0) {
        AppState.candidates = data;
        AppState.isSupabaseDbReady = true;
      } else if (error && error.code === 'PGRST205') {
        // Table does not exist in schema cache yet
        AppState.isSupabaseDbReady = false;
        showDbAlertBanner(true);
      }
    } catch (err) {
      console.warn("Supabase candidates fetch error, using defaults:", err);
      showDbAlertBanner(true);
    }

    // 2. Tenter de charger les primes depuis Supabase
    try {
      const { data, error } = await supabaseClient.from('primes').select('*').order('week_number');
      if (!error && data && data.length > 0) {
        AppState.primes = data;
      }
    } catch (err) {
      console.warn("Supabase primes fetch error:", err);
    }
  }

  // 3. Charger les données utilisateur (favoris, notes, pronostics)
  if (AppState.currentUser && AppState.isSupabaseDbReady) {
    await loadUserData();
  } else {
    loadLocalUserData();
  }
}

async function loadUserData() {
  if (!supabaseClient || !AppState.currentUser) return;
  const userId = AppState.currentUser.id;

  try {
    // Favoris
    const { data: favs } = await supabaseClient.from('user_favorites').select('candidate_id').eq('user_id', userId);
    if (favs) {
      AppState.userFavorites = new Set(favs.map(f => f.candidate_id));
    }

    // Notes
    const { data: ratings } = await supabaseClient.from('user_ratings').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (ratings) {
      AppState.userRatings = ratings;
    }

    // Pronostics
    const { data: preds } = await supabaseClient.from('user_predictions').select('*').eq('user_id', userId);
    if (preds && preds.length > 0) {
      AppState.userPredictions = preds[0];
    }
  } catch (err) {
    console.warn("Error loading user data from Supabase, fallback local:", err);
    loadLocalUserData();
  }
}

function loadLocalUserData() {
  // Stockage local pour mode invité ou hors-ligne
  const localFavs = localStorage.getItem('star_ac_favorites');
  if (localFavs) {
    try { AppState.userFavorites = new Set(JSON.parse(localFavs)); } catch (e) {}
  }

  const localRatings = localStorage.getItem('star_ac_ratings');
  if (localRatings) {
    try { AppState.userRatings = JSON.parse(localRatings); } catch (e) {}
  }

  const localPreds = localStorage.getItem('star_ac_predictions');
  if (localPreds) {
    try { AppState.userPredictions = JSON.parse(localPreds); } catch (e) {}
  }
}

function saveLocalUserData() {
  localStorage.setItem('star_ac_favorites', JSON.stringify(Array.from(AppState.userFavorites)));
  localStorage.setItem('star_ac_ratings', JSON.stringify(AppState.userRatings));
  localStorage.setItem('star_ac_predictions', JSON.stringify(AppState.userPredictions));
}

function showDbAlertBanner(show) {
  const banner = document.getElementById('db-alert-banner');
  if (banner) {
    if (show) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
  }
}

// -------------------------------------------------------------
// NAVIGATION PAR ONGLETS (iOS TABS)
// -------------------------------------------------------------
function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Activer le bon conteneur
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add('active');

  // Activer le bon bouton du tab bar
  const tabNames = ['home', 'candidates', 'primes', 'predictions', 'profile'];
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach((btn, index) => {
    if (tabNames[index] === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Défilement doux vers le haut lors du changement d'onglet
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Rafraîchir les données de l'onglet actif
  if (tabId === 'home') renderHomeTab();
  if (tabId === 'candidates') renderCandidatesTab();
  if (tabId === 'primes') renderPrimesTab();
  if (tabId === 'predictions') renderPredictionsTab();
  if (tabId === 'profile') renderProfileTab();
}

// -------------------------------------------------------------
// RENDU DE L'APPLICATION
// -------------------------------------------------------------
function renderApp() {
  updateAuthUI();
  renderHomeTab();
  renderCandidatesTab();
  renderPrimesTab();
  renderPredictionsTab();
  renderProfileTab();
}

function updateAuthUI() {
  const headerBtn = document.getElementById('auth-header-btn');
  const btnLabel = document.getElementById('auth-btn-label');
  const mainAuthBtn = document.getElementById('auth-main-action-btn');
  const profileName = document.getElementById('user-profile-name');
  const profileEmail = document.getElementById('user-profile-email');
  const profileAvatar = document.getElementById('user-profile-avatar');

  if (AppState.currentUser) {
    const name = (AppState.profile && AppState.profile.username) || AppState.currentUser.email.split('@')[0];
    const avatar = (AppState.profile && AppState.profile.avatar_url) || `https://api.dicebear.com/7.x/bottts/svg?seed=${AppState.currentUser.id}`;
    
    if (btnLabel) btnLabel.textContent = name;
    if (profileName) profileName.textContent = name;
    if (profileEmail) profileEmail.textContent = AppState.currentUser.email;
    if (profileAvatar) profileAvatar.src = avatar;

    if (mainAuthBtn) {
      mainAuthBtn.textContent = "Se déconnecter";
      mainAuthBtn.onclick = handleSignOut;
    }
  } else {
    if (btnLabel) btnLabel.textContent = "Se connecter";
    if (profileName) profileName.textContent = "Mode Démo / Invité";
    if (profileEmail) profileEmail.textContent = "Connectez-vous pour synchroniser vos données";
    if (profileAvatar) profileAvatar.src = "icons/favicon.png";

    if (mainAuthBtn) {
      mainAuthBtn.textContent = "Se connecter / Créer un compte";
      mainAuthBtn.onclick = openAuthModal;
    }
  }
}

// 1. Rendu Onglet Accueil
function renderHomeTab() {
  // Nominés
  const nominees = AppState.candidates.filter(c => c.status === 'nominated');
  const nomineesContainer = document.getElementById('home-nominees-container');
  if (nomineesContainer) {
    if (nominees.length === 0) {
      nomineesContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 10px;">Aucun élève nommé pour le moment !</div>`;
    } else {
      nomineesContainer.innerHTML = nominees.map(c => `
        <div class="nominee-card" onclick="openCandidateDetail('${c.id}')">
          <span class="nominee-badge-tag">Nommé</span>
          <img class="nominee-avatar" src="${c.photo_url || 'icons/favicon.png'}" alt="${c.first_name}">
          <span class="nominee-name">${c.first_name}</span>
          <button class="nominee-action-btn" onclick="event.stopPropagation(); switchTab('predictions')">Pronostiquer</button>
        </div>
      `).join('');
    }
  }

  // Statistiques
  const favCountEl = document.getElementById('stat-fav-count');
  const ratingsCountEl = document.getElementById('stat-ratings-count');
  const avgScoreEl = document.getElementById('stat-avg-score');

  if (favCountEl) favCountEl.textContent = AppState.userFavorites.size;
  if (ratingsCountEl) ratingsCountEl.textContent = AppState.userRatings.length;

  if (avgScoreEl) {
    if (AppState.userRatings.length > 0) {
      const sum = AppState.userRatings.reduce((acc, r) => acc + parseFloat(r.score || 0), 0);
      const avg = (sum / AppState.userRatings.length).toFixed(1);
      avgScoreEl.textContent = `${avg}/20`;
    } else {
      avgScoreEl.textContent = `--/20`;
    }
  }

  // Coup de cœur (Favoris)
  const favsContainer = document.getElementById('home-favorites-container');
  if (favsContainer) {
    const favoriteCandidates = AppState.candidates.filter(c => AppState.userFavorites.has(c.id));
    if (favoriteCandidates.length === 0) {
      favsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); text-align: center; border: 1px dashed var(--border-subtle); color: var(--text-secondary); font-size: 0.85rem;">
          Vous n'avez pas encore de coup de cœur ⭐<br>
          <span style="color: var(--gold-mid); cursor: pointer; font-weight: 700;" onclick="switchTab('candidates')">Explorer les élèves de la promo &rarr;</span>
        </div>
      `;
    } else {
      favsContainer.innerHTML = favoriteCandidates.slice(0, 4).map(c => renderCandidateCard(c)).join('');
    }
  }
}

// 2. Rendu Onglet Candidats
function renderCandidatesTab() {
  const container = document.getElementById('candidates-grid-container');
  if (!container) return;

  let filtered = AppState.candidates;

  // Filtrage par statut
  if (AppState.activeFilter === 'active') {
    filtered = filtered.filter(c => c.status === 'active');
  } else if (AppState.activeFilter === 'nominated') {
    filtered = filtered.filter(c => c.status === 'nominated');
  } else if (AppState.activeFilter === 'eliminated') {
    filtered = filtered.filter(c => c.status === 'eliminated');
  } else if (AppState.activeFilter === 'favorites') {
    filtered = filtered.filter(c => AppState.userFavorites.has(c.id));
  }

  // Filtrage par recherche
  if (AppState.activeSearch.trim()) {
    const query = AppState.activeSearch.toLowerCase();
    filtered = filtered.filter(c => 
      c.first_name.toLowerCase().includes(query) || 
      (c.last_name && c.last_name.toLowerCase().includes(query)) ||
      (c.city && c.city.toLowerCase().includes(query))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 30px 0;">Aucun élève trouvé avec ces critères.</div>`;
    return;
  }

  container.innerHTML = filtered.map(c => renderCandidateCard(c)).join('');
}

function renderCandidateCard(c) {
  const isFav = AppState.userFavorites.has(c.id);
  const statusLabel = c.status === 'nominated' ? 'Nommé(e)' : (c.status === 'eliminated' ? 'Éliminé(e)' : 'En lice');
  const statusClass = c.status === 'nominated' ? 'status-nominated' : (c.status === 'eliminated' ? 'status-eliminated' : 'status-active');

  // Calcul moyenne personnelle pour cet élève
  const candRatings = AppState.userRatings.filter(r => r.candidate_id === c.id);
  let scoreBadge = '';
  if (candRatings.length > 0) {
    const sum = candRatings.reduce((acc, r) => acc + parseFloat(r.score || 0), 0);
    const avg = (sum / candRatings.length).toFixed(1);
    scoreBadge = `<span class="rating-score">★ ${avg}/20</span>`;
  } else {
    scoreBadge = `<span style="color: var(--text-muted); font-size: 0.7rem;">Pas encore noté</span>`;
  }

  return `
    <div class="candidate-card ${isFav ? 'is-favorite' : ''}" onclick="openCandidateDetail('${c.id}')">
      <div class="candidate-img-wrap">
        <img class="candidate-img" src="${c.photo_url || 'icons/favicon.png'}" alt="${c.first_name}" loading="lazy">
        <button class="fav-star-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${c.id}')" title="Favori">
          <svg viewBox="0 0 24 24">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </button>
        <span class="candidate-status-tag ${statusClass}">${statusLabel}</span>
      </div>
      <div class="candidate-info">
        <span class="candidate-title">${c.first_name} ${c.last_name || ''}</span>
        <span class="candidate-meta">${c.age ? c.age + ' ans' : ''} ${c.city ? '• ' + c.city : ''}</span>
        <div class="candidate-rating-bar">
          ${scoreBadge}
        </div>
      </div>
    </div>
  `;
}

function filterCandidates(filterType, btnEl) {
  AppState.activeFilter = filterType;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderCandidatesTab();
}

function handleCandidateSearch(val) {
  AppState.activeSearch = val;
  renderCandidatesTab();
}

// 3. Rendu Onglet Primes & Live Notes
function renderPrimesTab() {
  const primeSelect = document.getElementById('rating-prime-select');
  const candidateSelect = document.getElementById('rating-candidate-select');

  // Peupler le sélecteur de Primes
  if (primeSelect && primeSelect.options.length <= 1) {
    primeSelect.innerHTML = AppState.primes.map(p => `
      <option value="${p.id}" ${p.is_active ? 'selected' : ''}>${p.title}</option>
    `).join('');
  }

  // Peupler le sélecteur de Candidats (Élèves en lice ou nommés en priorité)
  if (candidateSelect && candidateSelect.options.length <= 1) {
    candidateSelect.innerHTML = AppState.candidates.map(c => `
      <option value="${c.id}">${c.first_name} ${c.last_name || ''} (${c.status === 'eliminated' ? 'Éliminé' : 'En lice'})</option>
    `).join('');
  }

  // Rendu de l'historique des notes
  const historyContainer = document.getElementById('ratings-history-container');
  if (historyContainer) {
    if (AppState.userRatings.length === 0) {
      historyContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 14px; text-align: center; background: var(--bg-card); border-radius: var(--radius-md);">Vous n'avez pas encore attribué de notes. Profitez du Prime de samedi pour noter les prestations !</div>`;
    } else {
      historyContainer.innerHTML = AppState.userRatings.map(r => {
        const cand = AppState.candidates.find(c => c.id === r.candidate_id) || { first_name: 'Élève', photo_url: 'icons/favicon.png' };
        return `
          <div class="rating-item-card">
            <div class="rating-item-left">
              <img class="rating-item-avatar" src="${cand.photo_url || 'icons/favicon.png'}" alt="${cand.first_name}">
              <div>
                <div class="rating-item-name">${cand.first_name}</div>
                <div class="rating-item-song">${r.song_title ? '🎵 ' + r.song_title : 'Prestation prime'}</div>
                ${r.comment ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">« ${r.comment} »</div>` : ''}
              </div>
            </div>
            <div class="rating-item-badge">${parseFloat(r.score).toFixed(1)}/20</div>
          </div>
        `;
      }).join('');
    }
  }
}

function updateScoreDisplay(val) {
  const scoreNum = parseFloat(val);
  const display = document.getElementById('live-score-display');
  const appreciation = document.getElementById('live-score-appreciation');

  if (display) display.textContent = scoreNum.toFixed(1);

  if (appreciation) {
    if (scoreNum >= 18) appreciation.textContent = "Exceptionnel ! Moment de grâce 🌟";
    else if (scoreNum >= 16) appreciation.textContent = "Prestation remarquable, digne d'un pro ✨";
    else if (scoreNum >= 14) appreciation.textContent = "Très bonne performance scénique 👍";
    else if (scoreNum >= 12) appreciation.textContent = "Correct, mais peut aller encore plus loin 👏";
    else if (scoreNum >= 10) appreciation.textContent = "Juste la moyenne, des faiblesses techniques 😐";
    else appreciation.textContent = "En difficulté sur ce prime ⚠️";
  }
}

async function saveUserRating() {
  const primeSelect = document.getElementById('rating-prime-select');
  const candidateSelect = document.getElementById('rating-candidate-select');
  const songInput = document.getElementById('rating-song-input');
  const slider = document.getElementById('live-score-slider');
  const singInput = document.getElementById('rating-sing-input');
  const danceInput = document.getElementById('rating-dance-input');
  const commentInput = document.getElementById('rating-comment-input');

  const candidateId = candidateSelect ? candidateSelect.value : null;
  const primeId = primeSelect ? parseInt(primeSelect.value) : 1;
  const score = slider ? parseFloat(slider.value) : 15.0;
  const songTitle = songInput ? songInput.value.trim() : '';
  const comment = commentInput ? commentInput.value.trim() : '';
  const singingScore = singInput && singInput.value ? parseFloat(singInput.value) : null;
  const danceScore = danceInput && danceInput.value ? parseFloat(danceInput.value) : null;

  if (!candidateId) {
    showToast("Veuillez sélectionner un élève", "error");
    return;
  }

  const newRating = {
    id: 'local_' + Date.now(),
    candidate_id: candidateId,
    prime_id: primeId,
    score: score,
    singing_score: singingScore,
    dance_score: danceScore,
    song_title: songTitle,
    comment: comment,
    created_at: new Date().toISOString()
  };

  // Sauvegarde Supabase si connecté
  if (supabaseClient && AppState.currentUser && AppState.isSupabaseDbReady) {
    try {
      const { data, error } = await supabaseClient.from('user_ratings').insert({
        user_id: AppState.currentUser.id,
        candidate_id: candidateId,
        prime_id: primeId,
        score: score,
        singing_score: singingScore,
        dance_score: danceScore,
        song_title: songTitle,
        comment: comment
      }).select();

      if (error) {
        console.warn("Supabase insert error, saving locally:", error);
      } else if (data && data[0]) {
        newRating.id = data[0].id;
      }
    } catch (e) {
      console.warn("Supabase exception:", e);
    }
  }

  // Ajout dans l'état local
  AppState.userRatings.unshift(newRating);
  saveLocalUserData();

  // Reset des champs
  if (songInput) songInput.value = '';
  if (commentInput) commentInput.value = '';
  if (singInput) singInput.value = '';
  if (danceInput) danceInput.value = '';

  showToast(`Note de ${score}/20 enregistrée avec succès ! ⭐`);
  renderPrimesTab();
  renderHomeTab();
  renderProfileTab();
}

// 4. Rendu Onglet Pronostics
function renderPredictionsTab() {
  const publicSelect = document.getElementById('pred-public-select');
  const studentsSelect = document.getElementById('pred-students-select');
  const elimSelect = document.getElementById('pred-eliminated-select');

  // Candidats éligibles aux pronostics (les nominés en priorité, sinon tous les élèves actifs)
  let eligible = AppState.candidates.filter(c => c.status === 'nominated');
  if (eligible.length === 0) {
    eligible = AppState.candidates.filter(c => c.status === 'active');
  }

  const optionsHtml = (selectedId) => `
    <option value="">Sélectionner un élève</option>
    ${eligible.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.first_name} ${c.last_name || ''}</option>`).join('')}
  `;

  if (publicSelect) publicSelect.innerHTML = optionsHtml(AppState.userPredictions.saved_by_public_id);
  if (studentsSelect) studentsSelect.innerHTML = optionsHtml(AppState.userPredictions.saved_by_students_id);
  if (elimSelect) elimSelect.innerHTML = optionsHtml(AppState.userPredictions.eliminated_id);
}

async function saveUserPrediction() {
  const publicSelect = document.getElementById('pred-public-select');
  const studentsSelect = document.getElementById('pred-students-select');
  const elimSelect = document.getElementById('pred-eliminated-select');

  const pubId = publicSelect ? publicSelect.value : null;
  const stuId = studentsSelect ? studentsSelect.value : null;
  const elimId = elimSelect ? elimSelect.value : null;

  if (!pubId || !stuId || !elimId) {
    showToast("Veuillez sélectionner vos 3 pronostics", "error");
    return;
  }

  if (pubId === stuId || pubId === elimId || stuId === elimId) {
    showToast("Veuillez choisir un élève différent pour chaque issue !", "error");
    return;
  }

  AppState.userPredictions = {
    prime_id: 5,
    saved_by_public_id: pubId,
    saved_by_students_id: stuId,
    eliminated_id: elimId
  };

  // Envoi Supabase si connecté
  if (supabaseClient && AppState.currentUser && AppState.isSupabaseDbReady) {
    try {
      await supabaseClient.from('user_predictions').upsert({
        user_id: AppState.currentUser.id,
        prime_id: 5,
        saved_by_public_id: pubId,
        saved_by_students_id: stuId,
        eliminated_id: elimId
      });
    } catch (e) {
      console.warn("Error saving prediction to Supabase:", e);
    }
  }

  saveLocalUserData();
  showToast("Vos pronostics ont été enregistrés ! 🔮");
}

// 5. Rendu Onglet Profil & Podium
function renderProfileTab() {
  // Calcul du classement des élèves selon les notes de l'utilisateur
  const candidateScores = {};
  AppState.candidates.forEach(c => {
    candidateScores[c.id] = { candidate: c, scores: [] };
  });

  AppState.userRatings.forEach(r => {
    if (candidateScores[r.candidate_id]) {
      candidateScores[r.candidate_id].scores.push(parseFloat(r.score));
    }
  });

  const rankedList = Object.values(candidateScores)
    .map(item => {
      const avg = item.scores.length > 0 
        ? item.scores.reduce((a, b) => a + b, 0) / item.scores.length 
        : (AppState.userFavorites.has(item.candidate.id) ? 14 : 10);
      return { candidate: item.candidate, avgScore: avg, count: item.scores.length };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  // Podium (Top 3)
  const top1 = rankedList[0];
  const top2 = rankedList[1];
  const top3 = rankedList[2];

  if (top1) {
    const img1 = document.getElementById('podium-1-img');
    const name1 = document.getElementById('podium-1-name');
    const score1 = document.getElementById('podium-1-score');
    if (img1) img1.src = top1.candidate.photo_url || 'icons/favicon.png';
    if (name1) name1.textContent = top1.candidate.first_name;
    if (score1) score1.textContent = `${top1.avgScore.toFixed(1)}/20`;
  }

  if (top2) {
    const img2 = document.getElementById('podium-2-img');
    const name2 = document.getElementById('podium-2-name');
    const score2 = document.getElementById('podium-2-score');
    if (img2) img2.src = top2.candidate.photo_url || 'icons/favicon.png';
    if (name2) name2.textContent = top2.candidate.first_name;
    if (score2) score2.textContent = `${top2.avgScore.toFixed(1)}/20`;
  }

  if (top3) {
    const img3 = document.getElementById('podium-3-img');
    const name3 = document.getElementById('podium-3-name');
    const score3 = document.getElementById('podium-3-score');
    if (img3) img3.src = top3.candidate.photo_url || 'icons/favicon.png';
    if (name3) name3.textContent = top3.candidate.first_name;
    if (score3) score3.textContent = `${top3.avgScore.toFixed(1)}/20`;
  }

  // Liste complète du classement
  const fullRankingContainer = document.getElementById('full-ranking-container');
  if (fullRankingContainer) {
    fullRankingContainer.innerHTML = rankedList.map((item, index) => `
      <div class="rating-item-card" onclick="openCandidateDetail('${item.candidate.id}')">
        <div class="rating-item-left">
          <span style="font-weight: 800; color: var(--gold-mid); min-width: 24px; font-size: 1rem;">#${index + 1}</span>
          <img class="rating-item-avatar" src="${item.candidate.photo_url || 'icons/favicon.png'}" alt="${item.candidate.first_name}">
          <div>
            <div class="rating-item-name">${item.candidate.first_name} ${item.candidate.last_name || ''}</div>
            <div class="rating-item-song">${item.count} prestation(s) notée(s)</div>
          </div>
        </div>
        <div class="rating-item-badge">${item.avgScore.toFixed(1)}/20</div>
      </div>
    `).join('');
  }
}

// -------------------------------------------------------------
// GESTION DES FAVORIS (⭐ Clic en direct)
// -------------------------------------------------------------
async function toggleFavorite(candidateId) {
  const isFav = AppState.userFavorites.has(candidateId);

  if (isFav) {
    AppState.userFavorites.delete(candidateId);
  } else {
    AppState.userFavorites.add(candidateId);
  }

  // Sync Supabase si connecté
  if (supabaseClient && AppState.currentUser && AppState.isSupabaseDbReady) {
    try {
      if (isFav) {
        await supabaseClient.from('user_favorites').delete().eq('user_id', AppState.currentUser.id).eq('candidate_id', candidateId);
      } else {
        await supabaseClient.from('user_favorites').insert({
          user_id: AppState.currentUser.id,
          candidate_id: candidateId
        });
      }
    } catch (e) {
      console.warn("Supabase favorite sync error:", e);
    }
  }

  saveLocalUserData();
  showToast(isFav ? "Retiré des favoris" : "Ajouté à vos étoiles coup de cœur ! ⭐");

  // Re-render
  renderCandidatesTab();
  renderHomeTab();
  updateModalFavButton();
}

// -------------------------------------------------------------
// MODALE DÉTAIL CANDIDAT
// -------------------------------------------------------------
function openCandidateDetail(candidateId) {
  const cand = AppState.candidates.find(c => c.id === candidateId);
  if (!cand) return;

  AppState.selectedCandidateForModal = cand;

  const modal = document.getElementById('candidate-modal');
  const nameEl = document.getElementById('modal-cand-fullname');
  const imgEl = document.getElementById('modal-cand-img');
  const metaEl = document.getElementById('modal-cand-meta');
  const bioEl = document.getElementById('modal-cand-bio');
  const statusEl = document.getElementById('modal-cand-status');

  if (nameEl) nameEl.textContent = `${cand.first_name} ${cand.last_name || ''}`;
  if (imgEl) imgEl.src = cand.photo_url || 'icons/favicon.png';
  if (metaEl) metaEl.textContent = `${cand.age ? cand.age + ' ans' : ''} ${cand.city ? '• ' + cand.city : ''}`;
  if (bioEl) bioEl.textContent = cand.bio || 'Élève de la Star Academy.';

  if (statusEl) {
    const isNom = cand.status === 'nominated';
    const isElim = cand.status === 'eliminated';
    statusEl.textContent = isNom ? 'Nommé(e)' : (isElim ? 'Éliminé(e)' : 'En lice');
    statusEl.className = `candidate-status-tag ${isNom ? 'status-nominated' : (isElim ? 'status-eliminated' : 'status-active')}`;
  }

  updateModalFavButton();

  if (modal) modal.classList.add('open');
}

function updateModalFavButton() {
  const favBtn = document.getElementById('modal-cand-fav-btn');
  if (favBtn && AppState.selectedCandidateForModal) {
    const isFav = AppState.userFavorites.has(AppState.selectedCandidateForModal.id);
    favBtn.textContent = isFav ? "⭐ Retirer des favoris" : "⭐ Ajouter aux favoris";
  }
}

function toggleCurrentCandidateFav() {
  if (AppState.selectedCandidateForModal) {
    toggleFavorite(AppState.selectedCandidateForModal.id);
  }
}

function openRatingForCurrentCandidate() {
  closeCandidateModal();
  switchTab('primes');
  const candSelect = document.getElementById('rating-candidate-select');
  if (candSelect && AppState.selectedCandidateForModal) {
    candSelect.value = AppState.selectedCandidateForModal.id;
  }
}

function closeCandidateModal() {
  const modal = document.getElementById('candidate-modal');
  if (modal) modal.classList.remove('open');
}

// -------------------------------------------------------------
// GESTION MODALE AUTHENTIFICATION
// -------------------------------------------------------------
function openAuthModal() {
  if (AppState.currentUser) {
    switchTab('profile');
    return;
  }
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('open');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('open');
}

function toggleAuthMode() {
  AppState.isAuthModeSignUp = !AppState.isAuthModeSignUp;
  const title = document.getElementById('auth-modal-title');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const usernameGroup = document.getElementById('auth-username-group');

  if (AppState.isAuthModeSignUp) {
    if (title) title.textContent = "Créer un compte";
    if (submitBtn) submitBtn.textContent = "S'inscrire";
    if (toggleBtn) toggleBtn.textContent = "Déjà un compte ? Se connecter";
    if (usernameGroup) usernameGroup.style.display = 'block';
  } else {
    if (title) title.textContent = "Connexion";
    if (submitBtn) submitBtn.textContent = "Se connecter";
    if (toggleBtn) toggleBtn.textContent = "Pas encore de compte ? S'inscrire";
    if (usernameGroup) usernameGroup.style.display = 'none';
  }
}

async function handleAuthSubmit() {
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const usernameInput = document.getElementById('auth-username');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  const username = usernameInput ? usernameInput.value.trim() : '';

  if (!email || !password) {
    showToast("Veuillez remplir l'email et le mot de passe", "error");
    return;
  }

  if (!supabaseClient) {
    showToast("Client Supabase indisponible", "error");
    return;
  }

  try {
    if (AppState.isAuthModeSignUp) {
      // Inscription
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username || email.split('@')[0]
          }
        }
      });

      if (error) {
        showToast(error.message, "error");
        return;
      }

      showToast("Compte créé avec succès ! Bienvenue à la Star Ac'");
      closeAuthModal();
    } else {
      // Connexion
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        showToast(error.message, "error");
        return;
      }

      showToast("Connexion réussie ! Vos notes sont synchronisées.");
      closeAuthModal();
    }
  } catch (err) {
    showToast("Erreur d'authentification : " + err.message, "error");
  }
}

async function handleSignOut() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  AppState.currentUser = null;
  AppState.profile = null;
  showToast("Vous avez été déconnecté.");
  renderApp();
}

// -------------------------------------------------------------
// GUIDE IPHONE ET MODALE SQL
// -------------------------------------------------------------
function openIosGuideModal() {
  const modal = document.getElementById('ios-guide-modal');
  if (modal) modal.classList.add('open');
}

function closeIosGuideModal() {
  const modal = document.getElementById('ios-guide-modal');
  if (modal) modal.classList.remove('open');
}

function openSqlModal() {
  const modal = document.getElementById('sql-modal');
  const display = document.getElementById('sql-code-display');
  if (display) {
    display.value = `-- EXÉCUTER CE SCRIPT DANS SUPABASE -> SQL EDITOR -> RUN
-- Voir le fichier 'supabase_setup.sql' à la racine du projet pour le script complet !
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profils publics" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Gestion perso" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.candidates (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    age INT,
    city TEXT,
    bio TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active'
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidats lecture" ON public.candidates FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.user_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES public.candidates(id),
    prime_id INT,
    score NUMERIC(4, 1) NOT NULL,
    song_title TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notes lecture" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Notes écriture" ON public.user_ratings FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id TEXT NOT NULL REFERENCES public.candidates(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Favoris perso" ON public.user_favorites FOR ALL USING (auth.uid() = user_id);
`;
  }
  if (modal) modal.classList.add('open');
}

function closeSqlModal() {
  const modal = document.getElementById('sql-modal');
  if (modal) modal.classList.remove('open');
}

function copySqlToClipboard() {
  const display = document.getElementById('sql-code-display');
  if (display) {
    navigator.clipboard.writeText(display.value)
      .then(() => showToast("Script SQL copié dans le presse-papiers !"))
      .catch(() => showToast("Sélectionnez et copiez le texte manuellement."));
  }
}

// -------------------------------------------------------------
// UTILITAIRE TOASTS iOS
// -------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'error' : ''}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : '✨'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}
