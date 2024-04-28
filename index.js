const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Para parsear JSON no corpo das requisições

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@Inspiron1',
  database: 'db_gerenciamento'
});

// Conecta ao banco de dados
db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('Conexão ao MySQL estabelecida');
});

// Rota de exemplo
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API!' });
});

// Porta do servidor
const PORT = process.env.PORT || 3042;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
