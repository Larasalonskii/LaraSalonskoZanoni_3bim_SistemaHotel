const express = require('express');
const multer = require('multer');
const router = express.Router();
const quartoController = require('../controllers/quartoController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/listar', quartoController.listarQuartos);
router.get('/:id', quartoController.obterQuarto);
router.post('/', quartoController.criarQuarto);
router.put('/:id', quartoController.atualizarQuarto);
router.delete('/:id', quartoController.deletarQuarto);
router.post('/upload/:id', upload.single('imagem'), quartoController.uploadImagem);

module.exports = router;