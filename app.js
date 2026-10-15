/**
 * STAR ACADEMY - APPLICATION COMPLETE DE SUIVI iOS PWA
 * Évaluations, Primes, Primes passés, Classement glisser/déposer, Stats & Gestion modérateur.
 */

// Configuration Supabase
const SUPABASE_URL = "https://zufllaamwiurbapoygwq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_X0jNnbaK34Z4xD0Ek7DnXA_6dsHdqb4";

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Données initiales des candidats
const DEFAULT_CANDIDATES = [
  { id: 'marine', first_name: 'Marine', last_name: 'Delplace', age: 24, city: 'Lille', status: 'active', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { id: 'ebony', first_name: 'Ebony', last_name: 'Cham', age: 20, city: 'L\'Île-Saint-Denis', status: 'active', photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 'charles', first_name: 'Charles', last_name: 'Coste', age: 18, city: 'Pléneuf-Val-André', status: 'active', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 'franck', first_name: 'Franck', last_name: 'Diakhaby', age: 22, city: 'Bagneux', status: 'active', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 'marguerite', first_name: 'Marguerite', last_name: 'Boucher', age: 23, city: 'Paris', status: 'active', photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { id: 'maia', first_name: 'Maïa', last_name: 'Kopania', age: 21, city: 'Valence', status: 'active', photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
  { id: 'ulysse', first_name: 'Ulysse', last_name: 'Mars', age: 24, city: 'Marseille', status: 'active', photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
  { id: 'julie', first_name: 'Julie', last_name: 'Neveu', age: 19, city: 'Suisse', status: 'active', photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { id: 'masseo', first_name: 'Masséo', last_name: 'Dufour', age: 18, city: 'Soullans', status: 'active', photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { id: 'thomas', first_name: 'Thomas', last_name: 'Bernard', age: 21, city: 'Leuville', status: 'eliminated', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { id: 'emma', first_name: 'Emma', last_name: 'Perrier', age: 22, city: 'Lesquin', status: 'eliminated', photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' },
  { id: 'noah', first_name: 'Noah', last_name: 'Guerin', age: 20, city: 'Carcassonne', status: 'eliminated', photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80' },
  { id: 'paul', first_name: 'Paul', last_name: 'Miles', age: 23, city: 'Vannes', status: 'eliminated', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  { id: 'maylis', first_name: 'Maylis', last_name: 'Bort', age: 23, city: 'Belgique', status: 'eliminated', photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' }
];

// État Global de l'application
const AppState = {
  currentUser: null,
  profile: null,
  isModerator: false,
  isAuthModeSignUp: false,
  activeTab: 'evaluations',

  // Données
  candidates: [...DEFAULT_CANDIDATES],
  evaluations: [],      // array of evaluation objects
  primes: [],           // array of prime objects
  performances: [],     // array of performance objects
  weeklyRankings: {},   // { weekNumber: [candId1, candId2, ...] }

  // État onglet Évaluations
  selectedEvalWeek: 1,
  
  // État onglet Prime
  selectedPrimeWeek: 1,
  currentPrimeGuests: [],
  currentPrimeGate217: [],
  perfSelectedCandidates: new Set(),
  perfSelectedGuests: new Set(),
  perfMedleySongs: [],

  // État onglet Classement
  selectedRankingWeek: 1,
  pendingRankingToSave: null,
  sortableInstance: null,

  // État onglet Stats
  statsPeriod: 'global',
  statsViewRankMode: 'personal',
  statsSelectedCandidateId: null
};

// ============================================================
// INITIALISATION DE L'APPLICATION
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
  setupPWA();
  initWeekSelects();
  await initAuth();
});

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// Calcul automatique de la semaine actuelle de la saison
function getCurrentSeasonWeek() {
  // Lancement mi-octobre 2024
  const startDate = new Date('2024-10-12T00:00:00');
  const now = new Date();
  const diffTime = Math.max(0, now - startDate);
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
  return Math.min(Math.max(diffWeeks, 1), 12);
}

function initWeekSelects() {
  const currentWeek = getCurrentSeasonWeek();
  AppState.selectedEvalWeek = currentWeek;
  AppState.selectedPrimeWeek = currentWeek;
  AppState.selectedRankingWeek = currentWeek;

  const weekSelectIds = ['eval-week-select', 'prime-week-select', 'ranking-week-select'];
  weekSelectIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Semaine ${i} ${i === currentWeek ? '(Actuelle)' : ''}`;
      if (i === currentWeek) opt.selected = true;
      el.appendChild(opt);
    }
  });

  // Sélecteur de période dans l'onglet Stats
  const statsPeriodSelect = document.getElementById('stats-period-select');
  if (statsPeriodSelect) {
    for (let i = 1; i <= 12; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `Semaine ${i}`;
      statsPeriodSelect.appendChild(opt);
    }
  }

  const evalBadge = document.getElementById('eval-week-badge');
  if (evalBadge) evalBadge.textContent = `Semaine ${currentWeek}`;
}

// ============================================================
// AUTHENTIFICATION (GESTION ÉCRAN DÉCONNECTÉ vs APPLICATION)
// ============================================================
async function initAuth() {
  if (!supabaseClient) {
    showAuthScreen();
    return;
  }

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      await handleUserLoggedIn(session.user);
    } else {
      showAuthScreen();
    }

    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        await handleUserLoggedIn(session.user);
      } else {
        showAuthScreen();
      }
    });
  } catch (err) {
    console.warn("Auth initialization fallback:", err);
    showAuthScreen();
  }
}

async function handleUserLoggedIn(user) {
  AppState.currentUser = user;

  // Récupérer le profil Supabase
  try {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      AppState.profile = profile;
    } else {
      AppState.profile = {
        username: user.email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
        role: 'user'
      };
    }
  } catch (e) {
    AppState.profile = { username: user.email.split('@')[0], role: 'user' };
  }

  // Vérification du rôle modérateur
  const username = (AppState.profile?.username || '').toLowerCase();
  const email = (user.email || '').toLowerCase();
  AppState.isModerator = (
    AppState.profile?.role === 'moderator' ||
    AppState.profile?.role === 'admin' ||
    username === 'leanneba' ||
    username === 'leanne' ||
    email.includes('basin')
  );

  // Affichage de l'application & masquage de l'écran d'authentification
  showAppScreen();

  // Chargement des données utilisateur
  await loadAllData();
  renderAllViews();
}

function showAuthScreen() {
  AppState.currentUser = null;
  AppState.profile = null;
  AppState.isModerator = false;

  const authContainer = document.getElementById('auth-fullscreen-container');
  const appContainer = document.getElementById('app-container');

  if (authContainer) authContainer.style.display = 'flex';
  if (appContainer) appContainer.style.display = 'none';
}

function showAppScreen() {
  const authContainer = document.getElementById('auth-fullscreen-container');
  const appContainer = document.getElementById('app-container');

  if (authContainer) authContainer.style.display = 'none';
  if (appContainer) appContainer.style.display = 'flex';

  // Mise à jour du header
  const headerName = document.getElementById('header-username');
  const headerAvatar = document.getElementById('header-avatar');
  if (headerName) headerName.textContent = AppState.profile?.username || AppState.currentUser?.email?.split('@')[0];
  if (headerAvatar) headerAvatar.src = AppState.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${AppState.currentUser?.id}`;

  // Affichage du bouton Gestion pour les modérateurs
  const modTabBtn = document.getElementById('tab-btn-settings');
  if (modTabBtn) {
    modTabBtn.style.display = AppState.isModerator ? 'flex' : 'none';
  }
}

function toggleAuthMode() {
  AppState.isAuthModeSignUp = !AppState.isAuthModeSignUp;
  const subtitle = document.getElementById('auth-screen-subtitle');
  const usernameField = document.getElementById('auth-username-field');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleBtn = document.getElementById('auth-toggle-btn');

  if (AppState.isAuthModeSignUp) {
    if (subtitle) subtitle.textContent = "Créez votre compte Star Academy pour sauvegarder vos notes et classements.";
    if (usernameField) usernameField.style.display = 'block';
    if (submitBtn) submitBtn.textContent = "S'inscrire";
    if (toggleBtn) toggleBtn.textContent = "Déjà un compte ? Se connecter";
  } else {
    if (subtitle) subtitle.textContent = "Connectez-vous pour accéder à votre espace de suivi des primes et évaluations.";
    if (usernameField) usernameField.style.display = 'none';
    if (submitBtn) submitBtn.textContent = "Se connecter";
    if (toggleBtn) toggleBtn.textContent = "Pas encore de compte ? S'inscrire";
  }
}

async function handleAuthSubmit() {
  const email = document.getElementById('auth-email')?.value.trim();
  const password = document.getElementById('auth-password')?.value;
  const username = document.getElementById('auth-username')?.value.trim();

  if (!email || !password) {
    showToast("Veuillez renseigner votre email et mot de passe", "error");
    return;
  }

  if (!supabaseClient) {
    showToast("Client Supabase indisponible", "error");
    return;
  }

  try {
    if (AppState.isAuthModeSignUp) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split('@')[0] } }
      });
      if (error) {
        showToast(error.message, "error");
        return;
      }
      showToast("Compte créé avec succès ! Bienvenue à la Star Ac' ✨");
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        showToast(error.message, "error");
        return;
      }
      showToast("Connexion réussie !");
    }
  } catch (err) {
    showToast("Erreur d'authentification : " + err.message, "error");
  }
}

async function handleSignOut() {
  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }
  showAuthScreen();
  showToast("Vous avez été déconnecté.");
}

// ============================================================
// CHARGEMENT & SYNCHRONISATION DES DONNÉES
// ============================================================
async function loadAllData() {
  const userId = AppState.currentUser?.id;

  // 1. Candidats
  if (supabaseClient) {
    try {
      const { data: candData } = await supabaseClient.from('candidates').select('*').order('first_name');
      if (candData && candData.length > 0) {
        AppState.candidates = candData;
      }
    } catch (e) {}

    // 2. Évaluations
    try {
      const { data: evalData } = await supabaseClient.from('evaluations').select('*').eq('user_id', userId);
      if (evalData) AppState.evaluations = evalData;
    } catch (e) {
      loadLocalState('evaluations');
    }

    // 3. Primes
    try {
      const { data: primeData } = await supabaseClient.from('primes').select('*').order('week_number');
      if (primeData) AppState.primes = primeData;
    } catch (e) {
      loadLocalState('primes');
    }

    // 4. Prestations
    try {
      const { data: perfData } = await supabaseClient.from('performances').select('*').eq('user_id', userId);
      if (perfData) AppState.performances = perfData;
    } catch (e) {
      loadLocalState('performances');
    }

    // 5. Classements hebdomadaires
    try {
      const { data: rankData } = await supabaseClient.from('weekly_rankings').select('*').eq('user_id', userId);
      if (rankData) {
        AppState.weeklyRankings = {};
        rankData.forEach(r => {
          AppState.weeklyRankings[r.week_number] = r.ranked_candidate_ids;
        });
      }
    } catch (e) {
      loadLocalState('weeklyRankings');
    }
  } else {
    loadAllLocalState();
  }
}

function loadLocalState(key) {
  const uid = AppState.currentUser?.id || 'guest';
  const val = localStorage.getItem(`star_ac_${uid}_${key}`);
  if (val) {
    try { AppState[key] = JSON.parse(val); } catch (e) {}
  }
}

function saveLocalState(key) {
  const uid = AppState.currentUser?.id || 'guest';
  localStorage.setItem(`star_ac_${uid}_${key}`, JSON.stringify(AppState[key]));
}

function loadAllLocalState() {
  ['evaluations', 'primes', 'performances', 'weeklyRankings'].forEach(loadLocalState);
}

// ============================================================
// NAVIGATION PAR ONGLETS (TABS)
// ============================================================
function switchTab(tabName) {
  if (tabName === 'settings' && !AppState.isModerator) return;

  AppState.activeTab = tabName;
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`tab-${tabName}`);
  if (target) target.classList.add('active');

  // Mise à jour de la barre inférieure
  const tabNames = ['evaluations', 'prime', 'past-primes', 'rankings', 'stats', 'settings'];
  document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
    if (tabNames[idx] === tabName) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Rendu de l'onglet actif
  if (tabName === 'evaluations') renderEvaluationsTab();
  if (tabName === 'prime') renderPrimeTab();
  if (tabName === 'past-primes') renderPastPrimesTab();
  if (tabName === 'rankings') renderRankingsTab();
  if (tabName === 'stats') renderStatsTab();
  if (tabName === 'settings') renderSettingsTab();
}

function renderAllViews() {
  populateCandidateSelects();
  renderEvaluationsTab();
  renderPrimeTab();
  renderPastPrimesTab();
  renderRankingsTab();
  renderStatsTab();
  if (AppState.isModerator) renderSettingsTab();
}

function populateCandidateSelects() {
  const evalSelect = document.getElementById('eval-candidate-select');
  const primeElimSelect = document.getElementById('prime-eliminated-select');
  const statsCandSelect = document.getElementById('stats-candidate-select');

  const activeCandidates = AppState.candidates.filter(c => c.status !== 'eliminated');
  const allCandidates = AppState.candidates;

  if (evalSelect) {
    evalSelect.innerHTML = '<option value="">Sélectionner un élève...</option>' +
      activeCandidates.map(c => `<option value="${c.id}">${c.first_name} ${c.last_name || ''}</option>`).join('');
  }

  if (primeElimSelect) {
    primeElimSelect.innerHTML = '<option value="">Aucun / En attente du direct...</option>' +
      allCandidates.map(c => `<option value="${c.id}">${c.first_name} ${c.last_name || ''} (${c.status === 'eliminated' ? 'Déjà éliminé' : 'En lice'})</option>`).join('');
  }

  if (statsCandSelect) {
    statsCandSelect.innerHTML = allCandidates.map((c, i) =>
      `<option value="${c.id}" ${i === 0 ? 'selected' : ''}>${c.first_name} ${c.last_name || ''}</option>`
    ).join('');
    if (allCandidates.length > 0 && !AppState.statsSelectedCandidateId) {
      AppState.statsSelectedCandidateId = allCandidates[0].id;
    }
  }
}

// ============================================================
// 1. ONGLET ÉVALUATIONS
// ============================================================
function onEvalWeekChange(weekVal) {
  AppState.selectedEvalWeek = parseInt(weekVal);
  const badge = document.getElementById('eval-week-badge');
  if (badge) badge.textContent = `Semaine ${weekVal}`;
  loadCurrentEvaluationForm();
  renderWeekEvaluationsList();
}

function onEvalCandidateChange(candId) {
  loadCurrentEvaluationForm();
}

function calculateEvalAverage() {
  const sing = parseFloat(document.getElementById('eval-singing-score')?.value);
  const dance = parseFloat(document.getElementById('eval-dance-score')?.value);
  const theatre = parseFloat(document.getElementById('eval-theatre-score')?.value);

  const scores = [sing, dance, theatre].filter(s => !isNaN(s) && s >= 0 && s <= 20);
  const avgDisplay = document.getElementById('eval-average-display');
  const appreciation = document.getElementById('eval-appreciation-text');

  if (scores.length === 0) {
    if (avgDisplay) avgDisplay.textContent = "-- /20";
    if (appreciation) appreciation.textContent = "Renseignez les notes pour voir la moyenne";
    return null;
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avgDisplay) avgDisplay.textContent = `${avg.toFixed(1)} /20`;

  if (appreciation) {
    if (avg >= 18) appreciation.textContent = "Exceptionnel ! Moment magistral 🌟";
    else if (avg >= 16) appreciation.textContent = "Très belle prestation, niveau pro ✨";
    else if (avg >= 14) appreciation.textContent = "Bonne évaluation, solides bases 👍";
    else if (avg >= 12) appreciation.textContent = "Encourageant, mais perfectible 👏";
    else if (avg >= 10) appreciation.textContent = "Juste la moyenne, des fragilités 😐";
    else appreciation.textContent = "Évaluation difficile / Danger nomination ⚠️";
  }

  return avg;
}

function loadCurrentEvaluationForm() {
  const candId = document.getElementById('eval-candidate-select')?.value;
  const week = AppState.selectedEvalWeek;

  const songTitleEl = document.getElementById('eval-song-title');
  const songArtistEl = document.getElementById('eval-song-artist');
  const singEl = document.getElementById('eval-singing-score');
  const danceEl = document.getElementById('eval-dance-score');
  const theatreEl = document.getElementById('eval-theatre-score');
  const reviewEl = document.getElementById('eval-user-review');
  const feedbackEl = document.getElementById('eval-teachers-feedback');

  if (!candId) {
    if (songTitleEl) songTitleEl.value = '';
    if (songArtistEl) songArtistEl.value = '';
    if (singEl) singEl.value = '';
    if (danceEl) danceEl.value = '';
    if (theatreEl) theatreEl.value = '';
    if (reviewEl) reviewEl.value = '';
    if (feedbackEl) feedbackEl.value = '';
    calculateEvalAverage();
    return;
  }

  const existing = AppState.evaluations.find(e => e.week_number === week && e.candidate_id === candId);
  if (existing) {
    if (songTitleEl) songTitleEl.value = existing.song_title || '';
    if (songArtistEl) songArtistEl.value = existing.artist || '';
    if (singEl) singEl.value = existing.singing_score ?? '';
    if (danceEl) danceEl.value = existing.dance_score ?? '';
    if (theatreEl) theatreEl.value = existing.theatre_score ?? '';
    if (reviewEl) reviewEl.value = existing.user_review || '';
    if (feedbackEl) feedbackEl.value = existing.teachers_feedback || '';
  } else {
    if (songTitleEl) songTitleEl.value = '';
    if (songArtistEl) songArtistEl.value = '';
    if (singEl) singEl.value = '';
    if (danceEl) danceEl.value = '';
    if (theatreEl) theatreEl.value = '';
    if (reviewEl) reviewEl.value = '';
    if (feedbackEl) feedbackEl.value = '';
  }
  calculateEvalAverage();
}

async function saveEvaluation() {
  const candidateId = document.getElementById('eval-candidate-select')?.value;
  const weekNumber = AppState.selectedEvalWeek;

  if (!candidateId) {
    showToast("Veuillez sélectionner l'élève évalué *", "error");
    return;
  }

  const songTitle = document.getElementById('eval-song-title')?.value.trim() || '';
  const artist = document.getElementById('eval-song-artist')?.value.trim() || '';
  const singScore = parseFloat(document.getElementById('eval-singing-score')?.value);
  const danceScore = parseFloat(document.getElementById('eval-dance-score')?.value);
  const theatreScore = parseFloat(document.getElementById('eval-theatre-score')?.value);
  const userReview = document.getElementById('eval-user-review')?.value.trim() || '';
  const teachersFeedback = document.getElementById('eval-teachers-feedback')?.value.trim() || '';

  const evalPayload = {
    user_id: AppState.currentUser?.id,
    week_number: weekNumber,
    candidate_id: candidateId,
    song_title: songTitle,
    artist: artist,
    singing_score: isNaN(singScore) ? null : singScore,
    dance_score: isNaN(danceScore) ? null : danceScore,
    theatre_score: isNaN(theatreScore) ? null : theatreScore,
    user_review: userReview,
    teachers_feedback: teachersFeedback
  };

  if (supabaseClient && AppState.currentUser) {
    try {
      await supabaseClient.from('evaluations').upsert(evalPayload, { onConflict: 'user_id, week_number, candidate_id' });
    } catch (e) {
      console.warn("Supabase eval save fallback:", e);
    }
  }

  // Mise à jour de l'état local
  const existingIndex = AppState.evaluations.findIndex(e => e.week_number === weekNumber && e.candidate_id === candidateId);
  if (existingIndex >= 0) {
    AppState.evaluations[existingIndex] = { ...AppState.evaluations[existingIndex], ...evalPayload };
  } else {
    AppState.evaluations.push(evalPayload);
  }
  saveLocalState('evaluations');

  const cand = AppState.candidates.find(c => c.id === candidateId);
  showToast(`Évaluation de ${cand?.first_name || 'l\'élève'} enregistrée ! ⭐`);
  renderWeekEvaluationsList();
}

function renderEvaluationsTab() {
  loadCurrentEvaluationForm();
  renderWeekEvaluationsList();
}

function renderWeekEvaluationsList() {
  const container = document.getElementById('evaluations-week-list');
  const countBadge = document.getElementById('eval-count-badge');
  if (!container) return;

  const currentWeekEvals = AppState.evaluations.filter(e => e.week_number === AppState.selectedEvalWeek);
  if (countBadge) countBadge.textContent = `${currentWeekEvals.length} élève(s)`;

  if (currentWeekEvals.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.82rem; padding: 18px 0;">Aucune évaluation enregistrée pour la Semaine ${AppState.selectedEvalWeek}.</div>`;
    return;
  }

  container.innerHTML = currentWeekEvals.map(e => {
    const cand = AppState.candidates.find(c => c.id === e.candidate_id) || { first_name: 'Élève', photo_url: 'icons/favicon.png' };
    const scores = [e.singing_score, e.dance_score, e.theatre_score].filter(s => s !== null && !isNaN(s));
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '--';

    return `
      <div class="item-card" onclick="selectEvalForEdit('${e.candidate_id}')" style="cursor: pointer;">
        <div class="item-card-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${cand.photo_url || 'icons/favicon.png'}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" alt="">
            <div>
              <div class="item-title">${cand.first_name} ${cand.last_name || ''}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${e.song_title ? '🎵 ' + e.song_title + (e.artist ? ' (' + e.artist + ')' : '') : 'Évaluation sans titre'}</div>
            </div>
          </div>
          <div class="item-score-badge">${avg}/20</div>
        </div>
        <div style="display: flex; gap: 12px; font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px;">
          ${e.singing_score !== null ? `<span>Chant: <strong>${e.singing_score}</strong></span>` : ''}
          ${e.dance_score !== null ? `<span>Danse: <strong>${e.dance_score}</strong></span>` : ''}
          ${e.theatre_score !== null ? `<span>Théâtre: <strong>${e.theatre_score}</strong></span>` : ''}
        </div>
        ${e.user_review ? `<div style="font-size: 0.78rem; color: #FFFFFF; margin-top: 6px; font-style: italic;">« ${e.user_review} »</div>` : ''}
      </div>
    `;
  }).join('');
}

function selectEvalForEdit(candidateId) {
  const candSelect = document.getElementById('eval-candidate-select');
  if (candSelect) {
    candSelect.value = candidateId;
    loadCurrentEvaluationForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast("Évaluation chargée pour modification");
  }
}

// ============================================================
// 2. ONGLET PRIME (CONFIGURATION & PRESTATIONS)
// ============================================================
function loadPrimeForSelectedWeek(weekVal) {
  AppState.selectedPrimeWeek = parseInt(weekVal);
  const week = AppState.selectedPrimeWeek;

  const existingPrime = AppState.primes.find(p => p.week_number === week);
  const dateInput = document.getElementById('prime-date-input');
  const themeInput = document.getElementById('prime-theme-input');
  const elimSelect = document.getElementById('prime-eliminated-select');
  const reviewText = document.getElementById('prime-overall-review');

  if (existingPrime) {
    if (dateInput) dateInput.value = existingPrime.date || '';
    if (themeInput) themeInput.value = existingPrime.theme || '';
    if (elimSelect) elimSelect.value = existingPrime.eliminated_candidate_id || '';
    if (reviewText) reviewText.value = existingPrime.overall_review || '';
    AppState.currentPrimeGuests = Array.isArray(existingPrime.guests) ? [...existingPrime.guests] : [];
    AppState.currentPrimeGate217 = Array.isArray(existingPrime.gate_217_guests) ? [...existingPrime.gate_217_guests] : [];
  } else {
    if (dateInput) dateInput.value = '';
    if (themeInput) themeInput.value = '';
    if (elimSelect) elimSelect.value = '';
    if (reviewText) reviewText.value = '';
    AppState.currentPrimeGuests = [];
    AppState.currentPrimeGate217 = [];
  }

  renderGuestTags('prime');
  renderGuestTags('gate217');
  renderPerfGuestChips();
  renderPrimePerformancesList();
}

function handleGuestTagInput(event, type) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    const input = event.target;
    const val = input.value.trim().replace(',', '');
    if (!val) return;

    if (type === 'prime') {
      if (!AppState.currentPrimeGuests.includes(val)) {
        AppState.currentPrimeGuests.push(val);
      }
    } else {
      if (!AppState.currentPrimeGate217.includes(val)) {
        AppState.currentPrimeGate217.push(val);
      }
    }

    input.value = '';
    renderGuestTags(type);
    renderPerfGuestChips();
  }
}

