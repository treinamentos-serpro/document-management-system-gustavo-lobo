# Especificação — Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos, armazenando os arquivos no filesystem local e mantendo os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos.
- Listagem dos documentos do usuário.
- Download de um documento pelo identificador.
- Separação dos documentos por usuário.
- Interface web para upload, listagem e download.
- Verificação de saúde do backend.

### Fora do escopo

- Armazenamento em nuvem ou em provedores externos.
- Banco de dados persistente para metadados.
- Versionamento, edição ou exclusão de documentos.
- Autenticação e gestão de contas.
- Compartilhamento entre usuários, busca avançada ou classificação.
- Verificação antivírus ou análise do conteúdo dos arquivos.

## 3. Premissas

- O backend usa Node.js, Express e CommonJS; o frontend usa React, Vite e ESM.
- O cliente acessa a API pelo prefixo `/api`; o proxy existente do Vite remove esse prefixo ao encaminhar as requisições ao backend.
- Para esta versão demonstrativa, o cliente informa o identificador do usuário pelo cabeçalho `X-User-Id`. Esse valor é apenas um identificador de escopo, não uma credencial. A solução não deve ser considerada autenticação adequada para produção.
- O upload usa o campo multipart `file`. Arquivos vazios são rejeitados.
- Não há lista de extensões permitidas nesta versão. O tamanho máximo é configurável e o nome original nunca é usado como caminho de armazenamento.
- A configuração padrão de armazenamento aponta para `backend/storage`; valores de ambiente podem sobrescrever os padrões documentados abaixo.

## 4. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar o envio de um arquivo por requisição multipart, no campo `file`. |
| RF-02 | O sistema deve associar cada documento ao usuário indicado por `X-User-Id`. |
| RF-03 | O sistema deve rejeitar requisições sem arquivo, com arquivo vazio ou sem identificador de usuário válido. |
| RF-04 | O sistema deve gravar o conteúdo do arquivo no filesystem local usando `multer` com `diskStorage`. |
| RF-05 | O sistema deve gerar um identificador único e um nome interno de armazenamento que não dependa do nome fornecido pelo cliente. |
| RF-06 | O sistema deve retornar os metadados públicos do documento após um upload concluído com sucesso. |
| RF-07 | O sistema deve listar somente os documentos pertencentes ao usuário da requisição. |
| RF-08 | A listagem deve estar ordenada do upload mais recente para o mais antigo. |
| RF-09 | O sistema deve permitir baixar um documento pelo identificador, desde que pertença ao usuário da requisição. |
| RF-10 | O sistema deve responder com `404` quando o documento não existir, pertencer a outro usuário ou não estiver disponível no filesystem. |
| RF-11 | O sistema deve disponibilizar `GET /health`, retornando o estado de saúde do backend. |
| RF-12 | O sistema deve apresentar estados de carregamento, sucesso e erro para upload e listagem na interface. |
| RF-13 | Após um upload bem-sucedido, a interface deve atualizar a listagem sem exigir recarga manual da página. |

## 5. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser armazenados somente no filesystem local, por meio de `multer` configurado com `diskStorage`. |
| RNF-02 | Os metadados devem permanecer em memória nesta fase e não devem ser apresentados como persistentes após reinício do processo. |
| RNF-03 | Porta, diretório de armazenamento e tamanho máximo devem ser configuráveis por variáveis de ambiente. |
| RNF-04 | O tamanho máximo padrão do arquivo deve ser 10 MiB (`10485760` bytes), configurável por `MAX_FILE_SIZE_BYTES`. |
| RNF-05 | O backend deve validar as entradas HTTP e tratar erros de upload, leitura e escrita sem expor stack traces ou caminhos internos ao cliente. |
| RNF-06 | O nome original do arquivo deve ser tratado como dado não confiável e nunca concatenado a um caminho de filesystem. |
| RNF-07 | Falhas após a gravação do arquivo, antes da inclusão dos metadados, devem remover o arquivo recém-gravado quando possível. |
| RNF-08 | Respostas de erro da API devem usar formato JSON consistente, exceto quando a resposta esperada for um arquivo binário. |
| RNF-09 | A implementação deve preservar o fluxo de dependências `routes -> controllers -> services -> repositories`. |
| RNF-10 | Os testes do backend devem usar o runner nativo `node:test`. |

### Configuração

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretório local para gravação dos arquivos. Deve ser resolvido para um caminho absoluto na inicialização. |
| `MAX_FILE_SIZE_BYTES` | `10485760` | Tamanho máximo permitido por arquivo, em bytes. |

Valores numéricos inválidos ou menores ou iguais a zero devem ser rejeitados na inicialização com mensagem clara.

## 6. Modelo de dados

### Metadados públicos do documento

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único do documento, gerado pelo servidor. |
| `originalName` | string | Nome original informado no upload, usado apenas para exibição e download. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601, em UTC. |
| `owner` | string | Identificador do usuário associado ao documento. |

### Dados internos de persistência

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `storedName` | string | Nome aleatório ou derivado do identificador, usado para localizar o arquivo. Não deve ser exposto na API. |

- O repositório de metadados deve manter os registros em memória, indexados por `id`.
- O repositório de arquivos deve gravar e recuperar conteúdo em `STORAGE_DIR`.
- A reinicialização do backend perde os metadados; arquivos já gravados podem permanecer no diretório sem referência. A limpeza automática desses arquivos não faz parte desta versão.

## 7. Contratos de API

Todas as rotas abaixo são endereçadas no backend sem o prefixo `/api`. O frontend usa `/api` por causa do proxy do Vite.

### Cabeçalho de usuário

As rotas de documentos exigem:

```http
X-User-Id: identificador-do-usuario
```

