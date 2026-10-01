const { query } = require('../database');
const path = require('path');

exports.abrirCrudFuncionario = (req, res) => {
    const usuario = req.cookies ? req.cookies.usuarioLogado : null;
    if (usuario) {
        res.sendFile(path.join(__dirname, '../../frontend/funcionario/funcionario.html'));
    } else {
        res.redirect('/login');
    }
};

exports.listarFuncionarios = async (req, res) => {
    try {
        const result = await query(
            'SELECT func.pessoa_cpf_pessoa, p.nome_pessoa, func.salario_funcionario, func.cargo_id_cargo, func.porcentagem_comissao_funcionario ' +
            'FROM funcionario func, pessoa p WHERE func.pessoa_cpf_pessoa = p.cpf_pessoa ORDER BY func.pessoa_cpf_pessoa'
        );
        res.json({ sucesso: true, funcionarios: result.rows });
    } catch (error) {
        console.error('Erro ao listar funcionários:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
};

exports.criarFuncionario = async (req, res) => {
    try {
        const { pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario } = req.body;

        if (salario_funcionario === undefined || salario_funcionario === null || salario_funcionario === '') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O salário do funcionário é obrigatório'
            });
        }

        // Turnos extras vazios viram 0
        const turnos = (porcentagem_comissao_funcionario === undefined || porcentagem_comissao_funcionario === '')
            ? 0
            : porcentagem_comissao_funcionario;

        const result = await query(
            'INSERT INTO funcionario (pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario) VALUES ($1, $2, $3, $4) RETURNING *',
            [pessoa_cpf_pessoa, salario_funcionario, cargo_id_cargo, turnos]
        );

        res.status(201).json({ sucesso: true, funcionario: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar funcionário:', error);

        if (error.code === '23502') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Dados obrigatórios não fornecidos'
            });
        }

        if (error.code === '23505') {
            return res.status(409).json({ sucesso: false, mensagem: 'Esta pessoa já é funcionário' });
        }

        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Pessoa ou cargo informado não existe' });
        }

        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
};

exports.obterFuncionario = async (req, res) => {
    try {
        // O ID da pessoa é texto no banco, então não usamos parseInt
        const id = req.params.id;

        const result = await query(
            'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
        }

        res.json({ sucesso: true, funcionario: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter funcionário:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
};

exports.atualizarFuncionario = async (req, res) => {
    try {
        const id = req.params.id;
        const { salario_funcionario, cargo_id_cargo, porcentagem_comissao_funcionario } = req.body;

        const existente = await query(
            'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
            [id]
        );

        if (existente.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
        }

        const atual = existente.rows[0];

        const campos = {
            salario_funcionario: salario_funcionario !== undefined ? salario_funcionario : atual.salario_funcionario,
            cargo_id_cargo: cargo_id_cargo !== undefined ? cargo_id_cargo : atual.cargo_id_cargo,
            porcentagem_comissao_funcionario: (porcentagem_comissao_funcionario !== undefined && porcentagem_comissao_funcionario !== '')
                ? porcentagem_comissao_funcionario
                : atual.porcentagem_comissao_funcionario
        };

        const updateResult = await query(
            'UPDATE funcionario SET salario_funcionario = $1, cargo_id_cargo = $2, porcentagem_comissao_funcionario = $3 WHERE pessoa_cpf_pessoa = $4 RETURNING *',
            [campos.salario_funcionario, campos.cargo_id_cargo, campos.porcentagem_comissao_funcionario, id]
        );

        res.json({ sucesso: true, funcionario: updateResult.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
};

exports.deletarFuncionario = async (req, res) => {
    try {
        const id = req.params.id;

        const existente = await query(
            'SELECT * FROM funcionario WHERE pessoa_cpf_pessoa = $1',
            [id]
        );

        if (existente.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Funcionário não encontrado' });
        }

        await query('DELETE FROM funcionario WHERE pessoa_cpf_pessoa = $1', [id]);

        res.json({ sucesso: true, mensagem: 'Funcionário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não é possível deletar funcionário com dependências associadas'
            });
        }

        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
    }
};