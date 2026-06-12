import avatarImg from '@/assets/avatar.png'
import { normalizeTypeKey } from '@/utils/occurrenceTypes'
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
  resolvida: 'resolvido',
  emresolucao: 'em-resolucao',
  espera: 'espera',
  aesperadaequipa: 'espera',
  aesperadeequipa: 'espera',
  naoresolvido: 'nao-resolvido',
  naoresolvida: 'nao-resolvido',
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
  const statusClass =
    occurrence.statusClass || getStatusClassFromState(occurrence.estado || occurrence.situacao)

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
    mensagens: occurrence.mensagens || [],
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

  const { latitudeOffset, longitudeOffset } = hashToOffset(
    occurrence.location || occurrence.detalhes || occurrence.id,
  )

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

function readStoredOccurrences() {
  return []
}

function saveOccurrences(occurrences) {
  return occurrences
}

function addOccurrence(occurrence) {
  return [normalizeOccurrence(occurrence)]
}

function getOccurrenceById(occurrenceId) {
  return null
}

function getOccurrenceMarkers() {
  return []
}

export {
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
