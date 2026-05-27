# Back-End API (Rotas e Exemplos)

Base URL: http://127.0.0.1:3000

## Auth

- Rotas de ocorrencias exigem token.
- Rota /cidadaos/me/ocorrencias exige token.
- Header: Authorization: Bearer <TOKEN>
- Token vem de /cidadaos/login, /trabalhadores/login, /cidadaos (create) e /trabalhadores (create).

## Formatos de erro

Erro padrao (middlewares):

```json
{
  "description": "Resource not found",
  "errors": {
    "ocorrencia": ["Resource ocorrencia with ID 999 not found"]
  }
}
```

Erros com message (algumas rotas):

```json
{ "message": "Authentication failed!" }
```

```json
{ "message": "Falta o ficheiro" }
```

## Health

### GET /health
Sucesso:

```json
{ "status": "ok" }
```

Erro (exemplo 500):

```json
{ "description": "Internal server error" }
```

## Cidadaos

### GET /cidadaos
Sucesso:

```json
[
  {
    "idCidadao": 1,
    "nome": "Ana Santos",
    "fregCidadao": 2,
    "nrTelemovel": "912345678",
    "email": "ana@exemplo.pt"
  }
]
```

Erro (exemplo 500):

```json
{ "description": "Error fetching cidadaos" }
```

### POST /cidadaos
Body:

```json
{
  "nome": "Ana Santos",
  "fregCidadao": 2,
  "nrTelemovel": "912345678",
  "email": "ana@exemplo.pt",
  "password": "secret"
}
```

Sucesso:

```json
{
  "message": "Cidadao created successfully",
  "token": "<jwt>",
  "userId": 1,
  "userType": "cidadao"
}
```

Erro (exemplo 409):

```json
{
  "description": "Conflict: Email already in use.",
  "errors": { "email": ["Email already in use"] }
}
```

### POST /cidadaos/login
Body:

```json
{ "email": "ana@exemplo.pt", "password": "secret" }
```

Sucesso:

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "userId": 1,
  "userType": "cidadao"
}
```

Erro (exemplo 401):

```json
{ "message": "Authentication failed. Wrong password." }
```

### POST /cidadaos/me/ocorrencias (auth)
Body:

```json
{
  "descricao": "Buraco na estrada",
  "localizacao": "Rua das Flores, 123",
  "dataOcorrencia": "2026-05-27T10:30:00.000Z",
  "severidade": "Baixa",
  "tipo_ocorrencia": "Infraestruturas"
}
```

Sucesso:

```json
{
  "idOcorrencia": 2,
  "descricao": "Buraco na estrada",
  "estado": "À espera da equipa",
  "idCidadao": 1,
  "idFreguesia": 2
}
```

Erro (exemplo 401):

```json
{ "message": "Authentication failed!" }
```

### GET /cidadaos/:id
Sucesso:

```json
{
  "idCidadao": 1,
  "nome": "Ana Santos",
  "fregCidadao": 2,
  "nrTelemovel": "912345678",
  "email": "ana@exemplo.pt"
}
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "cidadao": ["Resource cidadao with ID 999 not found"] }
}
```

### PUT /cidadaos/:id
Sucesso:

```json
{
  "idCidadao": 1,
  "nome": "Ana Santos",
  "fregCidadao": 2,
  "nrTelemovel": "912345678",
  "email": "ana@exemplo.pt"
}
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "nome": ["nome is required"] }
}
```

### DELETE /cidadaos/:id
Sucesso: status 204 (sem body)

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "cidadao": ["Resource cidadao with ID 999 not found"] }
}
```

## Trabalhadores

### GET /trabalhadores
Sucesso:

```json
[
  {
    "idTrabalhador": 1,
    "nomeTrabalhador": "Jose Martins",
    "emailTrabalhador": "jose@exemplo.pt",
    "telemovelTrabalhador": "913333333",
    "idEquipa": 2
  }
]
```

Erro (exemplo 500):

```json
{ "description": "Error fetching trabalhadores" }
```

### POST /trabalhadores
Body:

```json
{
  "nomeTrabalhador": "Jose Martins",
  "emailTrabalhador": "jose@exemplo.pt",
  "telemovelTrabalhador": "913333333",
  "idEquipa": 2,
  "password": "secret"
}
```

Sucesso:

```json
{
  "message": "Trabalhador created successfully",
  "token": "<jwt>",
  "userId": 1,
  "userType": "trabalhador"
}
```

Erro (exemplo 400):

```json
{ "message": "Password is required" }
```

### POST /trabalhadores/login
Body:

```json
{ "email": "jose@exemplo.pt", "password": "secret" }
```

Sucesso:

```json
{
  "message": "Login realizado com sucesso",
  "token": "<jwt>",
  "userId": 1,
  "userType": "trabalhador"
}
```

Erro (exemplo 401):

```json
{ "message": "Authentication failed. Wrong password." }
```

### GET /trabalhadores/:id
Sucesso:

