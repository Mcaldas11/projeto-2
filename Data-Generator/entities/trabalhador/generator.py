from faker import Faker

from .schema import TrabalhadorSchema


fake = Faker("pt_PT")


def generate_fake_trabalhador(id_trabalhador=None, id_equipa=None):
    # Gera um trabalhador com os mesmos campos do cidadão
    nome_gerado = fake.name()

    return TrabalhadorSchema(
        idTrabalhador=id_trabalhador,
        nomeTrabalhador=nome_gerado,
        emailTrabalhador=f"{nome_gerado.replace(' ', '.').lower()}@example.pt",
        telemovelTrabalhador=fake.random_element(["91", "92", "93"]) + fake.numerify("#######"),
        idEquipa=id_equipa,
        credenciaisTrabalhadores=str(fake.random_int(min=0, max=99999)),
    )


if __name__ == "__main__":
    trabalhador = generate_fake_trabalhador(id_trabalhador=1, id_equipa=1)
    print({
        "idTrabalhador": trabalhador.idTrabalhador,
        "nomeTrabalhador": trabalhador.nomeTrabalhador,
        "emailTrabalhador": trabalhador.emailTrabalhador,
        "telemovelTrabalhador": trabalhador.telemovelTrabalhador,
        "idEquipa": trabalhador.idEquipa,
        "credenciaisTrabalhadores": trabalhador.credenciaisTrabalhadores,
    })