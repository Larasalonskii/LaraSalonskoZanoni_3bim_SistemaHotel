-- ============================================
-- 1. CRIAÇÃO DAS TABELAS (ORDEM CORRETA)
-- ============================================

-- 1. Tabelas com dependências (possuem FKs)
DROP TABLE IF EXISTS public.cliente CASCADE;
DROP TABLE IF EXISTS public.funcionario CASCADE;
DROP TABLE IF EXISTS public.quarto CASCADE;

-- 2. Tabelas sem dependências (tabelas base)
DROP TABLE IF EXISTS public.pessoa CASCADE;
DROP TABLE IF EXISTS public.cargo CASCADE;
DROP TABLE IF EXISTS public.tipo_quarto CASCADE;

-- 3. Sequences
DROP SEQUENCE IF EXISTS public.cargo_id_cargo_seq CASCADE;
DROP SEQUENCE IF EXISTS public.tipo_quarto_tipo_quarto_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.quarto_id_quarto_seq CASCADE;

-- Tabelas sem dependências (primeiro)
CREATE TABLE public.pessoa (
    cpf_pessoa character varying(20) NOT NULL,
    nome_pessoa character varying(60),
    data_nascimento_pessoa date,
    endereco_pessoa character varying(150),
    senha_pessoa character varying(50),
    email_pessoa character varying(75)
);

CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    nome_cargo character varying(45)
);

-- tipo_quarto agora indica apenas o NÍVEL DE CONFORTO (Standard, Superior, Luxo).
-- A quantidade de pessoas fica somente em quarto.capacidade_quarto.
CREATE TABLE public.tipo_quarto (
    tipo_quarto_id integer NOT NULL,
    tipo_quarto_nome character varying(50)
);

-- Tabelas com dependências (possuem FK)
CREATE TABLE public.cliente (
    pessoa_cpf_pessoa character varying(20) NOT NULL,
    data_cadastro_cliente date,
    renda_cliente numeric(10,2)
);

CREATE TABLE public.funcionario (
    pessoa_cpf_pessoa character varying(20) NOT NULL,
    salario_funcionario double precision,
    porcentagem_comissao_funcionario numeric (5,2),
    cargo_id_cargo integer
);

CREATE TABLE public.quarto (
    id_quarto integer NOT NULL,
    capacidade_quarto integer,
    tipo_quarto_id integer
);

-- ============================================
-- 2. SEQUENCES
-- ============================================

CREATE SEQUENCE public.cargo_id_cargo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.tipo_quarto_tipo_quarto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.quarto_id_quarto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ============================================
-- 3. ALTERS PARA DEFAULTS DAS SEQUENCES
-- ============================================

ALTER SEQUENCE public.cargo_id_cargo_seq OWNED BY public.cargo.id_cargo;
ALTER SEQUENCE public.tipo_quarto_tipo_quarto_id_seq OWNED BY public.tipo_quarto.tipo_quarto_id;
ALTER SEQUENCE public.quarto_id_quarto_seq OWNED BY public.quarto.id_quarto;

ALTER TABLE ONLY public.cargo ALTER COLUMN id_cargo SET DEFAULT nextval('public.cargo_id_cargo_seq'::regclass);
ALTER TABLE ONLY public.tipo_quarto ALTER COLUMN tipo_quarto_id SET DEFAULT nextval('public.tipo_quarto_tipo_quarto_id_seq'::regclass);
ALTER TABLE ONLY public.quarto ALTER COLUMN id_quarto SET DEFAULT nextval('public.quarto_id_quarto_seq'::regclass);

-- ============================================
-- 4. CONSTRAINTS (CHAVES PRIMÁRIAS E ESTRANGEIRAS)
-- ============================================

-- Chaves Primárias
ALTER TABLE ONLY public.pessoa ADD CONSTRAINT pessoa_pkey PRIMARY KEY (cpf_pessoa);
ALTER TABLE ONLY public.cargo ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);
ALTER TABLE ONLY public.tipo_quarto ADD CONSTRAINT tipo_quarto_pkey PRIMARY KEY (tipo_quarto_id);
ALTER TABLE ONLY public.cliente ADD CONSTRAINT cliente_pkey PRIMARY KEY (pessoa_cpf_pessoa);
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT funcionario_pkey PRIMARY KEY (pessoa_cpf_pessoa);
ALTER TABLE ONLY public.quarto ADD CONSTRAINT quarto_pkey PRIMARY KEY (id_quarto);

