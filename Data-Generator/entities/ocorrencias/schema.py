from dataclasses import dataclass


@dataclass(slots=True)
class OcorrenciaSchema:
    idOcorrencia: int | None = None
    foto: str | None = None
    descricao: str | None = None
    localizacao: str | None = None
    dataOcorrencia: str | None = None
    nomeAutor: str | None = None
    nrTelemovelAutor: str | None = None
    severidade: str | None = None
    estado: str = "À espera de equipa"
    idCidadao: int | None = None
    idMunicipio: int | None = None
    idEquipa: int | None = None
    dataAgendada: str | None = None
    feedback: str | None = None
    tipo_ocorrencia: str | None = None
    dataResolucao: str | None = None


Ocorrencia = OcorrenciaSchema
