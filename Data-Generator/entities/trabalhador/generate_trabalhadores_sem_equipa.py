#!/usr/bin/env python3
from pathlib import Path
import sys
import json

# Adiciona o diretório Data-Generator ao caminho para importar o package `entities`
base = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(base))

from entities.trabalhador import generator
from dataclasses import asdict


def main(count=5, out_name="trabalhador_sem_equipa.json"):
    trabs = generator.generate_fake_trabalhadores_sem_equipa(count)
    data = [asdict(t) for t in trabs]
    out_dir = base / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / out_name
    with out_file.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"Wrote {len(data)} trabalhadores to {out_file}")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Generate trabalhadores without team JSON file")
    p.add_argument("-n", "--count", type=int, default=5, help="Número de trabalhadores a gerar")
    p.add_argument("-o", "--out", default="trabalhador_sem_equipa.json", help="Nome do ficheiro de saída dentro de Data-Generator/data")
    args = p.parse_args()
    main(args.count, args.out)
