# Documentação Absoluta e Linha-a-Linha dos Controladores

Este documento é a referência definitiva para a lógica de back-end. Cada função é dissecada passo a passo para explicar o seu propósito e execução.

---

## 1. `auth.controller.js` (O Porteiro do Sistema)

### Função: `unifiedLogin`
**Propósito:** Realizar o login de qualquer utilizador (Cidadão ou Trabalhador) num único endpoint.

1.  **`const { email, password } = req.body;`**: Extrai as credenciais enviadas pelo front-end.
2.  **`if (!email || !password) ...`**: Validação básica. Se faltar um campo, para aqui e retorna erro 400.
3.  **`Trabalhador.findOne({ where: { emailTrabalhador: loginEmail } });`**: Pergunta ao banco de dados: "Existe algum trabalhador com este email?".
4.  **Deteção de Role (Se for Trabalhador)**:
    *   Usa `isAdminEmail` e `isResponsavelEmail` para verificar se o email está nas listas brancas de permissões elevadas.
    *   Define o `userType` como `trabalhador_admin`, `trabalhador_responsavel` ou apenas `trabalhador`.
5.  **Fallback para Cidadão**: Se não encontrou trabalhador, executa `Cidadao.findOne`. Se encontrar, o `userType` passa a ser `cidadao`.
6.  **`bcrypt.compare(password, credentials)`**:
    *   A `password` é o texto limpo do utilizador.
    *   As `credentials` são o hash (texto cifrado) do banco.
    *   O Bcrypt verifica se a password gera aquele hash. Se não, retorna erro 401 (Não Autorizado).
7.  **`jwt.sign(...)`**: Cria o Token.
    *   Coloca o `userId`, `email` e `userType` dentro do "envelope" do token.
    *   Assina com o segredo `your_jwt_secret`.
    *   Define validade de 24 horas.
8.  **`res.json(...)`**: Envia o token e os dados de volta para o utilizador.

---

## 2. `cidadaos.controller.js` (Gestão de Identidade Civil)

### Função: `createCidadao` (O Registo)
1.  **`const { password, ...rest } = req.body;`**: Separa a password dos outros dados (nome, email, etc).
2.  **`bcrypt.hash(password, 10)`**: Transforma a password numa "impressão digital" cifrada. O `10` é o nível de complexidade (salt).
3.  **`Cidadao.create(...)`**: Grava o novo cidadão no banco com a password já cifrada.
4.  **`jwt.sign(...)`**: Gera um token imediato para que o utilizador não precise de fazer login logo após o registo.

### Função: `deleteCidadao` (A Purga de Dados)
Esta função é um exemplo de "Cleanup" (Limpeza).
1.  **Autorização**: Verifica se quem está a apagar é o dono da conta ou um Admin.
2.  **Foto de Perfil**: Extrai o `publicId` da URL da foto e diz ao Cloudinary: "Apaga este ficheiro".
3.  **Mensagens**: Executa `Mensagem.destroy` para todas as mensagens enviadas por este ID.
4.  **Ocorrências e Fotos**:
    *   Lê todas as ocorrências do utilizador.
    *   Para cada ocorrência, lê o campo `foto` (que é um JSON).
    *   Converte a string em array, extrai os IDs das fotos no Cloudinary e apaga-as todas.
    *   Apaga a ocorrência no banco.
5.  **Cidadão**: Finalmente, apaga o registo do cidadão.

---

## 3. `ocorrencias.controller.js` (O Fluxo de Trabalho das Ruas)

### Função: `createOcorrenciaForCidadao`
1.  **`req.body.estado = DEFAULT_ESTADO;`**: Força o estado para "À espera da equipa".
2.  **`req.userData.userId`**: Pega o ID que o middleware de autenticação extraiu do Token.
3.  **Preenchimento Automático**: Busca os dados do cidadão no banco para garantir que o `nomeAutor` e `nrTelemovelAutor` no reporte são os reais do utilizador logado.

