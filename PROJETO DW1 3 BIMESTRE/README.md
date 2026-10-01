# 🏨 Sistema de Gerenciamento de Hotel

Projeto da disciplina **Desenvolvimento Web 1 (DW1)** — 3º bimestre.

Sistema web para gerenciar os dados de um hotel, com operações de **cadastro, consulta, alteração e exclusão (CRUD)** de quartos, tipos de quarto, pessoas, clientes, funcionários e cargos. Possui um menu inicial que leva a cada tela e permite enviar uma foto para cada tipo de quarto.

> **Autor(a):** [seu nome aqui]
> **Turma / Curso:** [preencher]
> **Professor(a):** [preencher]

---

## ✨ Funcionalidades

- **Menu principal** com acesso a todos os cadastros.
- **CRUD de Quarto:** número do quarto, capacidade e tipo. A foto do tipo aparece automaticamente ao selecionar o tipo.
- **CRUD de Tipo de Quarto:** nível de conforto (Standard, Superior, Luxo) e **upload da foto** de cada tipo.
- **CRUD de Pessoa:** dados pessoais, com a opção de marcar a pessoa como **cliente** e/ou **funcionário** (relação um para um).
- **CRUD de Cliente** e **CRUD de Funcionário:** dados específicos de cada papel.
- **CRUD de Cargo:** cargos disponíveis para os funcionários.
- **Imagens inteligentes:** exibe um *skeleton* enquanto a foto carrega e uma *silhueta* quando o tipo ainda não tem foto.
- Upload de imagens convertido automaticamente para **PNG 300×300**.

---

## 🛠️ Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (puro, sem frameworks) |
| Backend | Node.js, Express |
| Banco de dados | PostgreSQL |
| Bibliotecas | `cors`, `dotenv`, `multer` (upload), `sharp` (processamento de imagem), `pg` |

---

## 📁 Estrutura do projeto

```
PROJETO DW1 3 BIMESTRE/
├── backend/
│   ├── controllers/        # Regras de cada entidade (quarto, tipo_quarto, pessoa...)
│   ├── routes/             # Rotas da API
│   ├── imagens/
│   │   └── tipos/          # Fotos dos tipos de quarto (tipo_1.png, silhueta.png, skeleton.svg...)
│   ├── database.js         # Conexão com o PostgreSQL
│   ├── server.js           # Servidor Express
│   └── .env                # Variáveis de ambiente (não vai pro Git)
├── frontend/               # Telas de cada CRUD (HTML, CSS e JS)
├── documentacao/           # Documentos do projeto
├── index.html              # Menu principal
├── package.json
└── README.md
```

---

## 🗄️ Modelo de dados

```
pessoa (cpf_pessoa PK, nome_pessoa, data_nascimento_pessoa, endereco_pessoa, senha_pessoa, email_pessoa)

cliente (pessoa_cpf_pessoa PK/FK → pessoa, data_cadastro_cliente, frequencia_cliente)

funcionario (pessoa_cpf_pessoa PK/FK → pessoa, salario_funcionario,
             turnos_extras_funcionario, cargo_id_cargo FK → cargo)

cargo (id_cargo PK, nome_cargo)

tipo_quarto (tipo_quarto_id PK, tipo_quarto_nome)

quarto (id_quarto PK, capacidade_quarto, tipo_quarto_id FK → tipo_quarto)
```

**Regras de negócio**

- O **tipo do quarto** indica apenas o nível de conforto (**Standard, Superior ou Luxo**). Ele **não define** a quantidade de hóspedes: isso fica na **capacidade** do próprio quarto.
- A foto pertence ao **tipo**, e não ao quarto. Todos os quartos do mesmo tipo mostram a mesma foto.
- Uma pessoa pode ser cliente, funcionário, ambos ou nenhum.
- Um tipo de quarto só pode ser excluído se nenhum quarto estiver usando ele.

---

