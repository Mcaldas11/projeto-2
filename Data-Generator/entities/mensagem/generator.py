# python -m entities.mensagem.generator
from dataclasses import asdict
import json
import random
from pathlib import Path
from datetime import datetime, timedelta

from faker import Faker

from .schema import MensagemSchema
from ..ocorrencias.generator import generate_fake_ocorrencia
from database.seeds.seed_tipos_ocorrencia import TIPOS_OCORRENCIA

fake = Faker("pt_PT")


def _load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _ensure_ids(items, id_key, start=1):
    next_id = start
    for item in items:
        if id_key not in item or item[id_key] is None:
            item[id_key] = next_id
            next_id += 1
        else:
            next_id = max(next_id, int(item[id_key]) + 1)
    return items


def _valid_date_or_generate(date_str):
    # Ensure date is not in future and within 60 days; otherwise generate a valid one
    try:
        dt = datetime.fromisoformat(date_str)
    except Exception:
        return (datetime.now() - timedelta(days=random.randint(1, 60))).strftime("%Y-%m-%d %H:%M:%S")

    now = datetime.now()
    if dt > now or (now - dt).days > 60:
        return (now - timedelta(days=random.randint(1, 60))).strftime("%Y-%m-%d %H:%M:%S")

    return dt.strftime("%Y-%m-%d %H:%M:%S")


def _build_avaliacoes_from_seed():
    avaliacoes = []

    for tipo_item in TIPOS_OCORRENCIA:
        tipo = tipo_item.get("tipo")
        descricoes = tipo_item.get("descricoes", [])

        for desc in descricoes:
            if isinstance(desc, dict):
                texto_ocorrencia = desc.get("texto", "")
                severidade = desc.get("severidade", "")
            else:
                texto_ocorrencia = str(desc)
                severidade = ""

            base = [
                f"{texto_ocorrencia} - resolução rápida e eficaz.",
                f"{texto_ocorrencia} - ainda sem resolução, infelizmente.",
                f"{texto_ocorrencia} - intervenção feita com acompanhamento.",
            ]

            if severidade:
                base.append(f"{texto_ocorrencia} ({severidade}) - avaliação positiva.")

            for mensagem in base:
                avaliacoes.append({
                    "tipo": tipo,
                    "texto": mensagem,
                })

    return avaliacoes


def generate_fake_mensagens(count=15, cidadao_path=None, ocorrencias_path=None):
    base = Path(__file__).resolve().parents[2]
    cid_path = cidadao_path or (base / "data" / "cidadao.json")
    oc_path = ocorrencias_path or (base / "data" / "ocorrencias.json")

    cidadaos = _load_json(cid_path)
    ocorrencias = _load_json(oc_path)

    # If there are no ocorrencias, generate some
    if not ocorrencias:
        # create a few ocorrencias
        for _ in range(max(10, count)):
            oc = generate_fake_ocorrencia()
            ocorrencias.append(asdict(oc))

    # Ensure IDs are present
    cidadaos = _ensure_ids(cidadaos, "idCidadao", start=1)
    ocorrencias = _ensure_ids(ocorrencias, "idOcorrencia", start=1)

    avaliacoes = _build_avaliacoes_from_seed()

    mensagens = []
    used_texts = set()

    # Pair each mensagem with an ocorrência and a citizen, without repeating texts.
    occ_list = ocorrencias.copy()
    random.shuffle(occ_list)

    for i, oc in enumerate(occ_list[:count]):
        avaliacao_item = avaliacoes[i % len(avaliacoes)] if avaliacoes else None
        texto = avaliacao_item["texto"] if avaliacao_item else fake.sentence(nb_words=8)

        if texto in used_texts:
            # fallback unique text derived from occurrence
            texto = f"{oc.get('tipo_ocorrencia') or oc.get('tipo') or 'Ocorrência'}: {oc.get('descricao') or 'situação analisada'} - acompanhamento em curso."

        used_texts.add(texto)

        # Data da mensagem igual à da ocorrência; se inválida, normaliza para <= 60 dias e nunca futuro.
        data_msg = _valid_date_or_generate(oc.get("dataOcorrencia") or oc.get("dataOcorrencia_str") or "")

        classificacao = random.choices([1, 2, 3, 4, 5], weights=[10, 15, 25, 30, 20])[0]
        cid = random.choice(cidadaos).get("idCidadao")

        mensagens.append(
            MensagemSchema(
                idMensagem=None,
                texto=texto,
                dataMensagem=data_msg,
                classificacao=classificacao,
                idCidadao=cid,
                idOcorrencia=oc.get("idOcorrencia"),
            )
        )

    return mensagens


if __name__ == "__main__":
    msgs = generate_fake_mensagens(15)
    base = Path(__file__).resolve().parents[2]
    out = base / "data" / "mensagens.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as f:
        json.dump([asdict(m) for m in msgs], f, ensure_ascii=False, indent=2)
    print(f"Generated {len(msgs)} mensagens -> {out}")