function removeGuestTag(index, type) {
  if (type === 'prime') {
    AppState.currentPrimeGuests.splice(index, 1);
  } else {
    AppState.currentPrimeGate217.splice(index, 1);
  }
  renderGuestTags(type);
  renderPerfGuestChips();
}

function renderGuestTags(type) {
  const container = document.getElementById(type === 'prime' ? 'prime-guests-container' : 'prime-gate217-container');
  const input = document.getElementById(type === 'prime' ? 'prime-guest-input' : 'prime-gate217-input');
  if (!container || !input) return;

  const list = type === 'prime' ? AppState.currentPrimeGuests : AppState.currentPrimeGate217;
  const badgesHtml = list.map((g, idx) => `
    <span class="tag-badge">
      ${g}
      <button type="button" class="tag-remove-btn" onclick="removeGuestTag(${idx}, '${type}')">&times;</button>
    </span>
  `).join('');

  container.innerHTML = badgesHtml;
  container.appendChild(input);
}

async function savePrimeInfo() {
  const week = AppState.selectedPrimeWeek;
  const dateVal = document.getElementById('prime-date-input')?.value || null;
  const themeVal = document.getElementById('prime-theme-input')?.value.trim() || '';
  const elimVal = document.getElementById('prime-eliminated-select')?.value || null;
  const reviewVal = document.getElementById('prime-overall-review')?.value.trim() || '';

  const payload = {
    user_id: AppState.currentUser?.id,
    week_number: week,
    title: `Prime Semaine ${week}`,
    date: dateVal,
    theme: themeVal,
    eliminated_candidate_id: elimVal,
    guests: AppState.currentPrimeGuests,
    gate_217_guests: AppState.currentPrimeGate217,
    overall_review: reviewVal
  };

  if (supabaseClient && AppState.currentUser) {
    try {
      const { data } = await supabaseClient.from('primes').upsert(payload, { onConflict: 'user_id, week_number' }).select();
      if (data && data[0]) payload.id = data[0].id;
    } catch (e) {
      console.warn("Supabase prime save fallback:", e);
    }
  }

  const existingIdx = AppState.primes.findIndex(p => p.week_number === week);
  if (existingIdx >= 0) {
    AppState.primes[existingIdx] = { ...AppState.primes[existingIdx], ...payload };
  } else {
    AppState.primes.push(payload);
  }
  saveLocalState('primes');

  showToast(`Informations du Prime Semaine ${week} enregistrées ! 🎤`);
  renderPastPrimesTab();
}

