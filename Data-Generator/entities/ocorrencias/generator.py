# python -m entities.ocorrencias.generator
import random
from datetime import datetime, timedelta

from faker import Faker

from .schema import OcorrenciaSchema
from database.seeds.seed_tipos_ocorrencia import TIPOS_OCORRENCIA
from database.seeds.seed_freguesias import FREGUESIAS_VILA_DO_CONDE

fake = Faker("pt_PT")
POSSIVEIS_ESTADOS = [
    "À espera de equipa",
    "Em resolução",
    "Resolvido",
    "Não resolvido",
]

def choose_tipo_ocorrencia(tipos_ocorrencia):
    # Escolhe um tipo de ocorrência aleatoriamente.
    if not tipos_ocorrencia:
        return None

    return random.choice(tipos_ocorrencia)


def choose_freguesia_vila_do_conde(freguesias):
    # Escolhe uma freguesia aleatoriamente.
    if not freguesias:
        return None

    return random.choice(freguesias)


def generate_fake_ocorrencia():
    # Escolhe um tipo de ocorrência aleatório.
    tipo_escolhido = choose_tipo_ocorrencia(TIPOS_OCORRENCIA)

    tipo_ocorrencia = None
    descricao = None
    severidade = None
    if tipo_escolhido:
        tipo_ocorrencia = tipo_escolhido["tipo"]
        desc_item = random.choice(tipo_escolhido["descricoes"])
        if isinstance(desc_item, dict):
            descricao = desc_item.get("texto")
            severidade = desc_item.get("severidade")
        else:
            descricao = desc_item
            severidade = None

    # Gera uma data no passado (até 60 dias atrás).
    dias_passado = random.randint(1, 60)
    data_ocorrencia = datetime.now() - timedelta(days=dias_passado)
    data_ocorrencia_str = data_ocorrencia.strftime("%Y-%m-%d %H:%M:%S")

    # Localização em Vila do Conde.
    freguesia_escolhida = choose_freguesia_vila_do_conde(FREGUESIAS_VILA_DO_CONDE)
    nome_rua = fake.street_name()
    numero_rua = fake.building_number()
    codigo_postal = f"{random.randint(4480, 4490)}-{random.randint(100, 999)}"
    localizacao = f"{nome_rua}, {numero_rua}, {codigo_postal} {freguesia_escolhida['nome']}"

    # Escolhe um estado válido a partir da lista do modelo.
    estado = random.choice(POSSIVEIS_ESTADOS)

    return OcorrenciaSchema(
        descricao=descricao,
        localizacao=localizacao,
        dataOcorrencia=data_ocorrencia_str,
        tipo_ocorrencia=tipo_ocorrencia,
        severidade=severidade,
        estado=estado,
    )


if __name__ == "__main__":
    ocorrencia = generate_fake_ocorrencia()
    print({
        "descricao": ocorrencia.descricao,
        "localizacao": ocorrencia.localizacao,
        "dataOcorrencia": ocorrencia.dataOcorrencia,
        "tipo_ocorrencia": ocorrencia.tipo_ocorrencia,
        "severidade": ocorrencia.severidade,
        "estado": ocorrencia.estado,
    })