```json
{
  "idTrabalhador": 1,
  "nomeTrabalhador": "Jose Martins",
  "emailTrabalhador": "jose@exemplo.pt",
  "telemovelTrabalhador": "913333333",
  "idEquipa": 2
}
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "trabalhador": ["Resource trabalhador with ID 999 not found"] }
}
```

### PUT /trabalhadores/:id
Sucesso:

```json
{
  "idTrabalhador": 1,
  "nomeTrabalhador": "Jose Martins",
  "emailTrabalhador": "jose@exemplo.pt",
  "telemovelTrabalhador": "913333333",
  "idEquipa": 2
}
```

Erro (exemplo 400):

```json
{ "message": "Invalid idEquipa" }
```

### DELETE /trabalhadores/:id
Sucesso: status 204 (sem body)

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "trabalhador": ["Resource trabalhador with ID 999 not found"] }
}
```

## Municipios

### GET /municipios
Sucesso:

```json
[{ "idMunicipio": 1, "nome": "Vila do Conde" }]
```

Erro (exemplo 500):

```json
{ "description": "Error fetching municipios" }
```

### POST /municipios
Body:

```json
{ "nome": "Vila do Conde" }
```

Sucesso:

```json
{ "idMunicipio": 1, "nome": "Vila do Conde" }
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "nome": ["nome is required"] }
}
```

### GET /municipios/:id
Sucesso:

```json
{ "idMunicipio": 1, "nome": "Vila do Conde" }
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "municipio": ["Resource municipio with ID 999 not found"] }
}
```

### PUT /municipios/:id
Sucesso:

```json
{ "idMunicipio": 1, "nome": "Vila do Conde" }
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "nome": ["nome is required"] }
}
```

### DELETE /municipios/:id
Sucesso: status 204 (sem body)

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "municipio": ["Resource municipio with ID 999 not found"] }
}
```

## Equipas

### GET /equipas
Sucesso:

```json
[{ "idEquipa": 1, "especializacao": "Iluminacao", "fregEquipa": 2 }]
```

Erro (exemplo 500):

```json
{ "description": "Error fetching equipas" }
```

### POST /equipas
Body:

```json
{ "especializacao": "Iluminacao", "fregEquipa": 2 }
```

Sucesso:

```json
{ "idEquipa": 1, "especializacao": "Iluminacao", "fregEquipa": 2 }
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "especializacao": ["especializacao is required"] }
}
```

### GET /equipas/:id
Sucesso:

```json
{ "idEquipa": 1, "especializacao": "Iluminacao", "fregEquipa": 2 }
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "equipa": ["Resource equipa with ID 999 not found"] }
}
```

### PUT /equipas/:id
Sucesso:

```json
{ "idEquipa": 1, "especializacao": "Iluminacao", "fregEquipa": 2 }
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "fregEquipa": ["fregEquipa is required"] }
}
```

### DELETE /equipas/:id
Sucesso: status 204 (sem body)

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "equipa": ["Resource equipa with ID 999 not found"] }
}
```

## Recursos

### GET /recursos
Sucesso:

```json
[
  {
    "idRecurso": 1,
    "tipo": "Camiao",
    "estado": "Disponivel",
    "localizacao": "Parque",
    "equipaResponsavel": 2
  }
]
```

Erro (exemplo 500):

```json
{ "description": "Error fetching recursos" }
```

### POST /recursos
Body:

```json
{
  "tipo": "Camiao",
  "estado": "Disponivel",
  "localizacao": "Parque",
  "equipaResponsavel": 2
}
```

Sucesso:

```json
{
  "idRecurso": 1,
  "tipo": "Camiao",
  "estado": "Disponivel",
  "localizacao": "Parque",
  "equipaResponsavel": 2
}
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "tipo": ["tipo is required"] }
}
```

### GET /recursos/:id
Sucesso:

```json
{
  "idRecurso": 1,
  "tipo": "Camiao",
  "estado": "Disponivel",
  "localizacao": "Parque",
  "equipaResponsavel": 2
}
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "recurso": ["Resource recurso with ID 999 not found"] }
}
```

### PUT /recursos/:id
Sucesso:

```json
{
  "idRecurso": 1,
  "tipo": "Camiao",
  "estado": "Disponivel",
  "localizacao": "Parque",
  "equipaResponsavel": 2
}
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "estado": ["estado is required"] }
}
```

### DELETE /recursos/:id
Sucesso: status 204 (sem body)

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "recurso": ["Resource recurso with ID 999 not found"] }
}
```

## Mensagens

### GET /mensagens
Sucesso:

```json
[
  {
    "idMensagem": 1,
    "texto": "Ola",
    "dataMensagem": "2026-05-27T10:30:00.000Z",
    "idCidadao": 1,
    "idOcorrencia": 2
  }
]
```

Erro (exemplo 500):

```json
{ "description": "Error fetching mensagens" }
```

### POST /mensagens
Body:

```json
{
  "texto": "Ola",
  "dataMensagem": "2026-05-27T10:30:00.000Z",
  "idCidadao": 1,
  "idOcorrencia": 2
}
```

