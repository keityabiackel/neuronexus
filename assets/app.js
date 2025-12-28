// NeuroNexus — storage + utilitários (sem backend)

export const KEYS = {
  HOUSE: "neuronexus.houseState.v1",
  PROFILES: "neuronexus.profiles.v1",
  ACTIVE_PROFILE: "neuronexus.profileActiveId.v1",
  EVENTS: "neuronexus.events.v1",
  HUB: "neuronexus.hub.v1"
};

export function nowIso(){ return new Date().toISOString(); }

export function safeParse(raw){
  try { return JSON.parse(raw); } catch { return null; }
}

export function uid(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2,10)}_${Date.now().toString(16)}`;
}

export function formatWhen(iso){
  try { return new Date(iso).toLocaleString(); } catch { return "—"; }
}

// ---- HUB ----
export function defaultHub(){
  return { hubName: "", adminName: "", updatedAt: nowIso() };
}

export function loadHub(){
  const raw = localStorage.getItem(KEYS.HUB);
  const parsed = raw ? safeParse(raw) : null;
  return { ...defaultHub(), ...(parsed || {}) };
}

export function saveHub(hub){
  const payload = { ...defaultHub(), ...hub, updatedAt: nowIso() };
  localStorage.setItem(KEYS.HUB, JSON.stringify(payload));
  return payload;
}

// ---- HOUSE STATE (B) ----
export function normalizeState(state){
  const s = String(state || "").toUpperCase();
  return (s === "GREEN" || s === "YELLOW" || s === "RED") ? s : null;
}

export function loadHouse(){
  const raw = localStorage.getItem(KEYS.HOUSE);
  const parsed = raw ? safeParse(raw) : null;
  if (!parsed || !parsed.state) return null;
  return parsed;
}

export function saveHouse(state){
  const st = normalizeState(state);
  if (!st) return null;
  const payload = { state: st, updatedAt: nowIso() };
  localStorage.setItem(KEYS.HOUSE, JSON.stringify(payload));
  return payload;
}

export function clearHouse(){
  localStorage.removeItem(KEYS.HOUSE);
}

// ---- PROFILES ----
// Perfil tem: fixos + semipermanentes (listas) — eventos ficam separado
export function defaultProfile(){
  return {
    id: uid("p"),
    // FIXOS
    name: "",
    birthDate: "", // YYYY-MM-DD
    role: "membro", // criança, responsável, etc.
    // SEMIPERMANENTES
    allergies: [], // {id, label, startedAt, active, notes}
    notes: "", // notas operacionais gerais
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export function loadProfiles(){
  const raw = localStorage.getItem(KEYS.PROFILES);
  const arr = raw ? safeParse(raw) : null;
  return Array.isArray(arr) ? arr : [];
}

export function saveProfiles(list){
  localStorage.setItem(KEYS.PROFILES, JSON.stringify(list || []));
}

export function loadActiveProfileId(){
  return localStorage.getItem(KEYS.ACTIVE_PROFILE) || "";
}

export function setActiveProfileId(id){
  localStorage.setItem(KEYS.ACTIVE_PROFILE, id);
}

export function upsertProfile(profile){
  const list = loadProfiles();
  const p = { ...defaultProfile(), ...profile, updatedAt: nowIso() };
  const idx = list.findIndex(x => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  saveProfiles(list);
  return p;
}

export function deleteProfile(id){
  const list = loadProfiles().filter(p => p.id !== id);
  saveProfiles(list);
  if (loadActiveProfileId() === id) {
    const next = list[0]?.id || "";
    if (next) setActiveProfileId(next);
    else localStorage.removeItem(KEYS.ACTIVE_PROFILE);
  }
}

// ---- EVENTS (A) ----
// Eventos podem ser do HUB ou de um PROFILE (ou ambos)
export function defaultEvent(){
  return {
    id: uid("e"),
    scope: "hub", // "hub" | "profile"
    profileId: "", // se scope="profile"
    type: "crise", // crise, sono, escola, saúde, rotina...
    context: "casa", // casa, escola, saúde, emergência
    startedAt: nowIso(),
    endedAt: "", // vazio = em andamento
    severity: "", // opcional: leve/moderado/intenso
    notes: "",
    createdAt: nowIso()
  };
}

export function loadEvents(){
  const raw = localStorage.getItem(KEYS.EVENTS);
  const arr = raw ? safeParse(raw) : null;
  return Array.isArray(arr) ? arr : [];
}

export function saveEvents(list){
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(list || []));
}

export function addEvent(ev){
  const list = loadEvents();
  const e = { ...defaultEvent(), ...ev };
  list.push(e);
  saveEvents(list);
  return e;
}

export function deleteEvent(id){
  const list = loadEvents().filter(e => e.id !== id);
  saveEvents(list);
}

