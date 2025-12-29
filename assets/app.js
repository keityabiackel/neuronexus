// NeuroNexus — storage + utilitários (sem backend)

export const KEYS = {
  HOUSE: "neuronexus.houseState.v2",

  // NOVO: separação Pessoa x Clã x Vínculos
  PERSONS: "neuronexus.persons.v1",
  CLANS: "neuronexus.clans.v1",
  MEMBERSHIPS: "neuronexus.memberships.v1",

  ACTIVE_PERSON: "neuronexus.activePersonId.v1",
  ACTIVE_CLAN: "neuronexus.activeClanId.v1",

  EVENTS: "neuronexus.events.v1"
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

// ---- CLÃS ----
export function defaultClan(){
  return {
    id: uid("c"),
    name: "",
    adminName: "",
    notes: "",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export function loadClans(){
  const raw = localStorage.getItem(KEYS.CLANS);
  const arr = raw ? safeParse(raw) : null;
  return Array.isArray(arr) ? arr : [];
}

export function saveClans(list){
  localStorage.setItem(KEYS.CLANS, JSON.stringify(list || []));
}

export function upsertClan(clan){
  const list = loadClans();
  const c = { ...defaultClan(), ...clan, updatedAt: nowIso() };

  const idx = list.findIndex(x => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.push(c);

  saveClans(list);
  return c;
}

export function deleteClan(id){
  const list = loadClans().filter(c => c.id !== id);
  saveClans(list);

  // remove vínculos desse clã
  const ms = loadMemberships().filter(m => m.clanId !== id);
  saveMemberships(ms);

  if (loadActiveClanId() === id) {
    const next = list[0]?.id || "";
    if (next) setActiveClanId(next);
    else localStorage.removeItem(KEYS.ACTIVE_CLAN);
  }
}

export function loadActiveClanId(){
  return localStorage.getItem(KEYS.ACTIVE_CLAN) || "";
}
export function setActiveClanId(id){
  localStorage.setItem(KEYS.ACTIVE_CLAN, id);
}

// ---- PESSOAS (perfil único, reutilizável em vários clãs) ----
export function defaultPerson(){
  return {
    id: uid("p"),

    // FIXOS
    name: "",
    birthDate: "", // YYYY-MM-DD
    role: "membro", // papel geral (pode ser refinado por clã depois)
    notes: "",

    // Neuroperfil (sem "desde" em data)
    neuroProfile: {
      // um "meta" simples para neurotípico x neurodivergente x não informado
      overall: "nao_informado", // "neurotipico" | "neurodivergente" | "nao_informado"

      // base e camadas. Cada item: {key,label,status,detect,notes,group?}
      base: [],
      layers: []
    },

    // SEMIPERMANENTES (já)
    allergies: [], // {id,label,startedAt,active,notes}

    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export function loadPersons(){
  const raw = localStorage.getItem(KEYS.PERSONS);
  const arr = raw ? safeParse(raw) : null;
  return Array.isArray(arr) ? arr : [];
}

export function savePersons(list){
  localStorage.setItem(KEYS.PERSONS, JSON.stringify(list || []));
}

export function upsertPerson(person){
  const list = loadPersons();
  const p = { ...defaultPerson(), ...person, updatedAt: nowIso() };

  // upgrade-safe: garante shape
  p.neuroProfile = p.neuroProfile || { overall: "nao_informado", base: [], layers: [] };
  p.neuroProfile.overall = p.neuroProfile.overall || "nao_informado";
  p.neuroProfile.base = Array.isArray(p.neuroProfile.base) ? p.neuroProfile.base : [];
  p.neuroProfile.layers = Array.isArray(p.neuroProfile.layers) ? p.neuroProfile.layers : [];
  p.allergies = Array.isArray(p.allergies) ? p.allergies : [];

  const idx = list.findIndex(x => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.push(p);

  savePersons(list);
  return p;
}

export function deletePerson(id){
  const list = loadPersons().filter(p => p.id !== id);
  savePersons(list);

  // remove vínculos dessa pessoa
  const ms = loadMemberships().filter(m => m.personId !== id);
  saveMemberships(ms);

  if (loadActivePersonId() === id) {
    const next = list[0]?.id || "";
    if (next) setActivePersonId(next);
    else localStorage.removeItem(KEYS.ACTIVE_PERSON);
  }
}

export function loadActivePersonId(){
  return localStorage.getItem(KEYS.ACTIVE_PERSON) || "";
}
export function setActivePersonId(id){
  localStorage.setItem(KEYS.ACTIVE_PERSON, id);
}

// ---- VÍNCULOS Pessoa ↔ Clã ----
export function defaultMembership(){
  return {
    id: uid("m"),
    clanId: "",
    personId: "",
    roleInClan: "", // opcional: mãe, avó, filho, etc.
    createdAt: nowIso()
  };
}

export function loadMemberships(){
  const raw = localStorage.getItem(KEYS.MEMBERSHIPS);
  const arr = raw ? safeParse(raw) : null;
  return Array.isArray(arr) ? arr : [];
}

export function saveMemberships(list){
  localStorage.setItem(KEYS.MEMBERSHIPS, JSON.stringify(list || []));
}

export function isMember(clanId, personId){
  return loadMemberships().some(m => m.clanId === clanId && m.personId === personId);
}

export function addMembership(clanId, personId, roleInClan=""){
  const ms = loadMemberships();
  if (ms.some(m => m.clanId === clanId && m.personId === personId)) return null;
  const m = { ...defaultMembership(), clanId, personId, roleInClan };
  ms.push(m);
  saveMemberships(ms);
  return m;
}

export function removeMembership(clanId, personId){
  const ms = loadMemberships().filter(m => !(m.clanId === clanId && m.personId === personId));
  saveMemberships(ms);
}

export function membersOfClan(clanId){
  const ms = loadMemberships().filter(m => m.clanId === clanId);
  const persons = loadPersons();
  const byId = new Map(persons.map(p => [p.id, p]));
  return ms.map(m => ({ membership: m, person: byId.get(m.personId) })).filter(x => !!x.person);
}

// ---- EVENTS (A) permanece para depois ----
export function defaultEvent(){
  return {
    id: uid("e"),
    scope: "clan", // "clan" | "person"
    clanId: "",
    personId: "",
    type: "crise",
    context: "casa",
    startedAt: nowIso(),
    endedAt: "",
    severity: "",
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
