from dataclasses import dataclass


@dataclass(slots=True)
class TrabalhadorSchema:
    idTrabalhador: int | None = None
    nomeTrabalhador: str = ""
    emailTrabalhador: str = ""
    telemovelTrabalhador: str | None = None
    idEquipa: int | None = None
    credenciaisTrabalhadores: str | None = None


Trabalhador = TrabalhadorSchema