-- Chaves Estrangeiras
ALTER TABLE ONLY public.cliente ADD CONSTRAINT fk_cliente_pessoa FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES public.pessoa (cpf_pessoa);

ALTER TABLE ONLY public.funcionario ADD CONSTRAINT fk_funcionario_pessoa FOREIGN KEY (pessoa_cpf_pessoa) REFERENCES public.pessoa (cpf_pessoa);
ALTER TABLE ONLY public.funcionario ADD CONSTRAINT fk_funcionario_cargo FOREIGN KEY (cargo_id_cargo) REFERENCES public.cargo (id_cargo);

ALTER TABLE ONLY public.quarto ADD CONSTRAINT fk_quarto_tipo_quarto FOREIGN KEY (tipo_quarto_id) REFERENCES public.tipo_quarto (tipo_quarto_id);

-- ============================================
-- 5. INSERTS
-- ============================================

-- 5.1 PESSOA (IDs simples de 1 a 20. Valores em ordem: id, nome, data_nascimento, endereco, SENHA, EMAIL)
INSERT INTO public.pessoa VALUES ('1', 'João Silva', '1985-05-15', 'Rua das Flores, 123', 'senha123', 'joao@email.com');
INSERT INTO public.pessoa VALUES ('2', 'Maria Souza', '1990-08-20', 'Av. Brasil, 456', 'senha123', 'maria@email.com');
INSERT INTO public.pessoa VALUES ('3', 'Carlos Pereira', '1988-02-10', 'Rua XV de Novembro, 789', 'senha123', 'carlos@email.com');
INSERT INTO public.pessoa VALUES ('4', 'Ana Lima', '1995-12-05', 'Alameda dos Anjos, 101', 'senha123', 'ana@email.com');
INSERT INTO public.pessoa VALUES ('5', 'Fernanda Costa', '1992-07-22', 'Rua do Bosque, 55', 'senha123', 'fernanda@email.com');
INSERT INTO public.pessoa VALUES ('6', 'Lucas Mendes', '1989-03-14', 'Av. Paraná, 200', 'senha123', 'lucas@email.com');
INSERT INTO public.pessoa VALUES ('7', 'Juliana Rocha', '1994-11-30', 'Rua São Paulo, 340', 'senha123', 'juliana@email.com');
INSERT INTO public.pessoa VALUES ('8', 'Roberto Alves', '1980-01-25', 'Av. São João, 500', 'senha123', 'roberto@email.com');
INSERT INTO public.pessoa VALUES ('9', 'Patrícia Gomes', '1997-09-18', 'Rua Castro Alves, 88', 'senha123', 'patricia@email.com');
INSERT INTO public.pessoa VALUES ('10', 'Marcos Oliveira', '1983-06-12', 'Rua Alvorada, 12', 'senha123', 'marcos@email.com');
INSERT INTO public.pessoa VALUES ('11', 'Beatriz Santos', '1998-04-05', 'Av. das Américas, 99', 'senha123', 'beatriz@email.com');
INSERT INTO public.pessoa VALUES ('12', 'Diego Ferreira', '1991-08-17', 'Rua Paraná, 777', 'senha123', 'diego@email.com');
INSERT INTO public.pessoa VALUES ('13', 'Camila Martins', '1996-02-28', 'Av. Rio Branco, 404', 'senha123', 'camila@email.com');
INSERT INTO public.pessoa VALUES ('14', 'Gabriel Ribeiro', '1993-10-10', 'Rua Goiás, 150', 'senha123', 'gabriel@email.com');
INSERT INTO public.pessoa VALUES ('15', 'Larissa Barbosa', '1999-05-01', 'Av. Curitiba, 303', 'senha123', 'larissa@email.com');
INSERT INTO public.pessoa VALUES ('16', 'Thiago Cardoso', '1987-12-19', 'Rua Maringá, 808', 'senha123', 'thiago@email.com');
INSERT INTO public.pessoa VALUES ('17', 'Vanessa Carmo', '1994-03-22', 'Av. Londrina, 121', 'senha123', 'vanessa@email.com');
INSERT INTO public.pessoa VALUES ('18', 'Felipe Teixeira', '1990-11-08', 'Rua das Palmeiras, 45', 'senha123', 'felipe@email.com');
INSERT INTO public.pessoa VALUES ('19', 'Amanda Nogueira', '1995-07-14', 'Av. Independência, 67', 'senha123', 'amanda@email.com');
INSERT INTO public.pessoa VALUES ('20', 'Rodrigo Ramos', '1986-01-31', 'Rua dos Pinheiros, 89', 'senha123', 'rodrigo@email.com');