O valor deve ser uma string não vazia após remoção de espaços e ter no máximo 100 caracteres. A ausência ou invalidade resulta em `400 Bad Request`. Esse cabeçalho não comprova a identidade do usuário.

### Formato de erro

```json
{
  "error": {
	 "code": "FILE_TOO_LARGE",
	 "message": "O arquivo excede o tamanho máximo permitido."
  }
}
```

`code` deve ser estável para uso pelo cliente; `message` deve ser compreensível e não incluir detalhes internos.

### `POST /upload`

- **Content-Type:** `multipart/form-data`
- **Cabeçalho obrigatório:** `X-User-Id`
- **Campo obrigatório:** `file`
- **Sucesso:** `201 Created`

Exemplo de resposta:

```json
{
  "id": "identificador-gerado",
  "originalName": "relatorio.pdf",
  "size": 24832,
  "uploadedAt": "2026-10-26T12:30:00.000Z",
  "owner": "usuario-123"
}
```

Erros esperados:

| Status | Situação |
| --- | --- |
| `400` | Cabeçalho inválido, arquivo ausente ou arquivo vazio. |
| `413` | Arquivo maior que `MAX_FILE_SIZE_BYTES`. |
| `500` | Falha inesperada ao gravar o arquivo ou registrar os metadados. |

### `GET /documents`

- **Cabeçalho obrigatório:** `X-User-Id`
- **Sucesso:** `200 OK`
- **Resposta:** lista, possivelmente vazia, contendo somente documentos do usuário e ordenada por `uploadedAt` decrescente.

Exemplo:

```json
[
  {
	 "id": "identificador-gerado",
	 "originalName": "relatorio.pdf",
	 "size": 24832,
	 "uploadedAt": "2026-10-26T12:30:00.000Z",
	 "owner": "usuario-123"
  }
]
```

Erros esperados: `400` para cabeçalho inválido; `500` para falha inesperada.

### `GET /documents/:id/download`

- **Cabeçalho obrigatório:** `X-User-Id`
- **Sucesso:** `200 OK`, com o conteúdo binário do arquivo.
- A resposta deve indicar o tipo de conteúdo conhecido ou `application/octet-stream` e fornecer `Content-Disposition: attachment` com o nome original tratado com segurança.
- O arquivo deve ser transmitido sem carregar todo o conteúdo na memória.

Erros esperados:

| Status | Situação |
| --- | --- |
| `400` | Cabeçalho ou identificador inválido. |
| `404` | Documento inexistente, pertencente a outro usuário ou arquivo indisponível. |
| `500` | Falha inesperada de leitura. |

### `GET /health`

- **Sucesso:** `200 OK`

```json
{
  "status": "ok"
}
```

## 8. Decisões arquiteturais

- **Routes:** declaram endpoints e conectam middleware de upload e controllers.
- **Controllers:** validam aspectos HTTP, extraem cabeçalhos e parâmetros, chamam services e definem status e respostas.
- **Services:** aplicam regras de negócio, escopo por usuário e coordenação entre metadados e arquivos.
- **Repositories:** encapsulam a gravação/leitura no filesystem e os metadados mantidos em memória.
- A configuração de `multer` deve usar `diskStorage`, diretório configurável, nome interno seguro e limite de tamanho.
- O frontend deve consumir a API com `fetch`, pelo prefixo `/api`, e manter componentes separados para upload, listagem e download.
- A API não deve retornar `storedName`, caminhos locais ou detalhes de implementação.

## 9. Plano de execução

As etapas abaixo são planejamento futuro. Esta especificação não executa nem altera arquivos de aplicação.

1. **Consolidar configuração e contratos**
	- Arquivos planejados: documentação de configuração e contratos; testes de contrato do backend.
	- Critérios de aceite: valores padrão e validações de ambiente documentados; formatos de sucesso e erro definidos; premissa de `X-User-Id` explícita.

2. **Implementar persistência local e metadados**
	- Arquivos planejados: `backend/src/repositories/` para filesystem e memória; testes correspondentes.
	- Critérios de aceite: arquivo gravado somente no diretório local; metadados indexados por ID; nome original não controla caminho; falha de registro tenta remover arquivo órfão.

3. **Implementar regras de negócio**
	- Arquivos planejados: `backend/src/services/` para upload, listagem e obtenção de documento.
	- Critérios de aceite: escopo por usuário aplicado; listagem ordenada; metadados internos não expostos; falhas de arquivo tratadas.

4. **Implementar rotas e camada HTTP**
	- Arquivos planejados: `backend/src/routes/`, `backend/src/controllers/` e integração em `backend/src/app.js`.
	- Critérios de aceite: contratos desta especificação atendidos; upload usa `multer` com `diskStorage`; limites e códigos HTTP corretos; `/health` preservado.

5. **Construir a interface**
	- Arquivos planejados: `frontend/src/components/`, `frontend/src/pages/`, `frontend/src/services/` e integração em `frontend/src/App.jsx`.
	- Critérios de aceite: usuário consegue enviar, visualizar e baixar documentos; interface mostra estados de carregamento e erro; chamadas usam `/api` e `X-User-Id`.

6. **Integrar e validar o fluxo**
	- Arquivos planejados: `backend/test/` e, se adotado, testes do frontend.
	- Critérios de aceite: fluxo upload-listagem-download validado; usuário não acessa documentos de outro identificador; erros de tamanho, ausência de arquivo e arquivo indisponível cobertos; build do frontend e testes do backend aprovados.

7. **Revisar limites e documentação operacional**
	- Arquivos planejados: documentação do projeto e testes de configuração.
	- Critérios de aceite: execução local, variáveis de ambiente e limitações de persistência documentadas; nenhum provedor de armazenamento externo introduzido.
