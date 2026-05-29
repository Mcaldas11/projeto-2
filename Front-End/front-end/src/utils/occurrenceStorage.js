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

const STATUS_CLASS_BY_STATE = {
  resolvido: 'resolvido',
  'em resolucao': 'em-resolucao',
  'em resolução': 'em-resolucao',
  espera: 'espera',
  'a espera da equipa': 'espera',
  'à espera da equipa': 'espera',
  'nao resolvido': 'nao-resolvido',
  'não resolvido': 'nao-resolvido',
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

function extractPhotoUrls(photoValue) {
  if (!photoValue) return []

  const entries = Array.isArray(photoValue)
    ? photoValue
    : typeof photoValue === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(photoValue)
            return Array.isArray(parsed) ? parsed : [photoValue]
          } catch {
            return [photoValue]
          }
        })()
      : []

  return entries
    .map((entry) => {
      if (!entry) return null
      if (typeof entry === 'string') return entry
      if (typeof entry === 'object') return entry.url || entry.secure_url || null
      return null
    })
    .filter(Boolean)
}

function getStatusClassFromState(stateValue, fallback = 'em-resolucao') {
  const normalizedState = normalizeTypeKey(stateValue)
  return STATUS_CLASS_BY_STATE[normalizedState] || fallback
}

function backendOccurrenceToUi(occurrence = {}) {
  const fotos = extractPhotoUrls(occurrence.foto || occurrence.fotos)
  const typeLabel = occurrence.tipo_ocorrencia || occurrence.tipo || ''
  const statusClass = occurrence.statusClass || getStatusClassFromState(occurrence.estado || occurrence.situacao)

  return {
    id: occurrence.idOcorrencia ?? occurrence.id ?? Date.now(),
    nome: occurrence.nomeAutor || occurrence.nome || 'Ocorrência',
    situacao: occurrence.estado || occurrence.situacao || 'Desconhecido',
    statusClass,
    tipo: typeLabel,
    detalhes: occurrence.descricao || occurrence.detalhes || '',
    location: occurrence.localizacao || occurrence.location || '',
    image: occurrence.image || fotos[0] || null,
    photos: fotos,
    typeKey: occurrence.typeKey || normalizeTypeKey(typeLabel),
    latitude: occurrence.latitude != null ? Number(occurrence.latitude) : null,
    longitude: occurrence.longitude != null ? Number(occurrence.longitude) : null,
    dataOcorrencia: occurrence.dataOcorrencia || null,
    dataAgendada: occurrence.dataAgendada || null,
    dataResolucao: occurrence.dataResolucao || null,
    feedback: occurrence.feedback || '',
    idCidadao: occurrence.idCidadao ?? null,
    idEquipa: occurrence.idEquipa ?? null,
    idFreguesia: occurrence.idFreguesia ?? null,
    severidade: occurrence.severidade || '',
    foto: occurrence.foto || fotos,
    userImg: occurrence.userImg || avatarImg,
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
  const normalizedOccurrence = backendOccurrenceToUi(occurrence)
  const coordinates = resolveOccurrenceCoordinates(normalizedOccurrence)
  const typeKey = normalizedOccurrence.typeKey || normalizeTypeKey(normalizedOccurrence.tipo)

  return {
    ...normalizedOccurrence,
    statusClass: normalizedOccurrence.statusClass || 'em-resolucao',
    location: normalizedOccurrence.location || '',
    typeKey,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    id: normalizedOccurrence.id ?? Date.now() + index,
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
  backendOccurrenceToUi,
  extractPhotoUrls,
  getStatusClassFromState,
  avatarImg as defaultOccurrenceAvatar,
  DEFAULT_MAP_COORDS,
}
