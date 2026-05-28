import sinalizacaoIcon from '@/assets/sinalizacao.svg'
import iluminacaoIcon from '@/assets/iluminacao.svg'
import estradasIcon from '@/assets/estradas.svg'
import higieneIcon from '@/assets/higiene.svg'
import jardinsIcon from '@/assets/jardins.svg'

const OCCURRENCE_TYPE_META = {
  sinalizacao: { label: 'Sinalização', icon: sinalizacaoIcon, backgroundColor: '#D2E3ED' },
  iluminacao: { label: 'Iluminação Pública', icon: iluminacaoIcon, backgroundColor: '#FFB703' },
  estrada: { label: 'Estradas e passeios', icon: estradasIcon, backgroundColor: '#B80000' },
  higiene: { label: 'Higiene Pública', icon: higieneIcon, backgroundColor: '#BDB6A2' },
  jardins: { label: 'Áreas Verdes', icon: jardinsIcon, backgroundColor: '#10B210' },
}

const OCCURRENCE_STATUS_COLORS = {
  resolvido: '#16a34a',
  'em-resolucao': '#f59e0b',
  espera: '#ea580c',
  'nao-resolvido': '#dc2626',
}

function normalizeTypeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function getOccurrenceTypeMeta(typeValue) {
  const key = normalizeTypeKey(typeValue)

  if (key.includes('buraco') || key.includes('estrada') || key.includes('passeio')) {
    return OCCURRENCE_TYPE_META.estrada
  }

  if (key.includes('sinal') || key.includes('trafego') || key.includes('transito')) {
    return OCCURRENCE_TYPE_META.sinalizacao
  }

  if (key.includes('ilum') || key.includes('eletric') || key.includes('luz')) {
    return OCCURRENCE_TYPE_META.iluminacao
  }

  if (key.includes('higien') || key.includes('limpeza') || key.includes('esgoto') || key.includes('canal')) {
    return OCCURRENCE_TYPE_META.higiene
  }

  if (key.includes('jard') || key.includes('verde') || key.includes('parque')) {
    return OCCURRENCE_TYPE_META.jardins
  }

  return (
    OCCURRENCE_TYPE_META[key] || {
      label: typeValue || 'Ocorrência',
      icon: iluminacaoIcon,
      backgroundColor: '#f59e0b',
    }
  )
}

function getOccurrenceStatusColor(statusClass) {
  return OCCURRENCE_STATUS_COLORS[statusClass] || '#64748b'
}

export { OCCURRENCE_TYPE_META, OCCURRENCE_STATUS_COLORS, normalizeTypeKey, getOccurrenceTypeMeta, getOccurrenceStatusColor }