## 🚀 Como executar

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [PostgreSQL](https://www.postgresql.org/)
- Um editor com **Live Server** (ex.: VS Code) para abrir o frontend

### 2. Instalar as dependências

Na raiz do projeto:

```bash
npm install
```

### 3. Criar o banco de dados

1. Crie um banco vazio no PostgreSQL (ex.: `hotel`).
2. Execute o script `banco_hotel.sql` nesse banco (pelo pgAdmin, DBeaver ou `psql`). Ele cria as tabelas e já insere os dados de exemplo.

```bash
psql -U seu_usuario -d hotel -f banco_hotel.sql
```

> ⚠️ O script começa com `DROP TABLE`, então ele **recria tudo do zero** e apaga os dados que já existirem.

### 4. Configurar o `.env`

Crie o arquivo `.env` dentro da pasta `backend/` (ajuste os valores para o seu ambiente):

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=hotel
```

> Os nomes das variáveis devem ser os mesmos usados no `database.js`.

### 5. Iniciar o servidor

```bash
node backend/server.js
```

Se tudo estiver certo, o terminal mostra:

```
🚀 Servidor executando na porta 3001
✅ Banco de Dados hotel conectado com sucesso!
```

### 6. Abrir o frontend

Abra o `index.html` (menu principal) com o **Live Server**. Pelo menu você acessa cada CRUD.

---

## 🔌 Rotas da API

Servidor em `http://localhost:3001`.

### Quarto — `/quarto`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/quarto/listar` | Lista os quartos (com o nome do tipo) |
| GET | `/quarto/:id` | Busca um quarto |
| POST | `/quarto` | Cadastra um quarto |
| PUT | `/quarto/:id` | Altera um quarto |
| DELETE | `/quarto/:id` | Exclui um quarto |

### Tipo de Quarto — `/tipo_quarto`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/tipo_quarto/listar` | Lista os tipos |
| GET | `/tipo_quarto/:id` | Busca um tipo |
| POST | `/tipo_quarto` | Cadastra um tipo |
| PUT | `/tipo_quarto/:id` | Altera o nome do tipo |
| DELETE | `/tipo_quarto/:id` | Exclui um tipo |
| POST | `/tipo_quarto/upload/:id` | Envia a foto do tipo (campo `imagem`, `multipart/form-data`) |

### Pessoa — `/pessoa`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/pessoa` | Lista as pessoas |
| GET | `/pessoa/:id` | Busca uma pessoa |
| POST | `/pessoa` | Cadastra uma pessoa |
| PUT | `/pessoa/:id` | Altera uma pessoa |
| DELETE | `/pessoa/:id` | Exclui uma pessoa |

### Cliente — `/cliente` e Funcionário — `/funcionario`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/cliente` · `/funcionario` | Lista |
| GET | `/cliente/:id` · `/funcionario/:id` | Busca pelo ID da pessoa |
| POST | `/cliente` · `/funcionario` | Cadastra |
| PUT | `/cliente/:id` · `/funcionario/:id` | Altera |
| DELETE | `/cliente/:id` · `/funcionario/:id` | Exclui |

### Cargo — `/cargo`

CRUD de cargos, com listagem em `GET /cargo/listar`.

### Imagens estáticas

As fotos ficam disponíveis em `http://localhost:3001/imagens/tipos/tipo_<id>.png`.

---

## 🖼️ Como funcionam as imagens

1. No **CRUD de Tipo de Quarto**, clique em **Alterar** (ou **Inserir**), clique na imagem e escolha uma foto.
2. Ao salvar, o backend converte a imagem para **PNG 300×300** e grava em `backend/imagens/tipos/tipo_<id>.png`.
3. No **CRUD de Quarto**, ao escolher ou buscar um tipo, a foto correspondente é exibida automaticamente (somente leitura).
4. Se o tipo ainda não tem foto, aparece a **silhueta** (`silhueta.png`). Enquanto a foto carrega, aparece o **skeleton** (`skeleton.svg`).

---

## 🧪 Dados de exemplo

O script do banco já inclui:

- **20 pessoas** com IDs de 1 a 20 (1 a 10 são clientes e 11 a 20 são funcionários);
- **10 cargos** (Recepcionista, Camareira, Gerente...);
- **3 tipos de quarto** (Standard, Superior e Luxo);
- **10 quartos** com capacidades variadas.

---

## 🩺 Problemas comuns

| Problema | Solução |
|---|---|
| `Servidor offline` na tela | Confirme se o `node backend/server.js` está rodando |
| Erro de conexão com o banco | Confira o `.env` e se o PostgreSQL está ativo |
| `Cannot find module 'sharp'` | Rode `npm install sharp` |
| A foto do tipo não atualiza | Recarregue com **Ctrl+Shift+R** (cache do navegador) |
| Imagem não aparece | Abra `http://localhost:3001/imagens/tipos/tipo_1.png` para ver se o arquivo existe |
| CORS bloqueando requisições | Verifique se o `cors()` está ativo no `server.js` |

---

## 📌 Observações

- As senhas são armazenadas em texto simples, apenas para fins didáticos. Em um sistema real, use hash (ex.: bcrypt).
- O campo `cpf_pessoa` funciona hoje como um **ID simples** (1, 2, 3...), pois a coluna é do tipo texto.

---

## 👩‍💻 Autoria

Desenvolvido por **[seu nome]** como trabalho do 3º bimestre de DW1.

© 2026 — Sistema CRUD Hotel. Todos os direitos reservados.