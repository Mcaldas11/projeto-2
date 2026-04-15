from dataclasses import dataclass

@dataclass
class TrabalhadorSchema:
    nome: str
    email: str
    municipio_id: int