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
  res.json({ message: 'Olá, mundo.' });
});

// Porta do servidor
const PORT = process.env.PORT || 3042;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.get('/pingpong', (req, res) => {
    const query = 'SELECT * FROM pingpong';
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });

  app.post('/pingpongInsert', (req, res) => {
    const message = req.body.message;
    if (!message) {
      return res.status(400).json({ error: 'A mensagem é necessária.' });
    }
  
    const query = 'INSERT INTO pingpong (message) VALUES (?)';
    db.query(query, [message], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: `Mensagem adicionada com sucesso: ${message}` });
    });
});