// -------------------------------------------------------------
// PRESTATIONS DU PRIME
// -------------------------------------------------------------
function onPerfTypeChange(type) {
  const medleyCheckWrap = document.getElementById('perf-medley-checkbox-wrap');
  const medleyCheck = document.getElementById('perf-is-medley');
  const singleSongWrap = document.getElementById('perf-single-song-wrap');
  const multiSongWrap = document.getElementById('perf-multi-song-wrap');

  if (type === 'chant') {
    if (medleyCheckWrap) medleyCheckWrap.style.display = 'block';
    const isMedley = medleyCheck ? medleyCheck.checked : false;
    toggleMedleyMode(isMedley);
  } else if (type === 'autoportrait') {
    if (medleyCheckWrap) medleyCheckWrap.style.display = 'none';
    toggleMedleyMode(true);
  } else {
    if (medleyCheckWrap) medleyCheckWrap.style.display = 'none';
    toggleMedleyMode(false);
  }
}

function toggleMedleyMode(isMedley) {
  const singleWrap = document.getElementById('perf-single-song-wrap');
  const multiWrap = document.getElementById('perf-multi-song-wrap');

  if (isMedley) {
    if (singleWrap) singleWrap.style.display = 'none';
    if (multiWrap) multiWrap.style.display = 'block';
    if (AppState.perfMedleySongs.length === 0) {
      addMedleySongRow();
    }
  } else {
    if (singleWrap) singleWrap.style.display = 'block';
    if (multiWrap) multiWrap.style.display = 'none';
  }
}

