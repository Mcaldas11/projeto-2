from dataclasses import dataclass


@dataclass(slots=True)
class CidadaoSchema:
    nome: str
    email: str
    nrTelemovel: str
    freguesias: str | None = None


Cidadao = CidadaoSchema