# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para enviar, listar e baixar documentos armazenados no filesystem local, com metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Enviar um arquivo por requisição.
- Listar os documentos registrados na instância.
- Baixar um documento pelo identificador.
- Registrar o identificador do dono nos metadados.
- Usar React + Vite no frontend e Node.js + Express no backend.

### Fora do escopo

- Armazenamento em nuvem ou em serviços externos.
- Banco de dados ou persistência de metadados após reinicialização.
- Versionamento de documentos.
- Autenticação e autorização por usuário nesta fase.
- Listagem isolada por usuário; a aplicação MVP é de instância local e uso único.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo por requisição `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema deve rejeitar requisições sem arquivo, arquivos vazios e arquivos acima do limite configurado. |
| RF-03 | O sistema deve gravar os arquivos em `backend/storage`, usando Multer com `diskStorage`. |
| RF-04 | Após gravar o arquivo, o sistema deve registrar seus metadados em memória e retornar o documento criado. |
| RF-05 | O sistema deve listar os metadados dos documentos registrados na instância, do mais recente para o mais antigo. |
| RF-06 | O sistema deve permitir baixar um documento pelo seu identificador, sem aceitar caminhos de arquivo fornecidos pelo cliente. |
| RF-07 | O download deve ser enviado como anexo, usando o nome original sanitizado para o cabeçalho de download. |
| RF-08 | O sistema deve responder com erro apropriado quando o identificador não existir ou o arquivo não puder ser lido. |
| RF-09 | O frontend deve permitir enviar, listar e baixar documentos por meio da API, usando o prefixo `/api`. |
| RF-10 | O endpoint `GET /health` deve continuar disponível para verificar a saúde do backend. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem permanecer exclusivamente no filesystem local da aplicação, gravados com Multer `diskStorage`. |
| RNF-02 | Os metadados devem ficar em memória; reiniciar o processo remove os registros, mas não necessariamente os arquivos já gravados. |
| RNF-03 | O diretório de armazenamento e o limite de upload devem ser configuráveis por variáveis de ambiente. |
| RNF-04 | O limite padrão proposto é 10 MiB por arquivo, configurável por `MAX_UPLOAD_SIZE_BYTES`. |
| RNF-05 | O backend deve gerar um nome interno único para o arquivo; o nome enviado pelo cliente não deve determinar o caminho de gravação. |
| RNF-06 | Erros de validação, upload, leitura e persistência devem ser tratados nos limites HTTP e retornados em formato consistente. |
| RNF-07 | A aplicação deve manter as dependências existentes sempre que possível e usar o runner nativo `node:test` no backend. |

## 5. Modelo de dados

Metadados mantidos em memória:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único do documento, gerado pelo backend. |
| `originalName` | string | Nome original do arquivo enviado. |
| `size` | number | Tamanho em bytes. |
| `uploadedAt` | string | Data e hora do upload em ISO 8601. |
| `owner` | string | Identificador do dono. No MVP local, usar `DMS_DEFAULT_OWNER`, com padrão `local-user`; não representa autenticação. |
| `mimeType` | string | Tipo MIME informado pelo upload, apenas para metadados e resposta de download. |
| `storageName` | string | Nome interno gerado para localizar o arquivo; campo privado, não exposto pela API. |

O `id` deve ser independente do nome original. A API não deve retornar `storageName` nem permitir que o cliente escolha o caminho do arquivo.

## 6. Contratos de API

Prefixo do backend: rotas sem `/api`. O proxy do Vite remove `/api` durante o desenvolvimento.

### `POST /upload`

- Entrada: `multipart/form-data`, campo `file`, um único arquivo.
- Validações: arquivo presente, não vazio e dentro de `MAX_UPLOAD_SIZE_BYTES`. Não há allowlist de MIME no MVP.
- Sucesso: `201 Created`, corpo com os metadados públicos do documento.
- Erros: `400` para arquivo ausente ou inválido; `413` para tamanho excedido; `500` para falha de gravação.

### `GET /documents`

- Entrada: sem parâmetros obrigatórios.
- Sucesso: `200 OK`, corpo `{ "documents": [...] }`, ordenado por `uploadedAt` decrescente.
- Cada item contém `id`, `originalName`, `size`, `uploadedAt`, `owner` e `mimeType`.
- Erro: `500` para falha inesperada ao listar.

### `GET /documents/:id/download`

- Entrada: identificador na URL.
- Sucesso: `200 OK`, conteúdo binário como anexo, com nome original sanitizado e tipo MIME registrado ou `application/octet-stream` como fallback.
- Erros: `404` se o registro ou arquivo não existir; `500` para outra falha de leitura.

### Formato de erro

Respostas de erro devem usar JSON no formato `{ "error": { "code": "CODIGO", "message": "Descrição" } }`. As mensagens devem ser em português e não devem expor caminhos locais ou detalhes internos.

### `GET /health`

- Sucesso: `200 OK`, corpo `{ "status": "ok" }`.

## 7. Decisões arquiteturais e riscos

- Backend em CommonJS e Clean Architecture simples: `routes -> controllers -> services -> repositories`.
- Rotas definem endpoints; controllers validam entrada HTTP e formatam respostas; services concentram regras de negócio; repositories coordenam metadados em memória e arquivos locais.
- Multer com `diskStorage` grava em `backend/storage`. O frontend usa componentes React funcionais e um serviço `fetch` em `frontend/src/services`, consumindo `/api`.
- O campo `owner` é apenas metadado no MVP. Sem autenticação, não há isolamento ou garantia de identidade entre usuários; JWT e permissões ficam para evolução futura.
- Como os metadados são voláteis, arquivos podem permanecer no disco sem registro após reinicialização. Recuperação e limpeza desses arquivos não fazem parte do MVP.
- O limite de 10 MiB é uma decisão inicial configurável; deve ser revisto conforme o uso esperado.

## 8. Plano de execução

### Etapa 1 - Especificação

- Arquivos: criar somente `docs/specs/dms-spec.md`.
- Aceite: documento contém escopo, requisitos, modelo de dados, contratos, decisões e etapas; nenhum arquivo de aplicação é implementado nesta etapa.

### Etapa 2 - Backend

- Arquivos planejados: `backend/src/routes/`, `backend/src/controllers/`, `backend/src/services/`, `backend/src/repositories/`, `backend/src/app.js` e `backend/test/app.test.js`.
- Implementar upload local, listagem, download, validações e tratamento de erros conforme os contratos.
- Aceite: `npm test` passa; testes cobrem upload válido e inválido, listagem, download, documento inexistente e falhas relevantes de armazenamento.

### Etapa 3 - Frontend

- Arquivos planejados: `frontend/src/components/UploadComponent.jsx`, `DocumentList.jsx`, `DownloadButton.jsx`, serviço em `frontend/src/services/` e `frontend/src/App.jsx`.
- Implementar envio, exibição da lista, estados de carregamento/erro e ação de download usando `/api`.
- Aceite: a interface permite enviar, visualizar e baixar documentos; erros da API são apresentados sem interromper o uso da página.

### Etapa 4 - Integração e validação

- Arquivos planejados: ajustes pontuais nos arquivos das etapas anteriores, se necessários.
- Validar o fluxo integrado com backend e frontend em execução local.
- Aceite: um arquivo enviado aparece na lista e pode ser baixado; as respostas de erro e o endpoint de saúde funcionam conforme especificado.

### Etapa 5 - Evolução opcional

- Arquivos: a definir em especificação própria.
- Avaliar autenticação, autorização por usuário e persistência de metadados sem substituir o armazenamento local de arquivos.
- Aceite: etapa fora do MVP; só iniciar após definir requisitos e atualizar esta especificação.