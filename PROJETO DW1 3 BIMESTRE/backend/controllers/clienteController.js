const { query } = require('../database');
const path = require('path');

exports.abrirCrudCliente = (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/cliente/cliente.html'));
};

exports.listarClientes = async (req, res) => {
    try {
        const result = await query(
            'SELECT cli.pessoa_cpf_pessoa, p.nome_pessoa, cli.renda_cliente, cli.data_cadastro_cliente ' +
            'FROM cliente cli, pessoa p WHERE cli.pessoa_cpf_pessoa = p.cpf_pessoa ORDER BY cli.pessoa_cpf_pessoa'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar clientes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.criarCliente = async (req, res) => {
    try {
        const { pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente } = req.body;

        if (renda_cliente === undefined || renda_cliente === null || renda_cliente === '') {
            return res.status(400).json({ error: 'A renda do cliente é obrigatória' });
        }

        const result = await query(
            'INSERT INTO cliente (pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente) VALUES ($1, $2, $3) RETURNING *',
            [pessoa_cpf_pessoa, renda_cliente, data_cadastro_cliente]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);

        if (error.code === '23502') {
            return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
        }

        if (error.code === '23505') {
            return res.status(409).json({ error: 'Esta pessoa já é cliente' });
        }

        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.obterCliente = async (req, res) => {
    try {
        // O ID da pessoa é texto no banco, então não usamos parseInt
        const id = req.params.id;

        const result = await query(
            'SELECT * FROM cliente WHERE pessoa_cpf_pessoa = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao obter cliente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.atualizarCliente = async (req, res) => {
    try {
        const id = req.params.id;
        const { renda_cliente, data_cadastro_cliente } = req.body;

        const updateResult = await query(
            'UPDATE cliente SET renda_cliente = $1, data_cadastro_cliente = $2 WHERE pessoa_cpf_pessoa = $3 RETURNING *',
            [renda_cliente, data_cadastro_cliente, id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        res.json(updateResult.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

exports.deletarCliente = async (req, res) => {
    const id = req.params.id;

    try {
        const existente = await query(
            'SELECT * FROM cliente WHERE pessoa_cpf_pessoa = $1',
            [id]
        );

        if (existente.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        await query('DELETE FROM cliente WHERE pessoa_cpf_pessoa = $1', [id]);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);

        if (error.code === '23503') {
            return res.status(409).json({
                error: 'Erro de integridade referencial - o cliente não pode ser excluído, pois está associado a outras entidades.'
            });
        }

        res.status(500).json({ error: 'Erro interno do servidor ao tentar excluir o cliente.' });
    }
};