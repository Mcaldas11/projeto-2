# Back-End API - Documentação Completa de Rotas

Base URL: `http://127.0.0.1:3000`

## 🔑 Autenticação e Controlo de Acesso

O sistema utiliza **JWT (JSON Web Token)**. O token deve ser enviado no header de todas as rotas protegidas:
`Authorization: Bearer <TOKEN>`

### Perfis de Utilizador (`userType`):
- **`cidadao`**: Reporta e gere as suas próprias ocorrências.
- **`trabalhador`**: Consulta ocorrências e resolve tarefas da sua equipa.
- **`trabalhador_responsavel`**: Gere trabalhadores e rotas na sua freguesia.
- **`trabalhador_admin`**: Controlo total sobre o sistema.

---

## 🔐 Módulo: Auth (Autenticação Unificada)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Login universal para todos os tipos de utilizador. | Público |

---

## 👤 Módulo: Cidadãos (`/cidadaos`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/cidadaos` | Listar todos os cidadãos (dados públicos). | Público |
| `POST` | `/cidadaos` | Criar conta de cidadão (Registo). | Público |
| `POST` | `/cidadaos/login` | Login específico para cidadãos. | Público |
| `GET` | `/cidadaos/me` | Obter perfil do próprio cidadão autenticado. | Cidadão |
| `PUT` | `/cidadaos/me` | Atualizar dados do próprio perfil. | Cidadão |
| `GET` | `/cidadaos/me/ocorrencias` | Listar ocorrências criadas pelo próprio. | Cidadão |
| `GET` | `/cidadaos/me/freguesia/ocorrencias` | Listar todas as ocorrências na freguesia do cidadão. | Cidadão |
| `POST` | `/cidadaos/me/ocorrencias` | Criar ocorrência associada automaticamente ao perfil. | Cidadão |
| `GET` | `/cidadaos/:id` | Ver detalhes de um cidadão específico. | Público |
| `PUT` | `/cidadaos/:id` | Atualizar dados de um cidadão. | Próprio / Admin |
| `PATCH` | `/cidadaos/:id/foto` | Atualizar foto de perfil (multipart/form-data: `file`). | Próprio |
| `DELETE` | `/cidadaos/:id` | Apagar conta (remove fotos e mensagens associadas). | Próprio / Admin |

---

## 👷 Módulo: Trabalhadores (`/trabalhadores`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/trabalhadores` | Listar todos os trabalhadores (exceto admins). | Público |
| `POST` | `/trabalhadores` | Criar novo trabalhador. | **Resp. / Admin** |
| `POST` | `/trabalhadores/login` | Login específico para trabalhadores. | Público |
| `GET` | `/trabalhadores/me` | Obter perfil do trabalhador autenticado. | Trabalhador |
| `PUT` | `/trabalhadores/me` | Atualizar dados do próprio perfil. | Trabalhador |
| `GET` | `/trabalhadores/me/ocorrencias` | Listar ocorrências **pendentes** na sua freguesia. | Trabalhador |
| `GET` | `/trabalhadores/me/freguesia/ocorrencias` | Listar **todas** as ocorrências da sua freguesia. | Trabalhador |
| `GET` | `/trabalhadores/me/ocorrencias/resolvidas` | Ocorrências resolvidas pela sua equipa. | Trabalhador |
| `GET` | `/trabalhadores/me/ocorrencias/em-resolucao` | Ocorrências que a sua equipa está a tratar. | Trabalhador |
| `GET` | `/trabalhadores/me/ocorrencias/home` | Feed misto (pendentes + atribuídas à equipa). | Trabalhador |
| `GET` | `/trabalhadores/:id` | Ver detalhes de um trabalhador. | Público |
| `PUT` | `/trabalhadores/:id` | Editar trabalhador (Admin ou Resp. da mesma freguesia). | **Resp. / Admin** |
| `PATCH` | `/trabalhadores/:id/foto` | Atualizar foto de perfil (multipart/form-data: `file`). | Próprio / Admin |
| `DELETE` | `/trabalhadores/:id` | Remover trabalhador do sistema. | Próprio / Admin |

*Nota: O Responsável só pode criar/editar trabalhadores da sua própria freguesia.*

---

