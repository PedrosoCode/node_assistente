CREATE TABLE tb_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_contato VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco VARCHAR(255),
    nome_fantasia VARCHAR(255),
    razao_social VARCHAR(255),
    cpf_cnpj VARCHAR(20) NOT NULL,
    tipo_pessoa CHAR(1) NOT NULL,  -- 'F' para CPF e 'J' para CNPJ
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);