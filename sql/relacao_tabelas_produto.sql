CREATE TABLE tb_produto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria_id INT,
    capa_id INT,  -- Chave estrangeira para a imagem de capa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES tb_categoria(id),
    FOREIGN KEY (capa_id) REFERENCES tb_imagem(id)
);

CREATE TABLE tb_imagem (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,  -- 'capa' ou 'detalhe'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_produto_imagem (
    produto_id INT,
    imagem_id INT,
    FOREIGN KEY (produto_id) REFERENCES tb_produto(id),
    FOREIGN KEY (imagem_id) REFERENCES tb_imagem(id),
    PRIMARY KEY (produto_id, imagem_id)
);