## 📍 Módulo: Ocorrências (`/ocorrencias`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/ocorrencias` | Listar todas as ocorrências do sistema. | Público |
| `GET` | `/ocorrencias/:id` | Ver detalhes de uma ocorrência específica. | Público |
| `POST` | `/ocorrencias` | Criar ocorrência (sem preenchimento automático). | Autenticado |
| `POST` | `/ocorrencias/:id/fotos` | Adicionar fotos (até 10, multipart: `files`). | Autenticado |
| `DELETE` | `/ocorrencias/:id/fotos` | Remover todas as fotos de uma ocorrência. | Autenticado |
| `DELETE` | `/ocorrencias/:id/fotos/:fotoIndex` | Remover uma foto específica pelo índice. | Autenticado |
| `PATCH` | `/ocorrencias/:id/fotos/:fotoIndex` | Substituir uma foto específica. | Autenticado |
| `PUT` | `/ocorrencias/:id` | Atualizar dados da ocorrência. | Autenticado |
| `PATCH` | `/ocorrencias/:id/resolve` | **Resolver/Assumir** ocorrência (pela equipa). | **Trabalhador** |
| `DELETE` | `/ocorrencias/:id` | Apagar ocorrência (limpa fotos no Cloudinary). | Autor / Admin |

---

## 🗺️ Módulo: Rotas de Limpeza/Manutenção (`/rotas`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/rotas` | Listar rotas (Resp. vê apenas as da sua freguesia). | Autenticado |
| `GET` | `/rotas/:id` | Ver detalhes de uma rota (waypoints e geometria). | Autenticado |
| `POST` | `/rotas` | Criar nova rota de manutenção. | **Resp. / Admin** |
| `PATCH` | `/rotas/:id` | Atualizar rota existente. | **Resp. / Admin** |
| `DELETE` | `/rotas/:id` | Remover rota do sistema. | **Resp. / Admin** |

---

## 👥 Módulo: Equipas (`/equipas`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/equipas` | Listar todas as equipas. | Público |
| `POST` | `/equipas` | Criar nova equipa. | **Admin / Resp.** |
| `GET` | `/equipas/:id` | Detalhes de uma equipa. | Público |
| `PUT` | `/equipas/:id` | Editar informações da equipa. | **Admin / Resp.** |
| `DELETE` | `/equipas/:id` | Apagar equipa. | **Admin / Resp.** |

---

## 💬 Módulo: Mensagens (`/mensagens`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/mensagens` | Listar mensagens (filtros via query: `idOcorrencia`). | Público |
| `POST` | `/mensagens` | Enviar nova mensagem/comentário. | Autenticado |
| `GET` | `/mensagens/:id` | Ver mensagem específica. | Público |
| `PUT` | `/mensagens/:id` | Editar mensagem. | Autor / Admin |
| `DELETE` | `/mensagens/:id` | Apagar mensagem. | Autor / Admin |

---

## 🏙️ Módulo: Municípios/Freguesias (`/municipios`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/municipios` | Listar todas as freguesias. | Público |
| `POST` | `/municipios` | Adicionar nova freguesia. | **Admin** |
| `GET` | `/municipios/:id` | Ver detalhes da freguesia. | Público |
| `PUT` | `/municipios/:id` | Editar nome/dados da freguesia. | **Admin** |
| `DELETE` | `/municipios/:id` | Remover freguesia. | **Admin** |

---

## 🚜 Módulo: Recursos (`/recursos`)

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/recursos` | Listar recursos (viaturas, ferramentas). | Público |
| `POST` | `/recursos` | Criar novo recurso. | **Admin / Resp.** |
| `GET` | `/recursos/:id` | Ver detalhes do recurso. | Público |
| `PUT` | `/recursos/:id` | Atualizar estado ou localização do recurso. | **Admin / Resp.** |
| `DELETE` | `/recursos/:id` | Apagar recurso. | **Admin / Resp.** |

---

## 🛠️ Outras Rotas

| Método | Rota | Descrição | Acesso |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Verificar estado da API (Health Check). | Público |

---

## ⚠️ Erros e Status Codes Comuns

- **200 OK**: Sucesso.
- **201 Created**: Recurso criado com sucesso.
- **204 No Content**: Sucesso (sem corpo de resposta, ex: Delete).
- **400 Bad Request**: Dados inválidos ou falta de campos obrigatórios.
- **401 Unauthorized**: Falta de token ou token inválido.
- **403 Forbidden**: Não tem permissões para esta ação (ex: Resp. a tentar apagar admin).
- **404 Not Found**: Recurso não encontrado.
- **409 Conflict**: Conflito de dados (ex: Email já em uso).
- **500 Internal Server Error**: Erro inesperado no servidor.
