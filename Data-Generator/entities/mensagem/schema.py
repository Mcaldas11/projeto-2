
from dataclasses import dataclass


@dataclass(slots=True)
class MensagemSchema:
	idMensagem: int | None = None
	texto: str = ""
	dataMensagem: str | None = None
	classificacao: int | None = None
	idCidadao: int | None = None
	idOcorrencia: int | None = None


Mensagem = MensagemSchema

