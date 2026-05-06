# python -m entities.cidadao.generator
import random

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
    cidadao = generate_fake_cidadao()
    print({
        "nome": cidadao.nome,
        "email": cidadao.email,
        "nrTelemovel": cidadao.nrTelemovel,
        "freguesias": cidadao.freguesias,
    })