function addMedleySongRow(title = '', artist = '') {
  AppState.perfMedleySongs.push({ title, artist });
  renderMedleySongRows();
}

function removeMedleySongRow(index) {
  AppState.perfMedleySongs.splice(index, 1);
  renderMedleySongRows();
}

function renderMedleySongRows() {
  const container = document.getElementById('medley-songs-container');
  if (!container) return;

  container.innerHTML = AppState.perfMedleySongs.map((s, idx) => `
    <div class="medley-row">
      <input type="text" class="custom-input" placeholder="Titre chanson ${idx + 1}" value="${s.title}" oninput="AppState.perfMedleySongs[${idx}].title = this.value">
      <input type="text" class="custom-input" placeholder="Artiste" value="${s.artist}" oninput="AppState.perfMedleySongs[${idx}].artist = this.value">
      <button type="button" class="medley-remove-btn" onclick="removeMedleySongRow(${idx})">&times;</button>
    </div>
  `).join('');
}

function renderPerfCandidatesGrid() {
  const container = document.getElementById('perf-candidates-select-grid');
  if (!container) return;

  container.innerHTML = AppState.candidates.map(c => {
    const isSelected = AppState.perfSelectedCandidates.has(c.id);
    return `
      <div class="candidate-select-chip ${isSelected ? 'selected' : ''}" onclick="togglePerfCandidateSelect('${c.id}')">
        <img class="candidate-select-avatar" src="${c.photo_url || 'icons/favicon.png'}" alt="${c.first_name}">
        <span class="candidate-select-name">${c.first_name}</span>
      </div>
    `;
  }).join('');

  renderPerfIndividualRatings();
}

function togglePerfCandidateSelect(candId) {
  if (AppState.perfSelectedCandidates.has(candId)) {
    AppState.perfSelectedCandidates.delete(candId);
  } else {
    AppState.perfSelectedCandidates.add(candId);
  }
  renderPerfCandidatesGrid();
}

function renderPerfGuestChips() {
  const container = document.getElementById('perf-guests-chips-container');
  if (!container) return;

  const allGuests = [...AppState.currentPrimeGuests, ...AppState.currentPrimeGate217];
  if (allGuests.length === 0) {
    container.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-muted);">Aucun invité renseigné pour ce prime.</span>`;
    return;
  }

  container.innerHTML = allGuests.map(g => {
    const isSelected = AppState.perfSelectedGuests.has(g);
    return `
      <button type="button" class="filter-pill ${isSelected ? 'active' : ''}" onclick="togglePerfGuestSelect('${g}')">
        ${g}
      </button>
    `;
  }).join('');
}

function togglePerfGuestSelect(guestName) {
  if (AppState.perfSelectedGuests.has(guestName)) {
    AppState.perfSelectedGuests.delete(guestName);
  } else {
    AppState.perfSelectedGuests.add(guestName);
  }
  renderPerfGuestChips();
}

