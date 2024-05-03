const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');


const app = express();
app.use(cors());
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use('/uploads', express.static('uploads'));


// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@Inspiron1',
  database: 'db_assistente'
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



// Verifica se o diretório existe, se não, cria-o
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do multer para armazenar arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)  // Diretório onde os arquivos serão salvos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)  // Nome do arquivo no servidor
  }
});

const upload = multer({ storage: storage });

// Rota para o upload de imagens
app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;  // Caminho do arquivo no servidor

  // Salvar o caminho da imagem no banco de dados
  const query = 'INSERT INTO imagens (caminho) VALUES (?)';
  db.query(query, [imagePath], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Imagem carregada e caminho salvo com sucesso!', path: imagePath });
  });
});

app.get('/images', (req, res) => {
  const query = 'SELECT caminho FROM imagens';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/tipoMaquinaInsert', (req, res) => {
  const { tipo } = req.body;
  if (!tipo) {
    return res.status(400).json({ error: 'O tipo de máquina é necessário.' });
  }

  const query = 'INSERT INTO tb_tipo_maquina (tipo) VALUES (?)';
  db.query(query, [tipo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: `Tipo de máquina adicionado com sucesso: ${tipo}` });
  });
});

app.post('/ItemInsert', (req, res) => {
  const { tipo } = req.body;
  if (!tipo) {
    return res.status(400).json({ error: 'O tipo de item é necessário.' });
  }

  const query = 'INSERT INTO tb_item (item) VALUES (?)';
  db.query(query, [tipo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: `Peça ou produto adicionado com sucesso: ${tipo}` });
  });
});

app.post('/DefeitoInsert', (req, res) => {
  const { tipo } = req.body;
  if (!tipo) {
    return res.status(400).json({ error: 'O tipo de defeito é necessário.' });
  }

  const query = 'INSERT INTO tb_defeito (defeito) VALUES (?)';
  db.query(query, [tipo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: `Defeito adicionado com sucesso: ${tipo}` });
  });
});

app.post('/CategoriaInsert', (req, res) => {
  const { tipo } = req.body;
  if (!tipo) {
    return res.status(400).json({ error: 'A categoria é necessária.' });
  }

  const query = 'INSERT INTO tb_categoria (categoria) VALUES (?)';
  db.query(query, [tipo], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: `Catergoria adicionada com sucesso: ${tipo}` });
  });
});

// Rota para buscar categorias
app.get('/api/categorias', (req, res) => {
  db.query('SELECT * FROM tb_categoria', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/api/cadastro', (req, res) => {
  const { nome_contato, telefone, endereco, nome_fantasia, razao_social, cpf_cnpj, tipo_pessoa } = req.body;
  const query = 'INSERT INTO tb_cliente (nome_contato, telefone, endereco, nome_fantasia, razao_social, cpf_cnpj, tipo_pessoa) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [nome_contato, telefone, endereco, nome_fantasia, razao_social, cpf_cnpj, tipo_pessoa], (err, result) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
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