### Função: `resolveOcorrenciaByEquipa`
1.  **`normalizeWorkerType`**: Verifica se quem chama é um trabalhador. Cidadãos não podem resolver ocorrências.
2.  **Verificação de Equipa**: Se o trabalhador não tiver equipa (`!trabalhador.idEquipa`), é bloqueado.
3.  **Segurança de Atribuição**: Se a ocorrência já tiver um `idEquipa` diferente do trabalhador, ele não pode mexer (evita conflitos entre equipas).
4.  **Lógica de Estado**:
    *   Se o trabalhador disser que está "Resolvido", a função injeta a `dataResolucao = new Date()`.
    *   Se for a primeira vez que a equipa mexe na ocorrência, o `idEquipa` dela fica gravado na ocorrência.

### Função: `replaceOcorrenciaFoto` (Edição Cirúrgica)
1.  **`id` e `fotoIndex`**: Identifica qual ocorrência e qual posição da foto no array (ex: foto 0, foto 1).
2.  **`uploadToCloudinary`**: Envia a nova foto.
3.  **Manipulação de Array**:
    *   Lê o array de fotos atual.
    *   Substitui apenas a foto na posição `index`.
    *   Guarda o novo array como String JSON no banco.
4.  **Cleanup**: Apaga a foto antiga no Cloudinary para não gastar armazenamento.

---

## 4. `trabalhadores.controller.js` (Gestão de Recursos Humanos)

### Função: `createTrabalhador`
1.  **Permissões**: Verifica se o utilizador é Admin ou Responsável.
2.  **Regra de Freguesia**: Se for Responsável, a função verifica se o `idFreguesia` do novo trabalhador é igual à do Responsável. Se for diferente, retorna 403 (Proibido).
3.  **Validação de telemóvel**: Usa uma Regex (`/^[0-9]{9}$/`) para garantir que o número tem exatamente 9 dígitos.
4.  **Consistência de Equipa**: Se for atribuída uma equipa, verifica se essa equipa pertence à mesma freguesia do trabalhador.

---

## 5. `rotas.controller.js` (Logística de Geolocalização)

### Funções: `getAllRotas` / `getRotaById`
1.  **Filtro Territorial**:
    *   Se for um Responsável, a função injeta um filtro no Sequelize: `where: { idFreguesia: requester.idFreguesia }`. Ele só vê o que é da sua área.
2.  **Parsing de Dados**: Como o banco guarda as coordenadas como texto, a função faz `JSON.parse(r.waypoints)` e `JSON.parse(r.geometry)` antes de enviar para o front-end, para que o mapa consiga ler os pontos.

---

## 6. `mensagens.controller.js` (Comunicação)

### Função: `createMensagem`
1.  Simplesmente insere o texto, a data e os IDs de relação (Cidadão/Ocorrência) no banco.

### Função: `deleteMensagem`
1.  **Dono da Mensagem**: Verifica se o `userId` no Token é o mesmo que criou a mensagem.
2.  **Exceção de Admin**: Se for Admin, pode apagar qualquer mensagem (moderação).

---

## Funções Utilitárias Internas (Explicadas)

### `handleSequelizeValidation`
Esta função é chamada em quase todos os `catch`. Ela verifica se o erro veio de uma regra do banco (ex: email repetido) e transforma o erro técnico do Sequelize numa mensagem legível para o utilizador.

### `uploadToCloudinary`
Transforma a imagem que veio do formulário num "Stream" (fluxo de dados) e envia para a nuvem. Retorna a URL segura (https) da imagem.

### `extractPublicIdFromUrl`
Usa lógica de strings para encontrar o nome do ficheiro dentro da URL do Cloudinary. Sem isto, não conseguiríamos apagar ficheiros na nuvem.

---

## Ciclo de Vida de uma Ocorrência (Passo-a-Passo nos Controladores)

1.  **`cidadaos.controller`**: Cidadão cria conta e faz login.
2.  **`ocorrencias.controller (create)`**: Cidadão tira foto e reporta o problema. O estado fica "À espera da equipa".
3.  **`ocorrencias.controller (getPending)`**: O Trabalhador vê a lista de problemas da sua freguesia.
4.  **`ocorrencias.controller (resolve)`**: O Trabalhador aceita a ocorrência. O estado muda para "Em resolução" e a sua equipa fica associada.
5.  **`mensagens.controller`**: Trabalhador e Cidadão trocam detalhes.
6.  **`ocorrencias.controller (resolve)`**: O Trabalhador termina o serviço, escreve um feedback e o estado muda para "Resolvido". A data de resolução é gravada.
7.  **`ocorrencias.controller (getResolved)`**: A ocorrência passa para o histórico de sucessos da equipa.
