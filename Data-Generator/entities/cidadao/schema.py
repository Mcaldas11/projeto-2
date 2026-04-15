from dataclasses import dataclass

@dataclass
class CidadaoSchema:
    nome: str              # Obrigatório (String)
    email: str             # Obrigatório (String)
    nrTelemovel: str | None = None  # Pode ser String OU None
    munCidadao: int | None = None   # Pode ser Inteiro OU None