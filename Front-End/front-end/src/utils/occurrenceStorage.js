import avatarImg from '@/assets/avatar.png'
import { normalizeTypeKey } from '@/utils/occurrenceTypes'

const STORAGE_KEY = 'vc-comunica-occurrences'
const DEFAULT_MAP_COORDS = {
  latitude: 41.36405,
  longitude: -8.73894,
}

const TYPE_COORDS = {
  sinalizacao: { latitude: 41.3662, longitude: -8.7441 },
  iluminacao: { latitude: 41.3649, longitude: -8.7388 },
  estrada: { latitude: 41.3608, longitude: -8.7344 },
  higiene: { latitude: 41.3624, longitude: -8.7422 },
}

function toSlug(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function hashToOffset(value) {
  const text = String(value || '')
  let hash = 0

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index)
    hash |= 0
  }

  return {
    latitudeOffset: ((hash % 700) - 350) / 100000,
    longitudeOffset: (((hash >> 8) % 700) - 350) / 100000,
  }
}

function resolveOccurrenceCoordinates(occurrence = {}) {
  if (occurrence.latitude != null && occurrence.longitude != null) {
    return {
      latitude: Number(occurrence.latitude),
      longitude: Number(occurrence.longitude),
    }
  }

  const typeCoords = TYPE_COORDS[toSlug(occurrence.tipo)]
  if (typeCoords) {
    return typeCoords
  }

  const { latitudeOffset, longitudeOffset } = hashToOffset(occurrence.location || occurrence.detalhes || occurrence.id)

  return {
    latitude: DEFAULT_MAP_COORDS.latitude + latitudeOffset,
    longitude: DEFAULT_MAP_COORDS.longitude + longitudeOffset,
  }
}

function normalizeOccurrence(occurrence, index = 0) {
  const coordinates = resolveOccurrenceCoordinates(occurrence)
  const typeKey = occurrence.typeKey || normalizeTypeKey(occurrence.tipo)

  return {
    statusClass: 'em-resolucao',
    location: '',
    typeKey,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    image: null,
    ...occurrence,
    id: occurrence.id ?? Date.now() + index,
    userImg: occurrence.userImg || avatarImg,
    ...coordinates,
  }
}

const seedOccurrences = [
  {
    id: 1,
    nome: 'Mariana Silva',
    situacao: 'Resolvido',
    statusClass: 'resolvido',
    tipo: 'Sinalização',
    detalhes: 'Necessária a poda de árvores...',
    location: 'Rua Dom Sancho I, Vila do Conde',
    userImg: avatarImg,
    latitude: 41.3662,
    longitude: -8.7441,
  },
  {
    id: 2,
    nome: 'Ricardo Pereira',
    situacao: 'Em Resolução',
    statusClass: 'em-resolucao',
    tipo: 'Buracos na Via',
    detalhes: 'Reparação urgente de buraco...',
    location: 'Avenida Júlio Graça, Vila do Conde',
    userImg: avatarImg,
    latitude: 41.3608,
    longitude: -8.7344,
  },
  {
    id: 3,
    nome: 'Beatriz Costa',
    situacao: 'À espera de equipa',
    statusClass: 'espera',
    tipo: 'Iluminação Pública',
    detalhes: 'Substituição de lâmpada...',
    location: 'Parque João Paulo II, Vila do Conde',
    userImg: avatarImg,
    latitude: 41.3649,
    longitude: -8.7388,
  },
]

function readStoredOccurrences() {
  if (typeof localStorage === 'undefined') return [...seedOccurrences]

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (Array.isArray(parsed) && parsed.length > 0) {
      const normalized = parsed.map((occurrence, index) => normalizeOccurrence(occurrence, index))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      return normalized
    }
  } catch {
    // fall back to seed data
  }

  const normalizedSeeds = seedOccurrences.map((occurrence, index) => normalizeOccurrence(occurrence, index))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedSeeds))
  return [...normalizedSeeds]
}

function saveOccurrences(occurrences) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(occurrences))
}

function addOccurrence(occurrence) {
  const occurrences = readStoredOccurrences()
  occurrences.unshift(normalizeOccurrence(occurrence))
  saveOccurrences(occurrences)
  return occurrences
}

function getOccurrenceById(occurrenceId) {
  return readStoredOccurrences().find((occurrence) => String(occurrence.id) === String(occurrenceId)) || null
}

function getOccurrenceMarkers() {
  return readStoredOccurrences().map((occurrence) => ({
    ...occurrence,
    ...resolveOccurrenceCoordinates(occurrence),
  }))
}

export {
  STORAGE_KEY,
  seedOccurrences,
  readStoredOccurrences,
  saveOccurrences,
  addOccurrence,
  getOccurrenceById,
  getOccurrenceMarkers,
  normalizeOccurrence,
  resolveOccurrenceCoordinates,
  avatarImg as defaultOccurrenceAvatar,
  DEFAULT_MAP_COORDS,
}
