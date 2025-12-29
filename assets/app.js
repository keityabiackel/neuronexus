// NeuroNexus — núcleo de dados (LocalStorage only)

export const KEYS = {
  PERSONS: "neuronexus.persons.v2",
  CLANS: "neuronexus.clans.v1",
  MEMBERSHIPS: "neuronexus.memberships.v1",
  ACTIVE_PERSON: "neuronexus.activePersonId.v1",
  ACTIVE_CLAN: "neuronexus.activeClanId.v1",
};

export function nowIso(){ return new Date().toISOString(); }
export function uid(p="id"){ return `${p}_${Math.random().toString(16).slice(2,8)}_${Date.now().toString(16)}`; }
function parse(raw){ try{ return JSON.parse(raw);}catch{return null;} }

// =====================
// TAXONOMIA — v1.0
// =====================
export const NEURO_TAXONOMY = {
  layer1_base: [
    "neurotipico",
    "autismo",
    "tdah",
    "superdotacao",
    "tourette",
    "afantasia",
    "hipermetafantasia"
  ],

  layer2_profiles: {
    emocao_self: [
      "alexitimia",
      "hiperempatia",
      "hipoempatia",
      "dificuldade_reconhecimento_emocional",
      "dissociacao_leve",
      "alteracoes_interocepcao"
    ],
    sensorial_motor: [
      "disfuncao_integracao_sensorial",
      "dispraxia",
      "tpac_dpac",
      "hipotonia",
      "alteracoes_propriocepcao",
      "tiques",
      "misofonia_hiperacusia",
      "fotossensibilidade_fotofobia"
    ],
    linguagem: [
      "dislexia",
      "disgrafia",
      "discalculia",
      "hiperlexia",
      "disfluencia",
      "del_pragmatica",
      "del_formal",
      "del_semantica",
      "assimetrias_linguagem"
    ]
  },

  layer3_neurologic: [
    "epilepsia",
    "enxaqueca_cronica",
    "disturbios_sono",
    "catatonia_autismo",
    "sequelas_neurologicas_leves"
  ],

  layer4_psychiatric: [
    "transtornos_psicoticos",
    "esquizofrenia",
    "esquizoafetivo",
    "delirante",
    "psicotico_breve",
    "ansiedade",
    "toc",
    "depressao",
    "transtornos_humor",
    "burnout_neurodivergente",
    "transtornos_alimentares_arfid"
  ]
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
    neuroProfile: {
      base: "neurotipico", // camada 1
      baseStatus: "confirmado", // confirmado | suspeita
      profiles: {},   // camada 2
      neurologic: [], // camada 3
      psychiatric: [],// camada 4
      supportLevel: "nao_informado", // baixo | moderado | alto | flutuante | nao_informado
      supportContexts: [],
      observations: ""
    },
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

// =====================
// STORAGE — PERSONS
// =====================
export function loadPersons(){
  const raw = localStorage.getItem(KEYS.PERSONS);
  const arr = raw ? parse(raw) : null;
  return Array.isArray(arr) ? arr : [];
}

export function savePersons(list){
  localStorage.setItem(KEYS.PERSONS, JSON.stringify(list));
}

export function upsertPerson(person){
  const list = loadPersons();
  const p = { ...defaultPerson(), ...person, updatedAt: nowIso() };

  const i = list.findIndex(x => x.id === p.id);
  if (i >= 0) list[i] = p;
  else list.push(p);

  savePersons(list);
  return p;
}

export function deletePerson(id){
  const list = loadPersons().filter(p => p.id !== id);
  savePersons(list);
}

export function loadActivePersonId(){
  return localStorage.getItem(KEYS.ACTIVE_PERSON) || "";
}
export function setActivePersonId(id){
  localStorage.setItem(KEYS.ACTIVE_PERSON, id);
}
