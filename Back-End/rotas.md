# Back-End API (Rotas e Exemplos)

Base URL: `http://127.0.0.1:3000`

## Auth

- `Authorization: Bearer <TOKEN>`
- `trabalhador_admin` é o userType do admin no login de trabalhador.
- Rotas de `ocorrencias`, `mensagens`, `cidadaos/:id`, `cidadaos/:id/foto`, `trabalhadores/:id`, `trabalhadores/:id/foto` e `cidadaos/me/ocorrencias` usam auth.

## Formato de erro

```json
{
  "description": "Resource not found",
  "errors": {
    "ocorrencia": ["Resource ocorrencia with ID 999 not found"]
  }
}
```

```json
{ "message": "Authentication failed!" }
```

```json
{ "message": "Falta o ficheiro" }
```

## `cidadaos`

### `GET /cidadaos`
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

### `POST /cidadaos`
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

```json
{
  "message": "Cidadao created successfully",
  "token": "<jwt>",
  "userId": 1,
  "userType": "cidadao"
}
```

### `POST /cidadaos/login`
```json
{ "email": "ana@exemplo.pt", "password": "secret" }
```

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "userId": 1,
  "userType": "cidadao"
}
```

### `GET /cidadaos/me`
`Authorization: Bearer <TOKEN>`

```json
{
  "idCidadao": 1,
  "nome": "Ana Santos",
  "fregCidadao": 2,
  "nrTelemovel": "912345678",
  "email": "ana@exemplo.pt",
  "fotoPerfil": "https://res.cloudinary.com/.../perfil.jpg"
}
```

### `GET /cidadaos/me/ocorrencias`
`Authorization: Bearer <TOKEN>`

```json
[
  {
    "idOcorrencia": 2,
    "descricao": "Buraco na estrada",
    "estado": "À espera da equipa",
    "idCidadao": 1,
    "idFreguesia": 2
  }
]
```

### `POST /cidadaos/me/ocorrencias`
```json
{
  "descricao": "Buraco na estrada",
  "localizacao": "Rua das Flores, 123",
  "dataOcorrencia": "2026-05-27T10:30:00.000Z",
  "severidade": "Baixa",
  "tipo_ocorrencia": "Infraestruturas"
}
```

```json
{
  "idOcorrencia": 2,
  "descricao": "Buraco na estrada",
  "estado": "À espera da equipa",
  "idCidadao": 1,
  "idFreguesia": 2
}
```

### `GET /cidadaos/:id`
```json
{
  "idCidadao": 1,
  "nome": "Ana Santos",
  "fregCidadao": 2,
  "nrTelemovel": "912345678",
  "email": "ana@exemplo.pt"
}
```

### `PUT /cidadaos/:id`
Body parcial permitido.

```json
{
  "nome": "Ana Martins",
  "nrTelemovel": "911111111"
}
```

### `PATCH /cidadaos/:id/foto`
`multipart/form-data` com `file`.

```json
{ "success": true, "fotoPerfil": "https://res.cloudinary.com/.../perfil.jpg" }
```

### `DELETE /cidadaos/:id`
Status `204`.

## `trabalhadores`

### `GET /trabalhadores`
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

### `POST /trabalhadores`
```json
{
  "nomeTrabalhador": "Jose Martins",
  "emailTrabalhador": "jose@exemplo.pt",
  "telemovelTrabalhador": "913333333",
  "idEquipa": 2,
  "password": "secret"
}
```

```json
{
  "message": "Trabalhador created successfully",
  "token": "<jwt>",
  "userId": 1,
  "userType": "trabalhador"
}
```

### `POST /trabalhadores/login`
```json
{ "email": "jose@exemplo.pt", "password": "secret" }
```

```json
{
  "message": "Login realizado com sucesso",
  "token": "<jwt>",
  "userId": 1,
  "userType": "trabalhador_admin"
}
```

### `GET /trabalhadores/me`
`Authorization: Bearer <TOKEN>`

```json
{
  "idTrabalhador": 1,
  "nomeTrabalhador": "Jose Martins",
  "emailTrabalhador": "jose@exemplo.pt",
  "telemovelTrabalhador": "913333333",
  "idEquipa": 2,
  "idFreguesia": 3,
  "fotoPerfil": "https://res.cloudinary.com/.../perfil.jpg"
}
```

### `GET /trabalhadores/me/ocorrencias`
`Authorization: Bearer <TOKEN>`

Lista as ocorrências da equipa do trabalhador que já têm `dataResolucao` preenchida.

```json
[
  {
    "idOcorrencia": 10,
    "descricao": "Buraco na estrada",
    "estado": "Resolvido",
    "idCidadao": 1,
    "idFreguesia": 2,
    "idEquipa": 5,
    "dataResolucao": "2026-05-28T12:00:00.000Z"
  }
]
```

### `GET /trabalhadores/:id`
```json
{
  "idTrabalhador": 1,
  "nomeTrabalhador": "Jose Martins",
  "emailTrabalhador": "jose@exemplo.pt",
  "telemovelTrabalhador": "913333333",
  "idEquipa": 2
}
```

### `PUT /trabalhadores/:id`
Body parcial permitido.

```json
{
  "nomeTrabalhador": "Jose Silva",
  "idEquipa": 3
}
```

### `PATCH /trabalhadores/:id/foto`
`multipart/form-data` com `file`.

```json
{ "success": true, "fotoPerfil": "https://res.cloudinary.com/.../perfil.jpg" }
```

- Só o próprio trabalhador ou um admin pode alterar esta foto.

### `DELETE /trabalhadores/:id`
Status `204`.

- Só o próprio trabalhador ou um admin pode apagar a conta.
- Contas de admin não podem ser apagadas.
- A foto de perfil é removida do Cloudinary antes de apagar a conta.

## `ocorrencias`

### `GET /ocorrencias`
```json
[
  {
    "idOcorrencia": 1,
    "descricao": "Buraco na estrada",
    "estado": "À espera da equipa",
    "idCidadao": 1,
    "idFreguesia": 2
  }
]
```

### `POST /ocorrencias`
```json
{
  "descricao": "Lixo na rua",
  "localizacao": "Centro",
  "dataOcorrencia": "2026-05-28T10:00:00.000Z",
  "severidade": "Alta",
  "tipo_ocorrencia": "Higiene",
  "idCidadao": 1,
  "idFreguesia": 2
}
```

### `GET /ocorrencias/:id`
```json
{
  "idOcorrencia": 1,
  "descricao": "Buraco na estrada",
  "estado": "À espera da equipa"
}
```

### `POST /ocorrencias/:id/fotos`
`multipart/form-data` com `files`.

```json
{ "idOcorrencia": 1, "fotos": ["https://res.cloudinary.com/.../1.jpg"] }
```

### `DELETE /ocorrencias/:id/fotos`
```json
{ "success": true }
```

### `DELETE /ocorrencias/:id/fotos/:fotoIndex`
```json
{ "success": true }
```

### `PATCH /ocorrencias/:id/fotos/:fotoIndex`
`multipart/form-data` com `files`.

```json
{ "success": true }
```

### `PUT /ocorrencias/:id`
```json
{
  "descricao": "Buraco maior na estrada",
  "estado": "Em análise"
}
```

### `PATCH /ocorrencias/:id/resolve`
```json
{
  "estado": "Resolvido",
  "idEquipa": 2
}
```

### `DELETE /ocorrencias/:id`
Status `204`.

## `mensagens`

### `GET /mensagens`
```json
[
  {
    "idMensagem": 1,
    "assunto": "Pedido de informação",
    "idCidadao": 1
  }
]
```

### `POST /mensagens`
```json
{
  "assunto": "Pedido de informação",
  "mensagem": "Preciso de ajuda com a ocorrência",
  "idCidadao": 1
}
```

### `GET /mensagens/:id`
```json
{
  "idMensagem": 1,
  "assunto": "Pedido de informação",
  "mensagem": "Preciso de ajuda com a ocorrência"
}
```

### `PUT /mensagens/:id`
```json
{
  "assunto": "Atualização",
  "mensagem": "Já resolvi"
}
```

### `DELETE /mensagens/:id`
Status `204`.

## `municipios`

### `GET /municipios`
```json
[
  { "idMunicipio": 1, "nome": "Vila do Conde" }
]
```

### `POST /municipios`
```json
{ "nome": "Vila do Conde" }
```

### `GET /municipios/:id`
```json
{ "idMunicipio": 1, "nome": "Vila do Conde" }
```

### `PUT /municipios/:id`
```json
{ "nome": "Póvoa de Varzim" }
```

### `DELETE /municipios/:id`
Status `204`.

## `equipas`

### `GET /equipas`
```json
[
  { "idEquipa": 1, "nomeEquipa": "Equipa Norte" }
]
```

### `POST /equipas`
```json
{ "nomeEquipa": "Equipa Norte" }
```

### `GET /equipas/:id`
```json
{ "idEquipa": 1, "nomeEquipa": "Equipa Norte" }
```

### `PUT /equipas/:id`
```json
{ "nomeEquipa": "Equipa Sul" }
```

### `DELETE /equipas/:id`
Status `204`.

## `recursos`

### `GET /recursos`
```json
[
  { "idRecurso": 1, "nomeRecurso": "Camião" }
]
```

### `POST /recursos`
```json
{ "nomeRecurso": "Camião" }
```

### `GET /recursos/:id`
```json
{ "idRecurso": 1, "nomeRecurso": "Camião" }
```

### `PUT /recursos/:id`
```json
{ "nomeRecurso": "Carrinha" }
```

### `DELETE /recursos/:id`
Status `204`.

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

## Health

### GET /health
Sucesso:

```json
{ "status": "ok" }
```
