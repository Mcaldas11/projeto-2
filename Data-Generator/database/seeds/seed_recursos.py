from database.seeds.seed_equipas import TIPOS_EQUIPA
from database.seeds.seed_freguesias import FREGUESIAS_VILA_DO_CONDE


RECURSOS_POR_ESPECIALIZACAO = {
	"Estradas e passeios": [
		{
			"tipo": "Mini retroescavadora",
			"estado": "Operacional",
			"especificacoes": "Escavações ligeiras, reposição de pavimento e remoção de entulho.",
		},
		{
			"tipo": "Placa vibratória",
			"estado": "Operacional",
			"especificacoes": "Compactação de solos e reparações rápidas em passeios e calçadas.",
		},
	],
	"Sinalizacao de transito": [
		{
			"tipo": "Carrinha de sinalização",
			"estado": "Operacional",
			"especificacoes": "Transporte de cones, painéis de aviso e material de sinalização temporária.",
		},
		{
			"tipo": "Kit de sinalização móvel",
			"estado": "Operacional",
			"especificacoes": "Cones, barreiras e placas portáteis para cortes e desvios de trânsito.",
		},
	],
	"Iluminacao urbana": [
		{
			"tipo": "Plataforma elevatória",
			"estado": "Operacional",
			"especificacoes": "Acesso em altura para substituição e reparação de luminárias.",
		},
		{
			"tipo": "Gerador portátil",
			"estado": "Operacional",
			"especificacoes": "Alimentação de emergência para intervenções em zonas sem energia.",
		},
	],
}


def _freguesia_nome(id_freguesia):
	index = id_freguesia - 1
	if 0 <= index < len(FREGUESIAS_VILA_DO_CONDE):
		return FREGUESIAS_VILA_DO_CONDE[index]["nome"]
	return f"Freguesia {id_freguesia}"


def build_recursos_por_equipa(tipos_equipa=None):
	if tipos_equipa is None:
		tipos_equipa = TIPOS_EQUIPA

	recursos = []
	next_id = 1

	for equipa in tipos_equipa:
		especializacao = equipa["especializacao"]
		templates = RECURSOS_POR_ESPECIALIZACAO.get(especializacao, [])
		localizacao = _freguesia_nome(equipa["fregEquipa"])

		for template in templates[:2]:
			recursos.append(
				{
					"idRecurso": next_id,
					"tipo": template["tipo"],
					"estado": template["estado"],
					"especificacoes": template["especificacoes"],
					"localizacao": localizacao,
					"equipaResponsavel": equipa["idEquipa"],
					"especializacao": especializacao,
				},
			)
			next_id += 1

	return recursos


RECURSOS = build_recursos_por_equipa()


if __name__ == "__main__":
	print(f"Generated {len(RECURSOS)} recursos")
