# python -m entities.trabalhador.generator
from dataclasses import asdict
import json
from pathlib import Path
import random

from faker import Faker

from database.seeds.seed_equipas import TIPOS_EQUIPA
from .schema import TrabalhadorSchema

fake = Faker("pt_PT")


def build_equipa_pool(equipas):
    equipa_pool = []
    for equipa in equipas:
        max_trabalhadores = equipa.get("max_trabalhadores", 5)
        equipa_pool.extend([equipa] * max_trabalhadores)

    random.shuffle(equipa_pool)
    return equipa_pool


def generate_fake_trabalhador(equipa_escolhida=None):

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
    def generate_fake_trabalhadores(equipas=None):
        # Cada equipa recebe no máximo o número definido em max_trabalhadores.
        if equipas is None:
            equipas = TIPOS_EQUIPA

        equipa_pool = build_equipa_pool(equipas)
        return [generate_fake_trabalhador(equipa_pool[i]) for i in range(len(equipa_pool))]
    
    trabalhadores = generate_fake_trabalhadores()
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