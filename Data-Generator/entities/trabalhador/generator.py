# python -m entities.trabalhador.generator
from dataclasses import asdict
import json
import re
from pathlib import Path
import random
import unicodedata

from faker import Faker

from database.seeds.seed_freguesias import FREGUESIAS_VILA_DO_CONDE
from database.seeds.seed_equipas import TIPOS_EQUIPA
from .schema import TrabalhadorSchema

fake = Faker("pt_PT")


def slugify_email(value):
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_value = ascii_value.lower()
    ascii_value = re.sub(r"[^a-z0-9]+", ".", ascii_value).strip(".")
    return ascii_value or "utilizador"


def build_email(prefix, *parts):
    email_parts = [slugify_email(prefix)]
    email_parts.extend(slugify_email(str(part)) for part in parts if part is not None)
    return ".".join(email_parts) + "@example.pt"


def generate_fake_trabalhador(equipa_escolhida=None, trabalhador_index=1):

    id_equipa = None
    especializacao_equipa = None
    if equipa_escolhida:
        id_equipa = equipa_escolhida["idEquipa"]
        especializacao_equipa = equipa_escolhida["especializacao"]

    # Gera um trabalhador com os mesmos campos do cidadão.
    nome_gerado = fake.name()
    email_gerado = build_email(nome_gerado, id_equipa, trabalhador_index)

    trabalhador = TrabalhadorSchema(
        nomeTrabalhador=nome_gerado,
        emailTrabalhador=email_gerado,
        telemovelTrabalhador=fake.random_element(["91", "92", "93"]) + fake.numerify("#######"),
        idEquipa=id_equipa,
        credenciaisTrabalhadores=str(fake.random_int(min=0, max=99999)),
    )

    return trabalhador, especializacao_equipa


def generate_fake_trabalhadores_por_equipa(equipas=None, trabalhadores_por_equipa=3):
    if equipas is None:
        equipas = TIPOS_EQUIPA

    trabalhadores = []
    for equipa in equipas:
        for indice_trabalhador in range(1, trabalhadores_por_equipa + 1):
            trabalhadores.append(
                generate_fake_trabalhador(equipa, indice_trabalhador),
            )

    return trabalhadores


def generate_responsaveis_freguesia(freguesias=None):
    if freguesias is None:
        freguesias = FREGUESIAS_VILA_DO_CONDE

    responsaveis = []
    for index, freguesia in enumerate(freguesias, start=1):
        nome_responsavel = fake.name()
        responsaveis.append(
            {
                "nome": freguesia["nome"],
                "responsavel": nome_responsavel,
                "email": build_email("responsavel", index),
                "telemovel": fake.random_element(["91", "92", "93"]) + fake.numerify("#######"),
            },
        )

    return responsaveis


def generate_admin_geral():
    nome_admin = "Admin Geral"
    return {
        "nome": nome_admin,
        "email": build_email("admin", "geral"),
        "telemovel": fake.random_element(["91", "92", "93"]) + fake.numerify("#######"),
        "credenciaisTrabalhadores": str(fake.random_int(min=0, max=99999)),
    }


if __name__ == "__main__":
    trabalhadores = generate_fake_trabalhadores_por_equipa()
    for trabalhador, especializacao_equipa in trabalhadores:
        print({
            "nomeTrabalhador": trabalhador.nomeTrabalhador,
            "emailTrabalhador": trabalhador.emailTrabalhador,
            "telemovelTrabalhador": trabalhador.telemovelTrabalhador,
            "idEquipa": trabalhador.idEquipa,
            "especializacao": especializacao_equipa,
            "credenciaisTrabalhadores": trabalhador.credenciaisTrabalhadores,
        })

    data = [asdict(trabalhador) for trabalhador, _ in trabalhadores]
    responsaveis = generate_responsaveis_freguesia()
    admin_geral = generate_admin_geral()

    base = Path(__file__).resolve().parents[2]
    data_dir = base / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    with (data_dir / "trabalhador.json").open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    with (data_dir / "municipio.json").open("w", encoding="utf-8") as f:
        json.dump(responsaveis, f, ensure_ascii=False, indent=2)

    with (data_dir / "admin.json").open("w", encoding="utf-8") as f:
        json.dump(admin_geral, f, ensure_ascii=False, indent=2)

    print(f"Generated {len(data)} trabalhadores, {len(responsaveis)} responsaveis and 1 admin.")