from dataclasses import dataclass


@dataclass(slots=True)
class TrabalhadorSchema:
    nomeTrabalhador: str = ""
    emailTrabalhador: str = ""
    telemovelTrabalhador: str | None = None
    idEquipa: int | None = None
    credenciaisTrabalhadores: str | None = None


Trabalhador = TrabalhadorSchema
