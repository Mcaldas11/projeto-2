# python -m entities.cidadao.generator
import random
import json
from pathlib import Path
from dataclasses import asdict

from faker import Faker

from .schema import CidadaoSchema
from database.seeds.seed_freguesias import FREGUESIAS_VILA_DO_CONDE


fake = Faker("pt_PT")


def choose_freguesia_by_population(freguesias):
    # Escolhe uma freguesia com peso proporcional à população.
    if not freguesias:
        return None

    # Separamos nomes e populações para usar na escolha ponderada.
    nomes = [f["nome"] for f in freguesias]
    populacoes = [f["populacao"] for f in freguesias]
    return random.choices(nomes, weights=populacoes, k=1)[0]


def generate_fake_cidadao(freguesias=None):
    # Se não vier lista, usa a lista padrão do município carregada do seed.
    if freguesias is None:
        freguesias = FREGUESIAS_VILA_DO_CONDE

    # Gera o nome uma vez para reutilizar no email.
    nome_gerado = fake.name()

    return CidadaoSchema(
        # Monta um objeto simples com os dados gerados.
        nome=nome_gerado,
        email=f"{nome_gerado.replace(' ', '.').lower()}@example.pt",
        nrTelemovel=fake.random_element(["91", "92", "93"]) + fake.numerify("#######"),
        freguesias=choose_freguesia_by_population(freguesias),
    )


if __name__ == "__main__":
    # Execução direta só para ver rapidamente um exemplo no terminal.
    def generate_fake_cidadaos(count=40, freguesias=None):
        return [generate_fake_cidadao(freguesias) for _ in range(count)]

    cidadaos = generate_fake_cidadaos(40)
    for cidadao in cidadaos:
        print({
            "nome": cidadao.nome,
            "email": cidadao.email,
            "nrTelemovel": cidadao.nrTelemovel,
            "freguesias": cidadao.freguesias,
        })
    # Serializar a lista de dataclasses para dicionários e gravar em JSON.
    data = [asdict(c) for c in cidadaos]

    base = Path(__file__).resolve().parents[2]
    out = base / "data" / "cidadao.json"
    out.parent.mkdir(parents=True, exist_ok=True)

    with out.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)