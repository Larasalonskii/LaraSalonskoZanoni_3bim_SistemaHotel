const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importa a função de consulta do banco
const { query } = require('./database');

// Importa as rotas
const quartoRoutes = require('./routes/quartoRoutes');
const tipoQuartoRoutes = require('./routes/tipoQuartoRoutes'); // <-- ADICIONADO
const cargoRoutes = require('./routes/cargoRoutes');
const pessoaRoutes = require('./routes/pessoaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir imagens estáticas
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

// Definir Rotas
app.use('/quarto', quartoRoutes);
app.use('/tipo_quarto', tipoQuartoRoutes); // <-- ADICIONADO
app.use('/cargo', cargoRoutes);
app.use('/pessoa', pessoaRoutes);
app.use('/cliente', clienteRoutes);
app.use('/funcionario', funcionarioRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`🚀 Servidor executando na porta ${PORT}`);
    
    try {
        await query('SELECT 1');
        console.log(`✅ Banco de Dados ${process.env.DB_NAME} conectado com sucesso!`);
    } catch (error) {
        console.error(`❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
    }
    console.log(`=================================\n`);
});