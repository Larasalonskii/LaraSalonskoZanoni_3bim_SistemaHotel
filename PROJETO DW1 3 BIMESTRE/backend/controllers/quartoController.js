const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Listar todos os quartos com nome do tipo
exports.listarQuartos = async (req, res) => {
    try {
        const sql = `
            SELECT 
                q.id_quarto,
                q.capacidade_quarto,
                q.tipo_quarto_id,
                t.tipo_quarto_nome
            FROM public.quarto q
            LEFT JOIN public.tipo_quarto t 
                ON q.tipo_quarto_id = t.tipo_quarto_id
            ORDER BY q.id_quarto ASC
        `;
        const result = await query(sql);
        res.json({ sucesso: true, quartos: result.rows });
    } catch (error) {
        console.error('Erro ao listar quartos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar quartos.' });
    }
};

// Obter quarto por ID
exports.obterQuarto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const sql = `
            SELECT 
                q.id_quarto,
                q.capacidade_quarto,
                q.tipo_quarto_id,
                t.tipo_quarto_nome
            FROM public.quarto q
            LEFT JOIN public.tipo_quarto t 
                ON q.tipo_quarto_id = t.tipo_quarto_id
            WHERE q.id_quarto = $1
        `;

        const result = await query(sql, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Quarto não encontrado.' });
        }

        res.json({ sucesso: true, quarto: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter quarto:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Criar quarto
exports.criarQuarto = async (req, res) => {
    try {
        const { id_quarto, capacidade_quarto, tipo_quarto_id } = req.body;

        const sql = `
            INSERT INTO public.quarto (id_quarto, capacidade_quarto, tipo_quarto_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const values = [
            id_quarto,
            capacidade_quarto || null,
            tipo_quarto_id || null
        ];

        const result = await query(sql, values);
        res.status(201).json({ sucesso: true, mensagem: 'Quarto inserido com sucesso!', quarto: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar quarto:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'O tipo de quarto informado não existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir quarto no banco de dados.' });
    }
};

// Atualizar quarto
exports.atualizarQuarto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { capacidade_quarto, tipo_quarto_id } = req.body;

        const sql = `
            UPDATE public.quarto 
            SET capacidade_quarto = $1, 
                tipo_quarto_id = $2 
            WHERE id_quarto = $3
            RETURNING *
        `;

        const values = [
            capacidade_quarto || null,
            tipo_quarto_id || null,
            id
        ];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Quarto não encontrado.' });
        }

        res.json({ sucesso: true, mensagem: 'Quarto alterado com sucesso!', quarto: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar quarto:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'O tipo de quarto informado não existe no cadastro.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar quarto.' });
    }
};

// Upload e salvamento de imagem com Sharp
exports.uploadImagem = async (req, res) => {
    try {
        const id = req.params.id;
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        const pastaImagens = path.join(__dirname, '../../imagens');
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, { recursive: true });
        }

        const caminhoDestino = path.join(pastaImagens, `${id}.png`);

        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .toFormat('png')
            .toFile(caminhoDestino);

        res.json({ sucesso: true, mensagem: 'Imagem salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

// Deletar quarto
exports.deletarQuarto = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        await query('DELETE FROM public.quarto WHERE id_quarto = $1', [id]);

        const imgPath = path.join(__dirname, '../../imagens', `${id}.png`);
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
        }

        res.json({ sucesso: true, mensagem: 'Quarto excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar quarto:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir quarto.' });
    }
};