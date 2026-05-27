import avatarImg from '@/assets/avatar.png'

const STORAGE_KEY = 'vc-comunica-occurrences'

const seedOccurrences = [
  {
    id: 1,
    nome: 'Mariana Silva',
    situacao: 'Resolvido',
    statusClass: 'resolvido',
    tipo: 'Sinalização',
    detalhes: 'Necessária a poda de árvores...',
    userImg: avatarImg,
  },
  {
    id: 2,
    nome: 'Ricardo Pereira',
    situacao: 'Em Resolução',
    statusClass: 'em-resolucao',
    tipo: 'Buracos na Via',
    detalhes: 'Reparação urgente de buraco...',
    userImg: avatarImg,
  },
  {
    id: 3,
    nome: 'Beatriz Costa',
    situacao: 'À espera de equipa',
    statusClass: 'espera',
    tipo: 'Iluminação Pública',
    detalhes: 'Substituição de lâmpada...',
    userImg: avatarImg,
  },
]

function readStoredOccurrences() {
  if (typeof localStorage === 'undefined') return [...seedOccurrences]

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {
    // fall back to seed data
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedOccurrences))
  return [...seedOccurrences]
}

function saveOccurrences(occurrences) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(occurrences))
}

function addOccurrence(occurrence) {
  const occurrences = readStoredOccurrences()
  occurrences.unshift(occurrence)
  saveOccurrences(occurrences)
  return occurrences
}

export { STORAGE_KEY, seedOccurrences, readStoredOccurrences, saveOccurrences, addOccurrence, avatarImg as defaultOccurrenceAvatar }
