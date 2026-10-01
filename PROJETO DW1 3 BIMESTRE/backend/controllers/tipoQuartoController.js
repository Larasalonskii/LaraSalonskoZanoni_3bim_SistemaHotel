const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

exports.listarTipos = async (req, res) => {
    try {
        const sql = 'SELECT tipo_quarto_id, tipo_quarto_nome FROM public.tipo_quarto ORDER BY tipo_quarto_id ASC';
        const result = await query(sql);
        res.json({ sucesso: true, unidades: result.rows });
    } catch (error) {
        console.error('Erro ao listar tipos de quarto:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar tipos de quarto.' });
    }
};

exports.uploadImagemTipo = async (req, res) => {
    try {
        const id = req.params.id;
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        // Aponta para a pasta imagens/tipos na raiz do projeto
        const pastaImagens = path.join(__dirname, '../imagens/tipos');
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, { recursive: true });
        }

        const caminhoDestino = path.join(pastaImagens, `tipo_${id}.png`);

        await sharp(req.file.buffer)
            .resize(300, 300, { fit: 'cover' })
            .toFormat('png')
            .toFile(caminhoDestino);

        console.log(`✅ Imagem salva com sucesso em: ${caminhoDestino}`);
        res.json({ sucesso: true, mensagem: 'Imagem do tipo salva com sucesso!' });
    } catch (error) {
        console.error('❌ Erro ao salvar imagem do tipo:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

exports.buscarTipo = async (req, res) => {
    try {
        const r = await query('SELECT tipo_quarto_id, tipo_quarto_nome FROM public.tipo_quarto WHERE tipo_quarto_id = $1', [req.params.id]);
        if (r.rows.length === 0) return res.status(404).json({ sucesso: false, mensagem: 'Tipo não encontrado.' });
        res.json({ sucesso: true, tipo: r.rows[0] });
    } catch (e) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar tipo.' });
    }
};

exports.inserirTipo = async (req, res) => {
    try {
        const { tipo_quarto_id, tipo_quarto_nome } = req.body;
        await query('INSERT INTO public.tipo_quarto (tipo_quarto_id, tipo_quarto_nome) VALUES ($1, $2)', [tipo_quarto_id, tipo_quarto_nome]);
        res.status(201).json({ sucesso: true });
    } catch (e) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir tipo.' });
    }
};

exports.alterarTipo = async (req, res) => {
    try {
        await query('UPDATE public.tipo_quarto SET tipo_quarto_nome = $1 WHERE tipo_quarto_id = $2', [req.body.tipo_quarto_nome, req.params.id]);
        res.json({ sucesso: true });
    } catch (e) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao alterar tipo.' });
    }
};

exports.excluirTipo = async (req, res) => {
    try {
        await query('DELETE FROM public.tipo_quarto WHERE tipo_quarto_id = $1', [req.params.id]);
        res.json({ sucesso: true });
    } catch (e) {
        const msg = e.code === '23503' ? 'Existem quartos usando este tipo.' : 'Erro ao excluir tipo.';
        res.status(400).json({ sucesso: false, mensagem: msg });
    }
};