Sucesso:

```json
{
  "idMensagem": 1,
  "texto": "Ola",
  "dataMensagem": "2026-05-27T10:30:00.000Z",
  "idCidadao": 1,
  "idOcorrencia": 2
}
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "texto": ["texto is required"] }
}
```

### GET /mensagens/:id
Sucesso:

```json
{
  "idMensagem": 1,
  "texto": "Ola",
  "dataMensagem": "2026-05-27T10:30:00.000Z",
  "idCidadao": 1,
  "idOcorrencia": 2
}
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "mensagem": ["Resource mensagem with ID 999 not found"] }
}
```

### PUT /mensagens/:id
Sucesso:

```json
{
  "idMensagem": 1,
  "texto": "Ola",
  "dataMensagem": "2026-05-27T10:30:00.000Z",
  "idCidadao": 1,
  "idOcorrencia": 2
}
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "texto": ["texto is required"] }
}
```

### DELETE /mensagens/:id
Sucesso: status 204 (sem body)

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "mensagem": ["Resource mensagem with ID 999 not found"] }
}
```

## Ocorrencias (auth required for all)

### GET /ocorrencias
Sucesso:

```json
[
  {
    "idOcorrencia": 2,
    "foto": [
      { "index": 0, "url": "https://res.cloudinary.com/.../img1.jpg" },
      { "index": 1, "url": "https://res.cloudinary.com/.../img2.jpg" }
    ],
    "descricao": "Buraco na estrada",
    "localizacao": "Rua das Flores, 123",
    "estado": "À espera da equipa"
  }
]
```

Erro (exemplo 401):

```json
{ "message": "Authentication failed!" }
```

### POST /ocorrencias
Body:

```json
{
  "descricao": "Buraco na estrada",
  "localizacao": "Rua das Flores, 123",
  "dataOcorrencia": "2026-05-27T10:30:00.000Z",
  "nomeAutor": "Ana Santos",
  "nrTelemovelAutor": "912345678",
  "severidade": "Baixa",
  "idCidadao": 1,
  "idFreguesia": 2,
  "tipo_ocorrencia": "Infraestruturas"
}
```

Sucesso:

```json
{
  "idOcorrencia": 2,
  "descricao": "Buraco na estrada",
  "estado": "À espera da equipa"
}
```

Erro (exemplo 401):

```json
{ "message": "Authentication failed!" }
```

### GET /ocorrencias/:id
Sucesso:

```json
{
  "idOcorrencia": 2,
  "foto": [
    { "index": 0, "url": "https://res.cloudinary.com/.../img1.jpg" }
  ],
  "descricao": "Buraco na estrada",
  "localizacao": "Rua das Flores, 123"
}
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "ocorrencia": ["Resource ocorrencia with ID 999 not found"] }
}
```

### POST /ocorrencias/:id/fotos (multipart/form-data, files)
Sucesso:

```json
{
  "success": true,
  "foto": [
    { "index": 0, "url": "https://res.cloudinary.com/.../img1.jpg" },
    { "index": 1, "url": "https://res.cloudinary.com/.../img2.jpg" }
  ]
}
```

Erro (exemplo 400):

```json
{ "message": "Falta o ficheiro" }
```

### PATCH /ocorrencias/:id/fotos/:fotoIndex (multipart/form-data, files)
Sucesso:

```json
{
  "success": true,
  "foto": [
    { "index": 0, "url": "https://res.cloudinary.com/.../img1.jpg" }
  ]
}
```

Erro (exemplo 404):

```json
{ "message": "Foto nao encontrada" }
```

### DELETE /ocorrencias/:id/fotos
Sucesso:

```json
{ "success": true, "foto": [] }
```

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "ocorrencia": ["Resource ocorrencia with ID 999 not found"] }
}
```

### DELETE /ocorrencias/:id/fotos/:fotoIndex
Sucesso:

```json
{ "success": true, "foto": [] }
```

Erro (exemplo 400):

```json
{ "message": "fotoIndex invalido" }
```

### PUT /ocorrencias/:id
Sucesso:

```json
{
  "idOcorrencia": 2,
  "descricao": "Buraco na estrada",
  "estado": "Em resolucao"
}
```

Erro (exemplo 400):

```json
{
  "description": "Missing required fields",
  "errors": { "descricao": ["descricao is required"] }
}
```

### PATCH /ocorrencias/:id/resolve (auth trabalhador)
Body (exemplo):

```json
{ "estado": "Resolvido", "feedback": "Corrigido" }
```

Sucesso:

```json
{
  "idOcorrencia": 2,
  "estado": "Resolvido",
  "feedback": "Corrigido"
}
```

Erro (exemplo 403):

```json
{ "message": "Forbidden: only trabalhadores can resolve ocorrencias" }
```

### DELETE /ocorrencias/:id
Sucesso: status 204 (sem body)

Erro (exemplo 404):

```json
{
  "description": "Resource not found",
  "errors": { "ocorrencia": ["Resource ocorrencia with ID 999 not found"] }
}
```
