# Back-End API Routes

Base URL: http://127.0.0.1:3000

## Auth
- Most routes are public. Only ocorrencias routes require auth.
- Use header: Authorization: Bearer <TOKEN>
- Tokens come from /cidadaos/login or /trabalhadores/login.

## Quick guide: ocorrencia with photos (2 steps)
1) Create ocorrencia as cidadao:
   POST /cidadaos/me/ocorrencias (JSON)
2) Upload photos:
   POST /ocorrencias/:id/fotos (multipart/form-data, field name: files)

Allowed image types: JPG, PNG, GIF, WEBP
Max files: 10
Max size per file: 5MB
Storage: Cloudinary (no local uploads folder)

## Health
- GET /health

## Cloudinary
Set these env vars:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

## Cidadaos
- GET /cidadaos
- POST /cidadaos
  - JSON fields: nome, munCidadao, nrTelemovel, email, password
- POST /cidadaos/login
  - JSON fields: email, password
- POST /cidadaos/me/ocorrencias
  - Auth required
  - JSON fields: descricao, localizacao, dataOcorrencia, severidade, tipo_ocorrencia
  - idCidadao, nomeAutor, nrTelemovelAutor, idMunicipio are auto-filled from token/user
  - estado is set automatically to "À espera de equipa"
- GET /cidadaos/:id
- PUT /cidadaos/:id
  - JSON fields: nome, munCidadao, nrTelemovel, email
- DELETE /cidadaos/:id

## Trabalhadores
- GET /trabalhadores
- POST /trabalhadores
  - JSON fields: nomeTrabalhador, emailTrabalhador, telemovelTrabalhador, idEquipa, password
- POST /trabalhadores/login
  - JSON fields: email or emailTrabalhador, password
- GET /trabalhadores/:id
- PUT /trabalhadores/:id
  - JSON fields: nomeTrabalhador, emailTrabalhador, telemovelTrabalhador, idEquipa
- DELETE /trabalhadores/:id

## Municipios
- GET /municipios
- POST /municipios
  - JSON fields: nome
- GET /municipios/:id
- PUT /municipios/:id
  - JSON fields: nome
- DELETE /municipios/:id

## Equipas
- GET /equipas
- POST /equipas
  - JSON fields: especializacao, munEquipa
- GET /equipas/:id
- PUT /equipas/:id
  - JSON fields: especializacao, munEquipa
- DELETE /equipas/:id

## Recursos
- GET /recursos
- POST /recursos
  - JSON fields: tipo, estado, localizacao, equipaResponsavel
- GET /recursos/:id
- PUT /recursos/:id
  - JSON fields: tipo, estado, localizacao, equipaResponsavel
- DELETE /recursos/:id

## Ocorrencias (auth required for all)
- GET /ocorrencias
- POST /ocorrencias
  - JSON fields: descricao, localizacao, dataOcorrencia, nomeAutor, nrTelemovelAutor, severidade, idCidadao, idMunicipio, tipo_ocorrencia
  - estado is set automatically to "À espera de equipa"
- GET /ocorrencias/:id
  - Response includes fotos: ["https://res.cloudinary.com/...", ...]
- POST /ocorrencias/:id/fotos
  - multipart/form-data, files[]
- PUT /ocorrencias/:id
  - JSON fields: descricao, localizacao, dataOcorrencia, nomeAutor, nrTelemovelAutor, severidade, estado, idCidadao, idMunicipio, tipo_ocorrencia
- PATCH /ocorrencias/:id/resolve
  - JSON fields (optional): dataAgendada, feedback, dataResolucao, estado
  - Only trabalhadores can resolve
- DELETE /ocorrencias/:id

## Mensagens
- GET /mensagens
- POST /mensagens
  - JSON fields: texto, dataMensagem, idCidadao, idOcorrencia
- GET /mensagens/:id
- PUT /mensagens/:id
  - JSON fields: texto, dataMensagem, idCidadao, idOcorrencia
- DELETE /mensagens/:id
