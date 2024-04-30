const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();



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

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  // Verificar se o usuário ou email já existe
  const checkUserQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkUserQuery, [username, email], async (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      if (results.length > 0) {
          return res.status(409).json({ error: 'Username or email already exists.' });
      }

      // Se não existir, prosseguir com a criação do usuário
      const hashedPassword = await bcrypt.hash(password, 8);
      const registerQuery = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      db.query(registerQuery, [username, email, hashedPassword], (err, result) => {
          if (err) {
              return res.status(500).json({ error: err.message });
          }
          res.status(201).send('User registered');
      });
  });
});




app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], async (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      if (results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
          return res.status(401).send('Authentication failed');
      }

      const token = jwt.sign(
          { id: results[0].id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      res.status(200).json({ token });
  });
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // Se não houver token, retorna não autorizado

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); // Token inválido ou expirado
      req.user = user;
      next(); // Token é válido, continua
  });
};

// Rota protegida
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Você está acessando uma rota protegida', user: req.user });
});
