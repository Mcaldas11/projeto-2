# Shared Models

Esta pasta contém todos os modelos Sequelize compartilhados entre o Back-End e o Data-Generator. Deste modo, não há duplicação de código.

## Estrutura

- `municipio.js` - Model para Municipios
- `cidadao.js` - Model para Cidadãos
- `equipa.js` - Model para Equipas
- `trabalhador.js` - Model para Trabalhadores
- `recurso.js` - Model para Recursos
- `ocorrencia.js` - Model para Ocorrências
- `mensagem.js` - Model para Mensagens
- `index.js` - Export central com `initializeModels(sequelize)`

## Como Usar

### No Back-End

```javascript
import { sequelize, models } from "./models/db.js";

// models.Municipio, models.Cidadao, etc.
const municipios = await models.Municipio.findAll();
```

### No Data-Generator

```javascript
import { sequelize, models } from "./database/db.js";

// Mesma API
const municipios = await models.Municipio.findAll();
```
