# python -m entities.trabalhador.generator
from dataclasses import asdict
import json
from pathlib import Path
import random

from faker import Faker

from database.seeds.seed_equipas import TIPOS_EQUIPA
from .schema import TrabalhadorSchema

fake = Faker("pt_PT")


def choose_equipa(equipas):
    # Escolhe uma equipa aleatoriamente a partir do seed.
    if not equipas:
        return None

    return random.choice(equipas)


def generate_fake_trabalhador(equipas=None):
    # Se não vier lista, usa as equipas definidas no seed.
    if equipas is None:
        equipas = TIPOS_EQUIPA

    equipa_escolhida = choose_equipa(equipas)

    id_equipa = None
    especializacao_equipa = None
    if equipa_escolhida:
        id_equipa = equipa_escolhida["idEquipa"]
        especializacao_equipa = equipa_escolhida["especializacao"]

    # Gera um trabalhador com os mesmos campos do cidadão.
    nome_gerado = fake.name()

    trabalhador = TrabalhadorSchema(
        nomeTrabalhador=nome_gerado,
        emailTrabalhador=f"{nome_gerado.replace(' ', '.').lower()}@example.pt",
        telemovelTrabalhador=fake.random_element(["91", "92", "93"]) + fake.numerify("#######"),
        idEquipa=id_equipa,
        credenciaisTrabalhadores=str(fake.random_int(min=0, max=99999)),
    )

    return trabalhador, especializacao_equipa


if __name__ == "__main__":
    def generate_fake_trabalhadores(count=40, equipas=None):
        return [generate_fake_trabalhador(equipas) for _ in range(count)]
    
    trabalhadores = generate_fake_trabalhadores(40)
    for trabalhador, especializacao_equipa in trabalhadores:
        print({
            "nomeTrabalhador": trabalhador.nomeTrabalhador,
            "emailTrabalhador": trabalhador.emailTrabalhador,
            "telemovelTrabalhador": trabalhador.telemovelTrabalhador,
            "idEquipa": trabalhador.idEquipa,
            "especializacao": especializacao_equipa,
            "credenciaisTrabalhadores": trabalhador.credenciaisTrabalhadores,
        })

    # 'trabalhadores' é uma lista de tuplas (trabalhador, especializacao).
    # O asdict() espera receber o dataclass; usar o primeiro elemento.
    data = [asdict(trabalhador) for trabalhador, _ in trabalhadores]

    base = Path(__file__).resolve().parents[2]
    out = base / "data" / "trabalhador.json"
    out.parent.mkdir(parents=True, exist_ok=True)

    with out.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)