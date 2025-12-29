// NeuroNexus — LocalStorage only (MVP)
// Tudo aqui é "fonte de verdade" do app.

export const KEYS = {
  PERSONS: "neuronexus.persons.v3",
  CLANS: "neuronexus.clans.v2",
  MEMBERSHIPS: "neuronexus.memberships.v2",
  HOUSE: "neuronexus.house.v2", // mapa: { "<clanId||global>": {state, updatedAt} }
  ACTIVE_CLAN: "neuronexus.activeClanId.v2",
};

export function nowIso() { return new Date().toISOString(); }
export function uid(prefix="id") {
  return `${prefix}_${Math.random().toString(16).slice(2,8)}_${Date.now().toString(16)}`;
}
function parse(raw){ try { return JSON.parse(raw); } catch { return null; } }
function getJson(key, fallback){
  const raw = localStorage.getItem(key);
  const v = raw ? parse(raw) : null;
  return (v === null || v === undefined) ? fallback : v;
}
function setJson(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

export function formatWhen(iso){
  if(!iso) return "—";
  const d = new Date(iso);
  const pad = (n)=> String(n).padStart(2,"0");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// =====================
// TAXONOMIA — v1.0 (a sua)
// =====================
export const TAXONOMY = {
  layer1_base: [
    { key:"neurotipico", label:"Nenhum (Pessoa Neurotípica)" },
    { key:"autismo", label:"Autismo (TEA)" },
    { key:"tdah", label:"TDAH" },
    { key:"superdotacao", label:"Superdotação / Altas Habilidades" },
    { key:"tourette", label:"Tourette" },
    { key:"afantasia", label:"Afantasia" },
    { key:"hipermetafantasia", label:"Hipermetafantasia" },
  ],

  layer2: {
    emocao_self: [
      ["alexitimia","Alexitimia"],
      ["hiperempatia","Hiperempatia"],
      ["hipoempatia","Hipoempatia"],
      ["dificuldades_reconhecimento_emocional","Dificuldades de reconhecimento emocional"],
      ["dissociacao_leve","Dissociação leve"],
      ["alteracoes_interocepcao","Alterações de interocepção"],
    ],
    sensorial_motor: [
      ["disfuncao_integracao_sensorial","Disfunção de Integração Sensorial"],
      ["dispraxia_tdc","Dispraxia (TDC)"],
      ["tpac_dpac","TPAC / DPAC"],
      ["hipotonia","Hipotonia"],
      ["alteracoes_propriocepcao","Alterações de propriocepção"],
      ["tiques_motores_vocais","Tiques motores e vocais"],
      ["misofonia_hiperacusia","Misofonia / Hiperacusia"],
      ["fotossensibilidade_fotofobia","Fotossensibilidade / Fotofobia"],
    ],
    linguagem: [
      ["dislexia","Dislexia"],
      ["disgrafia","Disgrafia"],
      ["discalculia","Discalculia"],
      ["hiperlexia","Hiperlexia"],
      ["disfluencia","Disfluência"],
      ["del_pragmatica","Distúrbio Específico de Linguagem Pragmática"],
      ["del_formal","Distúrbio Específico de Linguagem Formal"],
      ["del_semantica","Distúrbio Específico de Linguagem Semântica"],
      ["assimetrias_linguagem","Assimetrias de linguagem"],
    ]
  },

  layer3: [
    ["epilepsia","Epilepsia"],
    ["enxaqueca_cronica","Enxaqueca crônica"],
    ["disturbios_sono","Distúrbios do sono (insônia, atraso de fase etc.)"],
    ["catatonia_autismo","Catatonia associada ao autismo"],
    ["sequelas_neurologicas_leves","Sequelas neurológicas leves com impacto cognitivo"],
  ],

  layer4: {
    psicoticos: [
      ["espectro_psicotico","Transtornos do espectro psicótico (como comorbidade)"],
      ["esquizofrenia","Esquizofrenia"],
      ["esquizoafetivo","Transtorno esquizoafetivo"],
      ["delirante","Transtorno delirante"],
      ["psicotico_breve","Transtorno psicótico breve"],
    ],
    outros: [
      ["ansiedade","Transtornos de Ansiedade"],
      ["toc","TOC"],
      ["depressao","Depressão"],
      ["transtornos_humor","Transtornos do humor"],
      ["burnout_nd","Burnout neurodivergente"],
      ["transtornos_alimentares_arfid","Transtornos alimentares (especialmente ARFID)"],
    ]
  }
};

// =====================
// MODELOS
// =====================
export function defaultPerson(){
  return {
    id: uid("p"),
    name: "",
    birthDate: "",
    notes: "",
    neuro: {
      baseTypes: ["neurotipico"],     // MULTI
      baseStatus: "confirmado",       // confirmado | suspeita
      layer2: [],                     // chaves
      layer3: [],                     // chaves
      layer4: [],                     // chaves (psicóticos+outros juntos aqui)
      supportLevel: "nao_informado",  // baixo|moderado|alto|flutuante|nao_informado
      observations: ""
    },
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export function defaultClan(){
  return {
    id: uid("c"),
    name: "",
    adminName: "",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

// =====================
// PERSONS CRUD
// =====================
export function loadPersons(){ return getJson(KEYS.PERSONS, []); }
export function savePersons(list){ setJson(KEYS.PERSONS, list); }

export function getPerson(id){
  return loadPersons().find(p=>p.id===id) || null;
}

export function upsertPerson(person){
  const list = loadPersons();
  const p = { ...defaultPerson(), ...person, updatedAt: nowIso() };
  const i = list.findIndex(x=>x.id===p.id);
  if(i>=0) list[i]=p; else list.push(p);
  savePersons(list);
  return p;
}

export function deletePerson(id){
  // remove pessoa
  savePersons(loadPersons().filter(p=>p.id!==id));
  // remove vínculos dela em todos clãs
  const m = loadMemberships().filter(x=>x.personId!==id);
  saveMemberships(m);
}

// =====================
// CLANS CRUD
// =====================
export function loadClans(){ return getJson(KEYS.CLANS, []); }
export function saveClans(list){ setJson(KEYS.CLANS, list); }

export function upsertClan(clan){
  const list = loadClans();
  const c = { ...defaultClan(), ...clan, updatedAt: nowIso() };
  const i = list.findIndex(x=>x.id===c.id);
  if(i>=0) list[i]=c; else list.push(c);
  saveClans(list);
  return c;
}

export function deleteClan(id){
  saveClans(loadClans().filter(c=>c.id!==id));
  // remove memberships desse clã
  saveMemberships(loadMemberships().filter(m=>m.clanId!==id));
  // remove house state desse clã
  const map = loadHouseMap();
  delete map[houseKey(id)];
  setJson(KEYS.HOUSE, map);

  // se era ativo, limpa
  if(loadActiveClanId()===id) setActiveClanId("");
}

export function loadActiveClanId(){
  return localStorage.getItem(KEYS.ACTIVE_CLAN) || "";
}
export function setActiveClanId(id){
  localStorage.setItem(KEYS.ACTIVE_CLAN, id || "");
}

// =====================
// MEMBERSHIPS (Pessoa ↔ Clã)
// =====================
export function loadMemberships(){ return getJson(KEYS.MEMBERSHIPS, []); }
export function saveMemberships(list){ setJson(KEYS.MEMBERSHIPS, list); }

export function addMembership(clanId, personId, roleInClan=""){
  const list = loadMemberships();
  const exists = list.some(m=>m.clanId===clanId && m.personId===personId);
  if(exists) return;

  list.push({
    id: uid("m"),
    clanId,
    personId,
    roleInClan,
    createdAt: nowIso()
  });
  saveMemberships(list);
}

export function removeMembership(clanId, personId){
  saveMemberships(loadMemberships().filter(m=>!(m.clanId===clanId && m.personId===personId)));
}

export function membersOfClan(clanId){
  const persons = loadPersons();
  const ms = loadMemberships().filter(m=>m.clanId===clanId);
  return ms.map(m=>({
    membership: m,
    person: persons.find(p=>p.id===m.personId)
  })).filter(x=>x.person);
}

// =====================
// HOUSE STATE (por clã)
// =====================
function houseKey(clanId){
  return clanId ? `clan:${clanId}` : "global";
}
function loadHouseMap(){
  return getJson(KEYS.HOUSE, {});
}

export function loadHouse(clanId){
  const map = loadHouseMap();
  return map[houseKey(clanId)] || null;
}

export function saveHouse(state, clanId){
  const map = loadHouseMap();
  map[houseKey(clanId)] = { state, updatedAt: nowIso() };
  setJson(KEYS.HOUSE, map);
}

export function clearHouse(clanId){
  const map = loadHouseMap();
  delete map[houseKey(clanId)];
  setJson(KEYS.HOUSE, map);
}
