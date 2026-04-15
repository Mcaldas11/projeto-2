from faker import Faker
from .schema import CidadaoSchema

fake = Faker('pt_PT')

def generate_fake_cidadao(municipio_id=None):
    """
    Gera um objeto CidadaoSchema com dados fictícios.
    :param municipio_id: ID opcional de um município já existente no MySQL
    """
    nome_gerado = fake.name()
    return CidadaoSchema(
        nome=nome_gerado,
        email=f"{nome_gerado.replace(' ', '.').lower()}@example.pt",
        nrTelemovel=fake.random_element(["91", "92", "93"]) + fake.numerify("#######"),
        munCidadao=municipio_id
    )

# Exemplo de uso para teste:
if __name__ == "__main__":
    novo_cidadao = generate_fake_cidadao()
    print(novo_cidadao)