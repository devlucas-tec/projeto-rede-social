# Projeto 01 — Rede Social

API REST com **Express 5 + TypeScript + Prisma + MySQL**, com middleware global de log, usuários e posts.

Este README é um tutorial do zero: criar o banco, subir o servidor e testar cada endpoint um por um.

---

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Instalar as dependências](#2-instalar-as-dependências)
3. [Criar o banco no MySQL](#3-criar-o-banco-no-mysql)
4. [Configurar o arquivo .env](#4-configurar-o-arquivo-env)
5. [Criar as tabelas com o Prisma](#5-criar-as-tabelas-com-o-prisma)
6. [Popular o banco](#6-popular-o-banco-opcional)
7. [Rodar o servidor](#7-rodar-o-servidor)
8. [Como testar (3 opções)](#8-como-testar-3-opções)
9. [Testando cada endpoint](#9-testando-cada-endpoint)
10. [Roteiro de teste completo](#10-roteiro-de-teste-completo)
11. [Entendendo o projeto](#11-entendendo-o-projeto)
12. [Problemas comuns](#12-problemas-comuns)

---

## 1. Pré-requisitos

| Ferramenta | Versão | Conferir com |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | vem com o Node | `npm -v` |
| MySQL | 8.x | `mysql --version` |

Se ainda não tem o MySQL, baixe o **MySQL Community Server** em <https://dev.mysql.com/downloads/mysql/>. No Windows, o `MySQL Installer` já traz o Workbench junto.

> **Windows:** se `mysql --version` der "comando não reconhecido", o MySQL está instalado mas não está no PATH. Você pode usar o **MySQL Workbench** ou o **MySQL 8.0 Command Line Client** (no menu Iniciar) em vez do terminal.

---

## 2. Instalar as dependências

Na raiz do projeto (a pasta onde está o `package.json`):

```bash
npm install
```

A primeira instalação demora um pouco mais porque o Prisma baixa os *engines* dele.

---

## 3. Criar o banco no MySQL

Abra o cliente do MySQL:

```bash
mysql -u root -p
```

Digite sua senha. Quando aparecer o prompt `mysql>`, rode:

```sql
CREATE DATABASE `bpw-lourdinas` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Confira se foi criado:

```sql
SHOW DATABASES;
```

O nome `bpw-lourdinas` deve aparecer na lista. Depois saia:

```sql
EXIT;
```

**Duas observações:**

As crases em volta de `` `bpw-lourdinas` `` são **obrigatórias**. O nome tem hífen e, sem as crases, o MySQL lê como uma subtração (`bpw` menos `lourdinas`) e devolve erro de sintaxe. Isso vale para qualquer comando SQL que cite o banco depois.

O `utf8mb4` é o que permite acentos e emojis nos posts sem virarem `????`.

---

## 4. Configurar o arquivo .env

O projeto vem com um `.env.example` (um molde, que vai para o Git) e **não** vem com o `.env` (o arquivo real, ignorado pelo Git). Você cria o seu:

```bash
# Linux / macOS / Git Bash
cp .env.example .env
```

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

Abra o `.env` no VS Code e coloque a **sua** senha do MySQL:

```env
PORT=3000
DATABASE_URL="mysql://root:MINHA_SENHA@localhost:3306/bpw-lourdinas"
```

Como ler essa URL:

```
mysql://usuário:senha@host:porta/nome_do_banco
```

**Cuidado com caracteres especiais na senha.** Se a sua senha tem `@`, `#`, `:`, `/` ou `?`, eles precisam ser codificados:

| Caractere | Vira |
|---|---|
| `@` | `%40` |
| `#` | `%23` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| espaço | `%20` |

Uma senha `p@ss#123` vira `p%40ss%23123` na URL. Esse é o erro nº 1 de quem está começando.

> **Windows:** o Bloco de Notas salva "`.env`" como `.env.txt` sem avisar, porque o Explorer esconde extensões conhecidas. Confira com `Get-ChildItem -Force -Name` no PowerShell. Se aparecer `.env.txt`, renomeie com `Rename-Item .env.txt .env`.

---

## 5. Criar as tabelas com o Prisma

```bash
npx prisma migrate dev --name init
```

O que acontece aqui: o Prisma lê o `prisma/schema.prisma`, gera o SQL correspondente, cria as tabelas `users` e `posts` no MySQL e gera o Prisma Client tipado. Uma pasta `prisma/migrations/` aparece com o SQL versionado.

Saída esperada, no fim:

```
Your database is now in sync with your schema.
✔ Generated Prisma Client
```

Para ver as tabelas:

```bash
npx prisma studio
```

Abre uma interface em `http://localhost:5555` mostrando o conteúdo do banco. É a forma mais fácil de confirmar que o que a API gravou realmente chegou no MySQL. Feche com `Ctrl+C`.

---

## 6. Popular o banco (opcional)

```bash
npm run seed
```

Cria 3 usuários e 3 posts para você ter com o que brincar:

| id | nome | email | senha |
|---|---|---|---|
| 1 | Winnicius | winni@gmail.com | 123456 |
| 2 | Joao Silva | joao@email.com | 123456 |
| 3 | Maria Santos | maria@email.com | 123456 |

O seed **apaga tudo** antes de inserir, então pode rodar quantas vezes quiser para voltar ao estado inicial. Os ids são auto-incremento e não voltam para 1 a cada execução — se você rodar o seed várias vezes, os ids vão ser 4, 5, 6 e assim por diante. Use `GET /users` para ver os ids atuais.

---

## 7. Rodar o servidor

```bash
npm run dev
```

Saída esperada:

```
Servidor rodando em http://localhost:3000
Health:  http://localhost:3000/health
```

Deixe esse terminal aberto — é nele que os logs vão aparecer. Para os testes, abra um **segundo terminal**.

O modo `dev` reinicia sozinho toda vez que você salvar um arquivo.

---

## 8. Como testar (3 opções)

### Opção A — Arquivo `api.http` (recomendado)

O projeto já vem com um `api.http` na raiz, com todas as requisições prontas.

1. No VS Code, instale a extensão **REST Client** (`humao.rest-client`)
2. Abra o `api.http`
3. Clique no **"Send Request"** que aparece acima de cada bloco
4. A resposta abre numa aba ao lado

É o jeito mais confortável, porque você não precisa escapar aspas nem lembrar sintaxe.

### Opção B — Navegador

Só funciona para as rotas **GET**. Basta abrir a URL. O Firefox formata JSON bonito por padrão; no Chrome, a extensão "JSON Viewer" ajuda.

### Opção C — Terminal

No Linux, macOS ou Git Bash, `curl` funciona normalmente.

**No PowerShell tem uma pegadinha:** `curl` lá é apelido do `Invoke-WebRequest` e a sintaxe com `-X` e `-d` não funciona. Você tem duas saídas:

- escrever `curl.exe` (com o `.exe` explícito), ou
- usar o `Invoke-RestMethod`, que é o comando nativo

Abaixo eu dou as três formas para cada endpoint.

---

## 9. Testando cada endpoint

### 9.1 — `GET /` (informações da API)

Abra no navegador: <http://localhost:3000/>

```bash
curl http://localhost:3000/
```

```powershell
Invoke-RestMethod http://localhost:3000/
```

Resposta (200):

```json
{
  "message": "Bem-vindo a API da Rede Social!",
  "timestamp": "2026-08-31T23:03:52.537Z",
  "status": "API funcionando!",
  "rotas": { "users": "/users", "posts": "/posts", "health": "/health" }
}
```

---

### 9.2 — `GET /health` (testa a conexão com o banco)

**Comece sempre por aqui.** Essa rota roda um `SELECT 1` no MySQL.

Navegador: <http://localhost:3000/health>

```bash
curl http://localhost:3000/health
```

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Resposta (200) — tudo certo:

```json
{ "status": "ok", "database": "conectado" }
```

Resposta (503) — o problema está no `DATABASE_URL` ou o MySQL não está rodando:

```json
{ "status": "erro", "database": "desconectado" }
```

---

### 9.3 — `GET /users` (listar usuários)

Navegador: <http://localhost:3000/users>

```bash
curl http://localhost:3000/users
```

```powershell
Invoke-RestMethod http://localhost:3000/users
```

Resposta (200):

```json
{
  "message": "Lista de usuarios (3)",
  "users": [
    { "id": 1, "nome": "Winnicius", "email": "winni@gmail.com", "criadoEm": "2026-08-31T23:00:00.000Z" },
    { "id": 2, "nome": "Joao Silva", "email": "joao@email.com", "criadoEm": "2026-08-31T23:00:00.000Z" },
    { "id": 3, "nome": "Maria Santos", "email": "maria@email.com", "criadoEm": "2026-08-31T23:00:00.000Z" }
  ]
}
```

Repare que **a senha não aparece**. Isso é intencional: o controller usa um `select` do Prisma listando só os campos públicos.

---

### 9.4 — `GET /users/:id` (um usuário com os posts dele)

Navegador: <http://localhost:3000/users/1>

```bash
curl http://localhost:3000/users/1
```

```powershell
Invoke-RestMethod http://localhost:3000/users/1
```

Resposta (200):

```json
{
  "user": {
    "id": 1,
    "nome": "Winnicius",
    "email": "winni@gmail.com",
    "criadoEm": "2026-08-31T23:00:00.000Z",
    "posts": [
      { "id": 2, "conteudo": "Estudando Prisma com MySQL hoje.", "criadoEm": "..." },
      { "id": 1, "conteudo": "Primeiro post da rede social!", "criadoEm": "..." }
    ]
  }
}
```

Esse array `posts` vindo junto é a **relação** do Prisma funcionando — o `select` aninhado faz o JOIN por baixo dos panos.

**Testes de erro:**

`GET /users/999` → 404 `{ "error": "Usuario nao encontrado." }`

`GET /users/abc` → 400 `{ "error": "O id precisa ser um numero." }`

---

### 9.5 — `POST /users` (criar usuário)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","email":"ana@email.com","senha":"123456"}'
```

```powershell
# PowerShell — Invoke-RestMethod
Invoke-RestMethod -Uri http://localhost:3000/users -Method Post `
  -ContentType "application/json" `
  -Body '{"nome":"Ana Souza","email":"ana@email.com","senha":"123456"}'
```

```powershell
# PowerShell — curl.exe (repare nas aspas escapadas)
curl.exe -X POST http://localhost:3000/users -H "Content-Type: application/json" -d "{\"nome\":\"Ana Souza\",\"email\":\"ana@email.com\",\"senha\":\"123456\"}"
```

Resposta (201):

```json
{
  "message": "Usuario criado com sucesso!",
  "user": { "id": 4, "nome": "Ana Souza", "email": "ana@email.com", "criadoEm": "..." }
}
```

**Testes de erro:**

Mandar o **mesmo email de novo** → 409 `{ "error": "Este email ja esta cadastrado." }`
Isso prova que o `@unique` do schema virou uma constraint real no MySQL.

Mandar body vazio `{}` → 400 `{ "error": "Os campos nome, email e senha sao obrigatorios." }`

> A senha é gravada com hash **bcrypt**, nunca em texto puro. Abra o `npx prisma studio` e veja: o campo `senha` guarda algo como `$2a$10$hhcfYZojhIx...`.

---

### 9.6 — `POST /users/login`

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"winni@gmail.com","senha":"123456"}'
```

```powershell
Invoke-RestMethod -Uri http://localhost:3000/users/login -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"winni@gmail.com","senha":"123456"}'
```

Resposta (200):

```json
{
  "message": "Login realizado com sucesso!",
  "user": { "id": 1, "nome": "Winnicius", "email": "winni@gmail.com" }
}
```

**Teste de erro** — troque a senha por qualquer coisa errada → 401 `{ "error": "Email ou senha invalidos." }`

A mensagem é **a mesma** para email inexistente e senha errada, de propósito: mensagens diferentes entregariam quais emails estão cadastrados no sistema.

---

### 9.7 — `PUT /users/:id` (atualizar)

Aceita `nome`, `email`, ou os dois. O que você não mandar continua com o valor antigo.

```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Winnicius Editado"}'
```

```powershell
Invoke-RestMethod -Uri http://localhost:3000/users/1 -Method Put `
  -ContentType "application/json" `
  -Body '{"nome":"Winnicius Editado"}'
```

Resposta (200):

```json
{
  "message": "Usuario atualizado!",
  "user": { "id": 1, "nome": "Winnicius Editado", "email": "winni@gmail.com", "criadoEm": "..." }
}
```

**Teste de erro:** `PUT /users/999` → 404 `{ "error": "Usuario nao encontrado." }`

---

### 9.8 — `GET /posts` (listar posts com o autor)

Navegador: <http://localhost:3000/posts>

```bash
curl http://localhost:3000/posts
```

```powershell
Invoke-RestMethod http://localhost:3000/posts
```

Resposta (200):

```json
{
  "message": "Lista de posts (3)",
  "posts": [
    {
      "id": 3,
      "conteudo": "Bom dia, pessoal!",
      "autorId": 2,
      "criadoEm": "...",
      "autor": { "id": 2, "nome": "Joao Silva" }
    }
  ]
}
```

Os posts vêm ordenados do mais recente para o mais antigo.

---

### 9.9 — `POST /posts` (criar post)

```bash
curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"conteudo":"Meu primeiro post!","autorId":1}'
```

```powershell
Invoke-RestMethod -Uri http://localhost:3000/posts -Method Post `
  -ContentType "application/json" `
  -Body '{"conteudo":"Meu primeiro post!","autorId":1}'
```

Resposta (201):

```json
{
  "message": "Post publicado!",
  "post": {
    "id": 4,
    "conteudo": "Meu primeiro post!",
    "autorId": 1,
    "criadoEm": "...",
    "autor": { "id": 1, "nome": "Winnicius" }
  }
}
```

**Testes de erro:**

`autorId` de um usuário que não existe (ex.: `999`) → 404 `{ "error": "Autor nao encontrado." }`

Body sem `conteudo` → 400 `{ "error": "Os campos conteudo e autorId sao obrigatorios." }`

---

### 9.10 — `DELETE /posts/:id`

```bash
curl -i -X DELETE http://localhost:3000/posts/1
```

```powershell
Invoke-WebRequest -Uri http://localhost:3000/posts/1 -Method Delete
```

Resposta: **204 No Content**, sem corpo. Isso é o correto para um delete bem-sucedido — por isso use `curl -i` ou `Invoke-WebRequest`, para conseguir ver o código de status.

**Teste de erro:** `DELETE /posts/999` → 404 `{ "error": "Post nao encontrado." }`

---

### 9.11 — `DELETE /users/:id`

```bash
curl -i -X DELETE http://localhost:3000/users/3
```

```powershell
Invoke-WebRequest -Uri http://localhost:3000/users/3 -Method Delete
```

Resposta: **204 No Content**.

**Faça este teste depois:** rode `GET /posts` e repare que os posts daquele usuário sumiram junto. Isso é o `onDelete: Cascade` do schema — o MySQL apaga os filhos automaticamente, sem precisar de código.

---

### 9.12 — Rota inexistente (404)

```bash
curl http://localhost:3000/qualquer-coisa
```

Resposta (404):

```json
{ "error": "Rota GET /qualquer-coisa nao existe." }
```

Uma API que devolve JSON no 404 (em vez do HTML padrão do Express) é bem mais fácil de consumir no front-end.

---

## 10. Roteiro de teste completo

Faça nesta ordem para ver a API inteira funcionando junto. **Mantenha o terminal do `npm run dev` à vista** enquanto testa.

| # | Requisição | Esperado | O que isso prova |
|---|---|---|---|
| 1 | `GET /health` | 200 `conectado` | O MySQL está respondendo |
| 2 | `GET /users` | 200, 3 usuários | O seed rodou |
| 3 | `POST /users` (email novo) | 201 | Criação funciona |
| 4 | `POST /users` (mesmo email) | 409 | O `@unique` virou constraint no banco |
| 5 | `POST /users` (body `{}`) | 400 | A validação está ativa |
| 6 | `POST /users/login` (senha certa) | 200 | O bcrypt compara o hash |
| 7 | `POST /users/login` (senha errada) | 401 | Não dá para entrar com qualquer coisa |
| 8 | `POST /posts` (autorId válido) | 201 | A chave estrangeira funciona |
| 9 | `POST /posts` (autorId 999) | 404 | Não cria post órfão |
| 10 | `GET /users/:id` | 200, com `posts[]` | A relação 1:N está montada |
| 11 | `PUT /users/:id` | 200 | Update funciona |
| 12 | `DELETE /users/:id` | 204 | Delete funciona |
| 13 | `GET /posts` | os posts dele sumiram | O `onDelete: Cascade` está ativo |
| 14 | `GET /naoexiste` | 404 JSON | O handler de 404 está no lugar certo |

Cada uma dessas requisições imprime duas linhas no terminal do servidor:

```
[31/08/2026, 23:04:11] --> POST /users
[31/08/2026, 23:04:11] <-- POST /users 201 (142ms)
```

A seta `-->` é o middleware de log interceptando a entrada; a `<--` sai quando a resposta termina, com o status e o tempo gasto.

No fim, abra o `npx prisma studio` e confira que o estado do banco bate com o que você fez pela API.

---

## 11. Entendendo o projeto

### Estrutura de pastas

```
projeto-01-rede-social/
├── prisma/
│   ├── schema.prisma          # os modelos do banco
│   └── seed.ts                # dados iniciais
├── src/
│   ├── controllers/           # a lógica de cada rota
│   │   ├── user.controller.ts
│   │   └── post.controller.ts
│   ├── lib/prisma.ts          # instância única do PrismaClient
│   ├── middlewares/logger.ts  # o middleware global de log
│   ├── routes/                # o mapeamento URL → controller
│   │   ├── user.routes.ts
│   │   └── post.routes.ts
│   └── server.ts              # ponto de entrada
├── api.http                   # requisições prontas (REST Client)
├── .env.example               # molde do .env (vai pro Git)
├── package.json
└── tsconfig.json
```

### O middleware global de log

Fica em `src/middlewares/logger.ts` e é registrado no `server.ts` **antes das rotas**:

```ts
app.use(logger)
```

Ele intercepta toda requisição, imprime método e rota, e chama `next()` para liberar o fluxo. Sem o `next()`, a requisição trava ali e o cliente fica pendurado até dar timeout.

**A ordem importa.** Middleware no Express roda na ordem em que é declarado. Se você mover o `app.use(logger)` para depois dos `app.get()`, ele só vai pegar as requisições que não casarem com nenhuma rota.

### O modelo de dados

```prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]           // um usuário tem vários posts
}

model Post {
  autorId Int
  autor   User @relation(fields: [autorId], references: [id], onDelete: Cascade)
}
```

O `@unique` no email vira uma constraint real no MySQL. O `onDelete: Cascade` faz o banco apagar os posts quando o autor é removido.

### Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor em modo desenvolvimento (reinicia ao salvar) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Roda a versão compilada |
| `npm run seed` | Popula o banco |
| `npm run prisma:migrate` | Cria/aplica migrations |
| `npm run prisma:studio` | Interface visual do banco |
| `npm run prisma:generate` | Regenera o Prisma Client |

---

## 12. Problemas comuns

**`Environment variable not found: DATABASE_URL`**
O `.env` não existe ou está com o nome errado. No PowerShell, `Get-ChildItem -Force -Name` mostra arquivos ocultos. Se aparecer `.env.txt`, renomeie para `.env`.

**`Can't reach database server at localhost:3306`**
O MySQL não está rodando.
Windows: `net start MySQL80` (ou pelo app "Serviços")
macOS: `brew services start mysql`
Linux: `sudo systemctl start mysql`

**`Access denied for user 'root'@'localhost'`**
Senha errada no `.env`, ou caractere especial não codificado (veja a tabela do passo 4).

**`Unknown database 'bpw-lourdinas'`**
Faltou o passo 3, ou o nome do banco no `.env` está escrito diferente do que você criou.

**`You have an error in your SQL syntax near '-lourdinas'`**
Faltaram as crases no `CREATE DATABASE`. Use `` CREATE DATABASE `bpw-lourdinas` ``.

**`@prisma/client did not initialize yet`**
Rode `npx prisma generate`.

**`warn The configuration property package.json#prisma is deprecated`**
É só um aviso, pode ignorar. Ele diz que essa forma de configurar o seed vai sair no Prisma 7. No 6.19.3 funciona normalmente.

**`EADDRINUSE: address already in use :::3000`**
Já tem algo na porta 3000 — provavelmente outro `npm run dev` esquecido aberto. Feche o outro terminal ou mude a `PORT` no `.env`.

**Mudei o `schema.prisma`, e agora?**
Rode `npx prisma migrate dev --name descricao_da_mudanca`. Ele gera uma nova migration e regenera o client.

**Quero zerar o banco e começar de novo**
`npx prisma migrate reset` apaga tudo, recria as tabelas e roda o seed.

---

## Nota sobre a versão do Prisma

O projeto está fixado no **Prisma 6.19.3** de propósito. O Prisma 7 mudou bastante: passou a exigir ES Modules, driver adapters e um arquivo `prisma.config.ts`, e a URL do banco saiu do `schema.prisma`. Nada disso é difícil, mas quebra a configuração CommonJS simples que este projeto usa. O guia oficial de migração está em <https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7>.

---

## Próximos passos sugeridos

- Autenticação com **JWT** (`jsonwebtoken`) em vez de devolver o usuário direto no login
- Validação de entrada com **Zod**, tirando os `if (!nome || !email)` dos controllers
- Paginação em `/users` e `/posts` com `skip` e `take` do Prisma
- Curtidas e comentários (novos models com relação)
- Testes automatizados com **Vitest** + **Supertest**