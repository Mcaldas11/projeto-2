# python -m entities.trabalhador.generator
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
    trabalhador, especializacao_equipa = generate_fake_trabalhador()
    print({
        "nomeTrabalhador": trabalhador.nomeTrabalhador,
        "emailTrabalhador": trabalhador.emailTrabalhador,
        "telemovelTrabalhador": trabalhador.telemovelTrabalhador,
        "idEquipa": trabalhador.idEquipa,
        "especializacao": especializacao_equipa,
        "credenciaisTrabalhadores": trabalhador.credenciaisTrabalhadores,
    })