-- 5.2 CARGO (10 registros)
INSERT INTO public.cargo VALUES (1, 'Recepcionista');
INSERT INTO public.cargo VALUES (2, 'Camareira');
INSERT INTO public.cargo VALUES (3, 'Gerente');
INSERT INTO public.cargo VALUES (4, 'Mensageiro');
INSERT INTO public.cargo VALUES (5, 'Cozinheiro');
INSERT INTO public.cargo VALUES (6, 'Garçom');
INSERT INTO public.cargo VALUES (7, 'Segurança');
INSERT INTO public.cargo VALUES (8, 'Auxiliar de Limpeza');
INSERT INTO public.cargo VALUES (9, 'Manutencista');
INSERT INTO public.cargo VALUES (10, 'Subgerente');

-- 5.3 TIPO_QUARTO (3 registros: apenas nível de conforto)
INSERT INTO public.tipo_quarto VALUES (1, 'Standard');
INSERT INTO public.tipo_quarto VALUES (2, 'Superior');
INSERT INTO public.tipo_quarto VALUES (3, 'Luxo');

-- 5.4 CLIENTE (10 registros)
INSERT INTO public.cliente VALUES ('1', '2024-01-10', 3500.00);
INSERT INTO public.cliente VALUES ('2', '2024-02-15', 2800.00);
INSERT INTO public.cliente VALUES ('3', '2024-05-20', 4200.00);
INSERT INTO public.cliente VALUES ('4', '2024-06-01', 5100.00);
INSERT INTO public.cliente VALUES ('5', '2024-06-12', 3000.00);
INSERT INTO public.cliente VALUES ('6', '2024-07-04', 6500.00);
INSERT INTO public.cliente VALUES ('7', '2024-08-19', 2500.00);
INSERT INTO public.cliente VALUES ('8', '2024-09-02', 7200.00);
INSERT INTO public.cliente VALUES ('9', '2024-10-11', 3900.00);
INSERT INTO public.cliente VALUES ('10', '2024-11-25', 4800.00);

-- 5.5 FUNCIONARIO (10 registros)
INSERT INTO public.funcionario VALUES ('11', 4500.00, 5.00, 3);
INSERT INTO public.funcionario VALUES ('12', 2100.00, 2.50, 1);
INSERT INTO public.funcionario VALUES ('13', 1800.00, 0.00, 2);
INSERT INTO public.funcionario VALUES ('14', 1900.00, 0.00, 4);
INSERT INTO public.funcionario VALUES ('15', 2800.00, 3.00, 5);
INSERT INTO public.funcionario VALUES ('16', 1700.00, 0.00, 6);
INSERT INTO public.funcionario VALUES ('17', 2500.00, 4.00, 7);
INSERT INTO public.funcionario VALUES ('18', 1600.00, 0.00, 8);
INSERT INTO public.funcionario VALUES ('19', 2300.00, 1.50, 9);
INSERT INTO public.funcionario VALUES ('20', 3800.00, 6.00, 10);

-- 5.6 QUARTO (10 registros: id, capacidade, tipo_quarto_id)
-- Capacidades mantidas; tipos reapontados para Standard(1), Superior(2) e Luxo(3).
INSERT INTO public.quarto VALUES (101, 1, 1);
INSERT INTO public.quarto VALUES (102, 2, 1);
INSERT INTO public.quarto VALUES (103, 2, 3);
INSERT INTO public.quarto VALUES (104, 2, 2);
INSERT INTO public.quarto VALUES (201, 4, 3);
INSERT INTO public.quarto VALUES (202, 4, 1);
INSERT INTO public.quarto VALUES (203, 5, 3);
INSERT INTO public.quarto VALUES (204, 2, 2);
INSERT INTO public.quarto VALUES (301, 2, 2);
INSERT INTO public.quarto VALUES (302, 2, 3);

-- ============================================
-- 6. AJUSTE DAS SEQUENCES (evita conflito de ID em novos inserts)
-- ============================================
SELECT setval('public.cargo_id_cargo_seq', (SELECT MAX(id_cargo) FROM public.cargo));
SELECT setval('public.tipo_quarto_tipo_quarto_id_seq', (SELECT MAX(tipo_quarto_id) FROM public.tipo_quarto));
SELECT setval('public.quarto_id_quarto_seq', (SELECT MAX(id_quarto) FROM public.quarto));