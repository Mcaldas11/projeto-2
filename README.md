# projeto-2

![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Faker pt_PT](https://img.shields.io/badge/Faker-pt_PT-0A84FF?style=for-the-badge)
![Node.js 18+](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express 5](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![Sequelize 6](https://img.shields.io/badge/Sequelize-6-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)
![MySQL 8](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue-3-42B883?style=for-the-badge&logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

## Links rapidos

- Front-End: Front-End/front-end
- Back-End: Back-End
- Gerador de Dados: Data-Generator

## Sobre o projeto

Plataforma municipal para reporte e gestao de ocorrencias. Os cidadaos submetem problemas com fotos e acompanham o estado. As equipas tecnicas e administradores resolvem ocorrencias, gerem recursos e mantem a informacao centralizada sobre municipios, equipas, trabalhadores e mensagens.

## Objetivos

- Simplificar o reporte de problemas no espaco publico.
- Dar visibilidade ao estado das ocorrencias.
- Apoiar a operacao das equipas tecnicas.
- Reunir dados para analise e melhoria continua.

## Funcionalidades principais

- Registo e autenticacao de perfis (cidadao e trabalhador).
- Criacao e gestao de ocorrencias com fotos.
- Atualizacao de estados e feedback de resolucao.
- Gestao de equipas, recursos e mensagens.

## Arquitetura geral

```mermaid
flowchart LR
	FE[Front-End Web] -->|HTTP REST| BE[Back-End API]
	BE --> DB[(MySQL)]
	BE --> CLD[(Cloudinary)]
```

## Arquitetura da base de dados (MySQL)

### Entidades principais

- Municipio: freguesia e dados do responsavel.
- Cidadao: dados de utilizador e freguesia associada.
- Equipa: especializacao e freguesia associada.
- Trabalhador: dados do trabalhador e relacao com equipa e freguesia.
- Recurso: meios e estado associados a uma equipa.
- Ocorrencia: descricao, localizacao, estado, fotos e relacoes principais.
- Mensagem: comunicacao ligada a cidadao e ocorrencia.

### Relacoes

- Municipio 1..N Cidadao (fregCidadao)
- Municipio 1..N Equipa (fregEquipa)
- Municipio 1..N Trabalhador (idFreguesia)
- Municipio 1..N Ocorrencia (idFreguesia)
- Equipa 1..N Trabalhador (idEquipa)
- Equipa 1..N Recurso (equipaResponsavel)
- Equipa 1..N Ocorrencia (idEquipa)
- Cidadao 1..N Ocorrencia (idCidadao)
- Cidadao 1..N Mensagem (idCidadao)
- Ocorrencia 1..N Mensagem (idOcorrencia)

```mermaid
erDiagram
	MUNICIPIO ||--o{ CIDADAO : fregCidadao
	MUNICIPIO ||--o{ EQUIPA : fregEquipa
	MUNICIPIO ||--o{ TRABALHADOR : idFreguesia
	MUNICIPIO ||--o{ OCORRENCIA : idFreguesia
	EQUIPA ||--o{ TRABALHADOR : idEquipa
	EQUIPA ||--o{ RECURSO : equipaResponsavel
	EQUIPA ||--o{ OCORRENCIA : idEquipa
	CIDADAO ||--o{ OCORRENCIA : idCidadao
	CIDADAO ||--o{ MENSAGEM : idCidadao
	OCORRENCIA ||--o{ MENSAGEM : idOcorrencia
```

## Componentes do projeto

### Back-End

- API REST com autenticacao por token.
- Gestao de ocorrencias, fotos, estados, equipas, recursos e mensagens.
- Integracao com Cloudinary para armazenamento de imagens.
- Persistencia em MySQL com Sequelize.

### Front-End

- Interface web para cidadaos, trabalhadores e administradores.
- Fluxo de criacao, consulta e detalhe de ocorrencias.
- Galeria de fotos por ocorrencia.
- Vistas dedicadas por perfil.

### Geracao de dados

- Scripts Python para gerar dados sinteticos realistas.
- Seeds para freguesias, tipos de ocorrencia e equipas.
- Exportacao para JSON em Data-Generator/data.
- Suporte para popular a base de dados em desenvolvimento.

## Stack tecnologica

| Camada | Tecnologias |
| --- | --- |
| Back-End | Node.js, Express, Sequelize, MySQL, JWT, Cloudinary |
| Front-End | Vue 3, Vite, Vue Router, Pinia |
| Geracao de dados | Python, Faker |

## Estrutura do repositorio

- Back-End: API, modelos e configuracoes.
- Front-End/front-end: aplicacao web.
- Data-Generator: geracao e seeds de dados.

## Configuracao e execucao

### Requisitos

- Node.js 18+
- MySQL 8+
- Python 3.10+

### Back-End

1) Criar .env em Back-End/:

```
DB_NAME=projeto2
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql
HOST=127.0.0.1
PORT=3000
DB_SYNC=false
DB_SYNC_FORCE=false

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

2) Instalar e arrancar:

```
cd Back-End
npm install
npm run dev
```

### Front-End

1) (Opcional) Criar Front-End/front-end/.env:

```
VITE_API_URL=http://127.0.0.1:3000
```

2) Instalar e arrancar:

```
cd Front-End/front-end
npm install
npm run dev
```

### Geracao de dados

1) Instalar dependencias Python:

```
pip install Faker
```

2) Executar scripts de geracao (exemplos):

- Data-Generator/entities/cidadao/generator.py
- Data-Generator/entities/ocorrencias/generator.py
- Data-Generator/entities/trabalhador/generator.py

3) Seeds auxiliares:

- Data-Generator/database/seeds/seed_freguesias.py
- Data-Generator/database/seeds/seed_tipos_ocorrencia.py
- Data-Generator/database/seeds/seed_equipas.py

## Documentacao da API

A lista completa de rotas e exemplos de resposta esta em Back-End/README.md.

## Equipa

| Nome | Email |
| --- | --- |
| Miguel Caldas | 40240221@esmad.ipp.pt |
| Mariana Ferreira | 40240450@esmad.ipp.pt |
| Pedro Rodrigues | 40240239@esmad.ipp.pt |

## Contexto academico

Projeto interdisciplinar no ambito da:

Licenciatura em Tecnologias e Sistemas de Informacao para a Web
Escola Superior de Media Artes e Design (ESMAD)
Politecnico do Porto

Unidades curriculares envolvidas:

| Unidade curricular | Enfoque |
| --- | --- |
| Engenharia de Software | Arquitetura, modelacao e boas praticas |
| Base de Dados | Modelacao relacional e persistencia |
| Programacao Web II | Back-end e integracao API |
| Projeto II | Gestao do projeto e documentacao |
| Testes e Performance Web | Testes funcionais e desempenho |

Docentes:

- Prof. Doutor Lino Rui dos Santos Oliveira
- Prof. Manuel Jorge de Abreu Antunes Lima
- Prof. Diogo Filipe de Bastos Sousa Ribeiro
- Profa. Ines Sofia Antunes Moura Reis
- Profa. Viviana da Costa Neto Henriques
- Profa. Doutora Teresa Cristina de Sousa Azevedo Terroso
- Prof. Antonio Francisco da Costa Machado