function renderPerfIndividualRatings() {
  const wrap = document.getElementById('perf-individual-ratings-wrap');
  const container = document.getElementById('perf-individual-ratings-container');
  if (!wrap || !container) return;

  const selectedIds = Array.from(AppState.perfSelectedCandidates);
  if (selectedIds.length === 0) {
    wrap.style.display = 'none';
    return;
  }

  wrap.style.display = 'block';
  container.innerHTML = selectedIds.map(id => {
    const cand = AppState.candidates.find(c => c.id === id);
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; background: rgba(10, 8, 30, 0.5); padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <span style="font-size: 0.85rem; font-weight: 700; color: #FFFFFF;">${cand?.first_name || 'Élève'}</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <input type="number" id="perf-score-${id}" class="custom-input" min="0" max="20" step="0.5" placeholder="Note /20" style="width: 100px; text-align: center;">
          <span style="font-size: 0.8rem; color: var(--text-muted);">/20</span>
        </div>
      </div>
    `;
  }).join('');
}

async function savePerformance() {
  const week = AppState.selectedPrimeWeek;
  const perfType = document.getElementById('perf-type-select')?.value || 'chant';
  const isMedley = perfType === 'chant' && (document.getElementById('perf-is-medley')?.checked || false);

  let songsList = [];
  if (isMedley || perfType === 'autoportrait') {
    songsList = AppState.perfMedleySongs.filter(s => s.title.trim());
  } else {
    const t = document.getElementById('perf-song-title')?.value.trim();
    const a = document.getElementById('perf-song-artist')?.value.trim();
    if (t) songsList.push({ title: t, artist: a });
  }

  const selectedCandidateIds = Array.from(AppState.perfSelectedCandidates);
  if (selectedCandidateIds.length === 0) {
    showToast("Veuillez sélectionner au moins un élève sur la prestation *", "error");
    return;
  }

  // Récupération des notes individuelles
  const individualRatings = {};
  selectedCandidateIds.forEach(id => {
    const val = parseFloat(document.getElementById(`perf-score-${id}`)?.value);
    if (!isNaN(val) && val >= 0 && val <= 20) {
      individualRatings[id] = val;
    }
  });

  const userReview = document.getElementById('perf-user-review')?.value.trim() || '';

  const perfPayload = {
    id: 'perf_' + Date.now(),
    user_id: AppState.currentUser?.id,
    prime_week_number: week,
    performance_type: perfType,
    is_medley: isMedley,
    songs: songsList,
    candidate_ids: selectedCandidateIds,
    guest_names: Array.from(AppState.perfSelectedGuests),
    individual_ratings: individualRatings,
    user_review: userReview,
    created_at: new Date().toISOString()
  };

  if (supabaseClient && AppState.currentUser) {
    try {
      const { data } = await supabaseClient.from('performances').insert({
        user_id: AppState.currentUser.id,
        prime_week_number: week,
        performance_type: perfType,
        is_medley: isMedley,
        songs: songsList,
        candidate_ids: selectedCandidateIds,
        guest_names: Array.from(AppState.perfSelectedGuests),
        individual_ratings: individualRatings,
        user_review: userReview
      }).select();
      if (data && data[0]) perfPayload.id = data[0].id;
    } catch (e) {
      console.warn("Supabase perf save fallback:", e);
    }
  }

  AppState.performances.unshift(perfPayload);
  saveLocalState('performances');

  // Reset du formulaire
  AppState.perfSelectedCandidates.clear();
  AppState.perfSelectedGuests.clear();
  AppState.perfMedleySongs = [];
  const singleTitle = document.getElementById('perf-song-title');
  const singleArtist = document.getElementById('perf-song-artist');
  const reviewEl = document.getElementById('perf-user-review');
  if (singleTitle) singleTitle.value = '';
  if (singleArtist) singleArtist.value = '';
  if (reviewEl) reviewEl.value = '';

  renderPerfCandidatesGrid();
  renderPerfGuestChips();
  renderMedleySongRows();
  renderPrimePerformancesList();

  showToast("Prestation validée et enregistrée ! ✨");
}

function renderPrimePerformancesList() {
  const container = document.getElementById('prime-performances-list');
  const badge = document.getElementById('prime-perf-count-badge');
  if (!container) return;

  const perfs = AppState.performances.filter(p => p.prime_week_number === AppState.selectedPrimeWeek);
  if (badge) badge.textContent = `${perfs.length} prestation(s)`;

  if (perfs.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.82rem; padding: 16px 0;">Aucune prestation enregistrée pour ce prime.</div>`;
    return;
  }

  container.innerHTML = perfs.map(p => {
    const candNames = (p.candidate_ids || []).map(id => AppState.candidates.find(c => c.id === id)?.first_name || id).join(', ');
    const songsText = (p.songs || []).map(s => `${s.title}${s.artist ? ' (' + s.artist + ')' : ''}`).join(' + ');

    return `
      <div class="item-card">
        <div class="item-card-header">
          <div>
            <div class="item-title">${candNames}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Type : ${p.performance_type} ${p.is_medley ? '(Medley)' : ''}</div>
          </div>
          <span class="badge-gold">Semaine ${p.prime_week_number}</span>
        </div>
        ${songsText ? `<div style="font-size: 0.82rem; color: var(--text-gold); margin-top: 4px;">🎵 ${songsText}</div>` : ''}
        ${(p.guest_names && p.guest_names.length > 0) ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">🎤 Avec : ${p.guest_names.join(', ')}</div>` : ''}
        ${p.user_review ? `<div style="font-size: 0.78rem; color: #FFFFFF; margin-top: 6px; font-style: italic;">« ${p.user_review} »</div>` : ''}
      </div>
    `;
  }).join('');
}

function renderPrimeTab() {
  loadPrimeForSelectedWeek(AppState.selectedPrimeWeek);
  renderPerfCandidatesGrid();
}

// ============================================================
// 3. ONGLET PRIMES PASSÉS
// ============================================================
function renderPastPrimesTab() {
  const container = document.getElementById('past-primes-list');
  if (!container) return;

  if (AppState.primes.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 24px 0;">Aucun prime enregistré pour l'instant.</div>`;
    return;
  }

  // Trier par semaine
  const sortedPrimes = [...AppState.primes].sort((a, b) => b.week_number - a.week_number);

  container.innerHTML = sortedPrimes.map(p => {
    const elimCand = AppState.candidates.find(c => c.id === p.eliminated_candidate_id);
    const perfCount = AppState.performances.filter(perf => perf.prime_week_number === p.week_number).length;
    const guestsList = Array.isArray(p.guests) ? p.guests.join(', ') : '';

    return `
      <div class="item-card" onclick="openPastPrimeModal(${p.week_number})" style="cursor: pointer; transition: transform 0.15s ease;">
        <div class="item-card-header">
          <div>
            <div class="item-title">Prime Semaine ${p.week_number}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.date || 'Date non définie'}</div>
          </div>
          <span class="badge-gold">${perfCount} prestation(s)</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-gold); font-weight: 700; margin-top: 4px;">
          ${p.theme ? '✨ Thème : ' + p.theme : 'Sans thème'}
        </div>
        ${elimCand ? `<div style="font-size: 0.78rem; color: var(--danger-color); margin-top: 4px;">🚪 Éliminé(e) : ${elimCand.first_name} ${elimCand.last_name || ''}</div>` : ''}
        ${guestsList ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">🎤 Invités : ${guestsList}</div>` : ''}
        <div style="text-align: right; margin-top: 8px; font-size: 0.75rem; color: var(--gold-mid); font-weight: 700;">Voir les détails &rarr;</div>
      </div>
    `;
  }).join('');
}

function openPastPrimeModal(weekNumber) {
  const prime = AppState.primes.find(p => p.week_number === weekNumber) || { week_number: weekNumber };
  const perfs = AppState.performances.filter(perf => perf.prime_week_number === weekNumber);
  const elimCand = AppState.candidates.find(c => c.id === prime.eliminated_candidate_id);

  const titleEl = document.getElementById('past-prime-modal-title');
  const contentEl = document.getElementById('past-prime-modal-content');
  const modal = document.getElementById('prime-detail-modal');

  if (titleEl) titleEl.textContent = `Détail du Prime - Semaine ${weekNumber}`;
  if (contentEl) {
    contentEl.innerHTML = `
      <div style="background: rgba(10, 8, 30, 0.5); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
        <div style="font-size: 0.95rem; font-weight: 800; color: #FFFFFF;">${prime.theme || 'Thème non précisé'}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 8px;">Date : ${prime.date || 'Non renseignée'}</div>
        ${elimCand ? `<div style="font-size: 0.85rem; color: var(--danger-color); margin-bottom: 6px;">🚪 Éliminé(e) : <strong>${elimCand.first_name} ${elimCand.last_name || ''}</strong></div>` : ''}
        ${(prime.guests && prime.guests.length > 0) ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">🎤 Artistes invités : ${prime.guests.join(', ')}</div>` : ''}
        ${(prime.gate_217_guests && prime.gate_217_guests.length > 0) ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px;">🚪 Porte du 217 : ${prime.gate_217_guests.join(', ')}</div>` : ''}
        ${prime.overall_review ? `<div style="font-size: 0.82rem; color: #FFFFFF; margin-top: 8px; font-style: italic;">« ${prime.overall_review} »</div>` : ''}
      </div>

      <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--text-gold); margin-bottom: 10px; text-transform: uppercase;">Prestations du Prime (${perfs.length})</h4>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${perfs.length === 0 ? `<div style="color: var(--text-muted); font-size: 0.8rem;">Aucune prestation notée pour ce prime.</div>` : perfs.map(p => {
          const names = (p.candidate_ids || []).map(id => AppState.candidates.find(c => c.id === id)?.first_name || id).join(', ');
          const songs = (p.songs || []).map(s => `${s.title}${s.artist ? ' (' + s.artist + ')' : ''}`).join(' + ');
          const ratings = p.individual_ratings ? Object.entries(p.individual_ratings).map(([id, note]) => {
            const cand = AppState.candidates.find(c => c.id === id);
            return `${cand?.first_name || 'Élève'}: ${note}/20`;
          }).join(' • ') : '';

          return `
            <div class="item-card" style="margin-bottom: 0;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-weight: 800; color: #FFFFFF; font-size: 0.9rem;">${names}</span>
                <span class="badge-gold">${p.performance_type}</span>
              </div>
              ${songs ? `<div style="font-size: 0.8rem; color: var(--text-gold); margin-top: 2px;">🎵 ${songs}</div>` : ''}
              ${ratings ? `<div style="font-size: 0.75rem; color: #10B981; font-weight: 700; margin-top: 4px;">📊 Notes : ${ratings}</div>` : ''}
              ${p.user_review ? `<div style="font-size: 0.78rem; color: var(--text-secondary); font-style: italic; margin-top: 4px;">« ${p.user_review} »</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  if (modal) modal.classList.add('open');
}

function closePastPrimeModal() {
  const modal = document.getElementById('prime-detail-modal');
  if (modal) modal.classList.remove('open');
}

// ============================================================
// 4. ONGLET CLASSEMENT (DRAG & DROP SORTABLE JS)
// ============================================================
function onRankingWeekChange(weekVal) {
  AppState.selectedRankingWeek = parseInt(weekVal);
  renderRankingsTab();
}

function renderRankingsTab() {
  const container = document.getElementById('ranking-sortable-list');
  if (!container) return;

  const week = AppState.selectedRankingWeek;
  let orderedCandidateIds = AppState.weeklyRankings[week];

  // Si pas de classement sauvegardé pour cette semaine, prendre les élèves actifs par défaut
  if (!orderedCandidateIds || orderedCandidateIds.length === 0) {
    orderedCandidateIds = AppState.candidates.map(c => c.id);
  }

  // Filtrer pour ne garder que les candidats valides
  const candidateMap = new Map(AppState.candidates.map(c => [c.id, c]));
  const orderedList = orderedCandidateIds
    .map(id => candidateMap.get(id))
    .filter(Boolean);

  // Ajouter les éventuels candidats manquants à la fin
  AppState.candidates.forEach(c => {
    if (!orderedList.some(item => item.id === c.id)) {
      orderedList.push(c);
    }
  });

  container.innerHTML = orderedList.map((c, index) => `
    <div class="ranking-card-item" data-id="${c.id}">
      <div class="ranking-badge-pos">${index + 1}</div>
      <img class="ranking-avatar" src="${c.photo_url || 'icons/favicon.png'}" alt="${c.first_name}">
      <div class="ranking-details">
        <div class="ranking-name">${c.first_name} ${c.last_name || ''}</div>
        <div class="ranking-meta">${c.status === 'eliminated' ? 'Éliminé(e)' : (c.city || 'En lice')}</div>
      </div>
      <div class="ranking-drag-handle">☰</div>
    </div>
  `).join('');

  // Initialisation de SortableJS
  if (typeof Sortable !== 'undefined') {
    if (AppState.sortableInstance) {
      AppState.sortableInstance.destroy();
    }

    AppState.sortableInstance = new Sortable(container, {
      animation: 150,
      handle: '.ranking-card-item',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      touchStartThreshold: 3,
      onEnd: function () {
        updateRankingBadges();
      }
    });
  }
}

function updateRankingBadges() {
  const container = document.getElementById('ranking-sortable-list');
  if (!container) return;
  const items = container.querySelectorAll('.ranking-card-item');
  items.forEach((item, idx) => {
    const badge = item.querySelector('.ranking-badge-pos');
    if (badge) badge.textContent = idx + 1;
  });
}

function getSortedCandidateIdsFromDOM() {
  const container = document.getElementById('ranking-sortable-list');
  if (!container) return [];
  const items = container.querySelectorAll('.ranking-card-item');
  return Array.from(items).map(el => el.getAttribute('data-id'));
}

async function saveWeeklyRanking() {
  const week = AppState.selectedRankingWeek;
  const newOrder = getSortedCandidateIdsFromDOM();

  // Vérifier si un classement existe déjà pour cette semaine
  const existing = AppState.weeklyRankings[week];
  if (existing && existing.length > 0) {
    AppState.pendingRankingToSave = newOrder;
    const modal = document.getElementById('overwrite-ranking-modal');
    const weekSpan = document.getElementById('overwrite-modal-week');
    if (weekSpan) weekSpan.textContent = week;
    if (modal) modal.classList.add('open');
    return;
  }

  await performSaveWeeklyRanking(week, newOrder);
}

function closeOverwriteModal() {
  const modal = document.getElementById('overwrite-ranking-modal');
  if (modal) modal.classList.remove('open');
  AppState.pendingRankingToSave = null;
}

async function confirmOverwriteRanking() {
  const week = AppState.selectedRankingWeek;
  const newOrder = AppState.pendingRankingToSave || getSortedCandidateIdsFromDOM();
  closeOverwriteModal();
  await performSaveWeeklyRanking(week, newOrder);
}

async function performSaveWeeklyRanking(week, orderedIds) {
  AppState.weeklyRankings[week] = orderedIds;
  saveLocalState('weeklyRankings');

  if (supabaseClient && AppState.currentUser) {
    try {
      await supabaseClient.from('weekly_rankings').upsert({
        user_id: AppState.currentUser.id,
        week_number: week,
        ranked_candidate_ids: orderedIds
      }, { onConflict: 'user_id, week_number' });
    } catch (e) {
      console.warn("Supabase ranking save fallback:", e);
    }
  }

  showToast(`Classement de la Semaine ${week} enregistré avec succès ! 🏆`);
  renderStatsTab();
}

// ============================================================
// 5. ONGLET STATS (PROMO & ÉLÈVE)
// ============================================================
function onStatsPeriodChange(periodVal) {
  AppState.statsPeriod = periodVal;
  renderStatsTab();
}

function toggleStatsRankView(mode) {
  AppState.statsViewRankMode = mode;
  const pBtn = document.getElementById('stats-view-personal-btn');
  const mBtn = document.getElementById('stats-view-musical-btn');

  if (mode === 'personal') {
    if (pBtn) pBtn.classList.add('active');
    if (mBtn) mBtn.classList.remove('active');
  } else {
    if (pBtn) pBtn.classList.remove('active');
    if (mBtn) mBtn.classList.add('active');
  }
  renderPromoRankingList();
}

function onStatsCandidateChange(candId) {
  AppState.statsSelectedCandidateId = candId;
  renderCandidateStatsCard();
}

function renderStatsTab() {
  renderPromoRankingList();
  renderCandidateStatsCard();
}

function renderPromoRankingList() {
  const container = document.getElementById('stats-promo-ranking-container');
  if (!container) return;

  const isGlobal = AppState.statsPeriod === 'global';
  const targetWeek = parseInt(AppState.statsPeriod);

  // 1. Calcul du classement personnel
  const personalRanks = {};
  AppState.candidates.forEach(c => personalRanks[c.id] = []);

  if (isGlobal) {
    Object.values(AppState.weeklyRankings).forEach(orderList => {
      orderList.forEach((id, idx) => {
        if (personalRanks[id]) personalRanks[id].push(idx + 1);
      });
    });
  } else {
    const list = AppState.weeklyRankings[targetWeek] || [];
    list.forEach((id, idx) => {
      if (personalRanks[id]) personalRanks[id].push(idx + 1);
    });
  }

  // 2. Calcul du classement musical (notes de chant et prestations)
  const musicalScores = {};
  AppState.candidates.forEach(c => musicalScores[c.id] = []);

  // Notes d'évaluations (chant)
  AppState.evaluations.forEach(e => {
    if (isGlobal || e.week_number === targetWeek) {
      if (e.singing_score !== null && !isNaN(e.singing_score)) {
        if (musicalScores[e.candidate_id]) musicalScores[e.candidate_id].push(e.singing_score);
      }
    }
  });

  // Notes de primes
  AppState.performances.forEach(p => {
    if (isGlobal || p.prime_week_number === targetWeek) {
      if (p.individual_ratings) {
        Object.entries(p.individual_ratings).forEach(([id, score]) => {
          if (musicalScores[id] && !isNaN(score)) musicalScores[id].push(score);
        });
      }
    }
  });

  let ranked = [];
  if (AppState.statsViewRankMode === 'personal') {
    ranked = AppState.candidates.map(c => {
      const ranks = personalRanks[c.id] || [];
      const avgRank = ranks.length > 0 ? (ranks.reduce((a, b) => a + b, 0) / ranks.length) : 99;
      return { candidate: c, val: avgRank, count: ranks.length, isRank: true };
    }).sort((a, b) => a.val - b.val);
  } else {
    ranked = AppState.candidates.map(c => {
      const scores = musicalScores[c.id] || [];
      const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return { candidate: c, val: avgScore, count: scores.length, isRank: false };
    }).sort((a, b) => b.val - a.val);
  }

  container.innerHTML = ranked.map((item, idx) => `
    <div class="item-card" onclick="selectCandidateInStats('${item.candidate.id}')" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 900; color: var(--gold-mid); min-width: 26px;">#${idx + 1}</span>
        <img src="${item.candidate.photo_url || 'icons/favicon.png'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" alt="">
        <div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #FFFFFF;">${item.candidate.first_name} ${item.candidate.last_name || ''}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${item.candidate.status === 'eliminated' ? 'Éliminé(e)' : 'En lice'}</div>
        </div>
      </div>
      <div class="item-score-badge">
        ${item.isRank ? (item.val === 99 ? 'Non classé' : 'Rang ' + item.val.toFixed(1)) : (item.val === 0 ? '--/20' : item.val.toFixed(1) + '/20')}
      </div>
    </div>
  `).join('');
}

function selectCandidateInStats(candId) {
  const select = document.getElementById('stats-candidate-select');
  if (select) {
    select.value = candId;
    AppState.statsSelectedCandidateId = candId;
    renderCandidateStatsCard();
    select.scrollIntoView({ behavior: 'smooth' });
  }
}

function renderCandidateStatsCard() {
  const candId = AppState.statsSelectedCandidateId || (AppState.candidates[0] ? AppState.candidates[0].id : null);
  if (!candId) return;

  const isGlobal = AppState.statsPeriod === 'global';
  const targetWeek = parseInt(AppState.statsPeriod);

  // 1. Évaluations de l'élève
  const evals = AppState.evaluations.filter(e => e.candidate_id === candId && (isGlobal || e.week_number === targetWeek));
  const evalScores = [];
  evals.forEach(e => {
    const s = [e.singing_score, e.dance_score, e.theatre_score].filter(val => val !== null && !isNaN(val));
    if (s.length > 0) evalScores.push(s.reduce((a, b) => a + b, 0) / s.length);
  });
  const avgEval = evalScores.length > 0 ? (evalScores.reduce((a, b) => a + b, 0) / evalScores.length).toFixed(1) : '--';

  // 2. Prestations de l'élève
  const perfs = AppState.performances.filter(p => (p.candidate_ids || []).includes(candId) && (isGlobal || p.prime_week_number === targetWeek));
  const primeScores = [];
  perfs.forEach(p => {
    if (p.individual_ratings && p.individual_ratings[candId] !== undefined) {
      primeScores.push(p.individual_ratings[candId]);
    }
  });
  const avgPrime = primeScores.length > 0 ? (primeScores.reduce((a, b) => a + b, 0) / primeScores.length).toFixed(1) : '--';

  // 3. Moyenne globale
  const allScores = [...evalScores, ...primeScores];
  const avgGlobal = allScores.length > 0 ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : '--';

  // 4. Positions classements
  let rankPerso = '--';
  let rankMusic = '--';
  // Rang dans le classement hebdomadaire actuel
  const currentRanking = isGlobal ? null : (AppState.weeklyRankings[targetWeek] || []);
  if (currentRanking && currentRanking.includes(candId)) {
    rankPerso = `#${currentRanking.indexOf(candId) + 1}`;
  }

  // Mise à jour de l'UI
  const rPersoEl = document.getElementById('cand-stat-rank-perso');
  const rMusicEl = document.getElementById('cand-stat-rank-music');
  const aGlobalEl = document.getElementById('cand-stat-avg-global');
  const aEvalEl = document.getElementById('cand-stat-avg-eval');
  const aPrimeEl = document.getElementById('cand-stat-avg-prime');
  const totPerfsEl = document.getElementById('cand-stat-total-perfs');

  if (rPersoEl) rPersoEl.textContent = rankPerso;
  if (rMusicEl) rMusicEl.textContent = avgEval !== '--' ? `${avgEval}/20` : '--';
  if (aGlobalEl) aGlobalEl.textContent = avgGlobal !== '--' ? `${avgGlobal}/20` : '--';
  if (aEvalEl) aEvalEl.textContent = avgEval !== '--' ? `${avgEval}/20` : '--';
  if (aPrimeEl) aPrimeEl.textContent = avgPrime !== '--' ? `${avgPrime}/20` : '--';
  if (totPerfsEl) totPerfsEl.textContent = evals.length + perfs.length;

  // 5. Moyennes par type de prestation
  const typeMap = {
    chant: [],
    danse: [],
    theatre: [],
    chante_danse: [],
    comedie_musicale: [],
    autoportrait: []
  };

  // Depuis les évals (chant, danse, théâtre)
  evals.forEach(e => {
    if (e.singing_score !== null) typeMap.chant.push(e.singing_score);
    if (e.dance_score !== null) typeMap.danse.push(e.dance_score);
    if (e.theatre_score !== null) typeMap.theatre.push(e.theatre_score);
  });

  // Depuis les primes
  perfs.forEach(p => {
    const score = p.individual_ratings ? p.individual_ratings[candId] : null;
    if (score !== null && score !== undefined && typeMap[p.performance_type]) {
      typeMap[p.performance_type].push(score);
    }
  });

  const breakdownContainer = document.getElementById('cand-stat-types-breakdown');
  if (breakdownContainer) {
    const typeLabels = {
      chant: 'Chant',
      danse: 'Danse',
      theatre: 'Théâtre',
      chante_danse: 'Chanté / Dansé',
      comedie_musicale: 'Comédie Musicale',
      autoportrait: 'Autoportrait'
    };

    breakdownContainer.innerHTML = Object.entries(typeMap).map(([key, scores]) => {
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const pct = (avg / 20) * 100;
      return `
        <div class="stat-bar-row">
          <div class="stat-bar-header">
            <span>${typeLabels[key]}</span>
            <strong>${scores.length > 0 ? avg.toFixed(1) + '/20 (' + scores.length + ')' : '--'}</strong>
          </div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 6. Historique détaillé des prestations
  const historyContainer = document.getElementById('cand-stat-performances-history');
  if (historyContainer) {
    const allHistory = [
      ...evals.map(e => ({
        type: 'Évaluation',
        week: e.week_number,
        title: e.song_title,
        artist: e.artist,
        score: [e.singing_score, e.dance_score, e.theatre_score].filter(s => s !== null).join('/') || null,
        review: e.user_review
      })),
      ...perfs.map(p => ({
        type: `Prime (${p.performance_type})`,
        week: p.prime_week_number,
        title: (p.songs || []).map(s => s.title).join(' + '),
        artist: (p.songs || []).map(s => s.artist).filter(Boolean).join(', '),
        score: p.individual_ratings ? p.individual_ratings[candId] : null,
        review: p.user_review
      }))
    ];

    if (allHistory.length === 0) {
      historyContainer.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem;">Aucune prestation enregistrée pour cet élève.</div>`;
    } else {
      historyContainer.innerHTML = allHistory.map(item => `
        <div class="item-card" style="margin-bottom: 6px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; color: #FFFFFF;">
            <span>${item.type} - Semaine ${item.week}</span>
            <span style="color: var(--text-gold);">${item.score !== null && item.score !== undefined ? item.score + '/20' : ''}</span>
          </div>
          ${item.title ? `<div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">🎵 ${item.title} ${item.artist ? '(' + item.artist + ')' : ''}</div>` : ''}
          ${item.review ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-top: 4px;">« ${item.review} »</div>` : ''}
        </div>
      `).join('');
    }
  }
}

// ============================================================
// 6. ONGLET PARAMÈTRES (MODÉRATEUR)
// ============================================================
let uploadedCandidatePhotoBase64 = null;

function handleCandidatePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedCandidatePhotoBase64 = e.target.result;
    const preview = document.getElementById('mod-photo-preview');
    const wrap = document.getElementById('mod-photo-preview-wrap');
    if (preview) preview.src = uploadedCandidatePhotoBase64;
    if (wrap) wrap.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function saveCandidateFromModerator() {
  if (!AppState.isModerator) return;

  const firstName = document.getElementById('mod-cand-firstname')?.value.trim();
  const lastName = document.getElementById('mod-cand-lastname')?.value.trim();
  const age = parseInt(document.getElementById('mod-cand-age')?.value);
  const city = document.getElementById('mod-cand-city')?.value.trim();
  const photoUrlInput = document.getElementById('mod-cand-photo-url')?.value.trim();
  const status = document.getElementById('mod-cand-status')?.value || 'active';

  if (!firstName) {
    showToast("Le prénom est obligatoire", "error");
    return;
  }

  const id = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const photoUrl = uploadedCandidatePhotoBase64 || photoUrlInput || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

  const candidatePayload = {
    id,
    first_name: firstName,
    last_name: lastName || '',
    age: isNaN(age) ? null : age,
    city: city || '',
    photo_url: photoUrl,
    status
  };

  if (supabaseClient) {
    try {
      await supabaseClient.from('candidates').upsert(candidatePayload, { onConflict: 'id' });
    } catch (e) {
      console.warn("Supabase candidate save fallback:", e);
    }
  }

  const existingIdx = AppState.candidates.findIndex(c => c.id === id);
  if (existingIdx >= 0) {
    AppState.candidates[existingIdx] = { ...AppState.candidates[existingIdx], ...candidatePayload };
  } else {
    AppState.candidates.push(candidatePayload);
  }

  // Reset des champs
  document.getElementById('mod-cand-firstname').value = '';
  document.getElementById('mod-cand-lastname').value = '';
  document.getElementById('mod-cand-age').value = '';
  document.getElementById('mod-cand-city').value = '';
  document.getElementById('mod-cand-photo-url').value = '';
  uploadedCandidatePhotoBase64 = null;
  const wrap = document.getElementById('mod-photo-preview-wrap');
  if (wrap) wrap.style.display = 'none';

  populateCandidateSelects();
  renderSettingsTab();
  showToast(`Candidat(e) ${firstName} enregistré(e) avec succès ! ⭐`);
}

async function reintegrateCandidate(candidateId) {
  if (!AppState.isModerator) return;

  const cand = AppState.candidates.find(c => c.id === candidateId);
  if (!cand) return;

  cand.status = 'active';

  if (supabaseClient) {
    try {
      await supabaseClient.from('candidates').update({ status: 'active' }).eq('id', candidateId);
    } catch (e) {}
  }

  populateCandidateSelects();
  renderSettingsTab();
  showToast(`${cand.first_name} a été réintégré(e) dans la promotion ! ✨`);
}

function renderSettingsTab() {
  const container = document.getElementById('mod-eliminated-candidates-list');
  if (!container) return;

  const eliminated = AppState.candidates.filter(c => c.status === 'eliminated');
  if (eliminated.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem; padding: 10px 0;">Aucun élève éliminé actuellement.</div>`;
    return;
  }

  container.innerHTML = eliminated.map(c => `
    <div class="item-card" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="${c.photo_url || 'icons/favicon.png'}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" alt="">
        <div>
          <div style="font-weight: 700; color: #FFFFFF; font-size: 0.85rem;">${c.first_name} ${c.last_name || ''}</div>
          <div style="font-size: 0.72rem; color: var(--danger-color);">Éliminé(e)</div>
        </div>
      </div>
      <button class="btn-secondary" style="width: auto; padding: 6px 12px; font-size: 0.75rem;" onclick="reintegrateCandidate('${c.id}')">
        🔄 Réintégrer
      </button>
    </div>
  `).join('');
}

// ============================================================
// AUTOCOMPLÉTION RECHERCHE MUSICALE (APPLE iTUNES MUSIC API)
// ============================================================
let musicSearchTimeout = null;

function handleMusicSearch(query, context) {
  clearTimeout(musicSearchTimeout);
  const dropdown = document.getElementById(`${context}-autocomplete-dropdown`);
  if (!dropdown) return;

  if (!query || query.trim().length < 2) {
    dropdown.classList.remove('open');
    dropdown.innerHTML = '';
    return;
  }

  musicSearchTimeout = setTimeout(async () => {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=FR&entity=song&limit=6`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        dropdown.classList.remove('open');
        return;
      }

      dropdown.innerHTML = data.results.map(item => `
        <div class="autocomplete-item" onclick="selectMusicSuggestion('${escapeQuote(item.trackName)}', '${escapeQuote(item.artistName)}', '${context}')">
          <img class="autocomplete-art" src="${item.artworkUrl60 || 'icons/favicon.png'}" alt="">
          <div>
            <div class="autocomplete-title">${item.trackName}</div>
            <div class="autocomplete-artist">${item.artistName}</div>
          </div>
        </div>
      `).join('');

      dropdown.classList.add('open');
    } catch (err) {
      console.warn("Music search error:", err);
      dropdown.classList.remove('open');
    }
  }, 320);
}

function selectMusicSuggestion(trackName, artistName, context) {
  const titleInput = document.getElementById(`${context}-song-title`);
  const artistInput = document.getElementById(`${context}-song-artist`);
  const dropdown = document.getElementById(`${context}-autocomplete-dropdown`);

  if (titleInput) titleInput.value = trackName;
  if (artistInput) artistInput.value = artistName;
  if (dropdown) dropdown.classList.remove('open');
}

function escapeQuote(str) {
  return (str || '').replace(/'/g, "\\'");
}

// Fermer les dropdowns de musique si clic à l'extérieur
document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-wrapper')) {
    document.querySelectorAll('.autocomplete-dropdown').forEach(d => d.classList.remove('open'));
  }
});

// ============================================================
// TOASTS iOS
// ============================================================
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
