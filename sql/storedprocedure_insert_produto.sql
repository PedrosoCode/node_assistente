DELIMITER //

CREATE PROCEDURE AdicionarProduto(
    IN _nome VARCHAR(255),
    IN _descricao TEXT,
    IN _categoria_id INT,
    IN _capa_url VARCHAR(255),
    IN _imagens_detalhe_urls TEXT  -- URLs separadas por vírgula
)
BEGIN
    DECLARE _capa_id INT;
    DECLARE _imagem_id INT;
    DECLARE _url VARCHAR(255);
    DECLARE _done INT DEFAULT FALSE;
    DECLARE _cursor CURSOR FOR SELECT SUBSTRING_INDEX(SUBSTRING_INDEX(_imagens_detalhe_urls, ',', numbers.n), ',', -1) AS url
    FROM (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) numbers
    WHERE LENGTH(SUBSTRING_INDEX(_imagens_detalhe_urls, ',', numbers.n)) - LENGTH(REPLACE(SUBSTRING_INDEX(_imagens_detalhe_urls, ',', numbers.n), ',', '')) = 1;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET _done = TRUE;

    -- Inserir imagem de capa
    INSERT INTO tb_imagem (url, tipo) VALUES (_capa_url, 'capa');
    SET _capa_id = LAST_INSERT_ID();

    -- Inserir produto
    INSERT INTO tb_produto (nome, descricao, categoria_id, capa_id) VALUES (_nome, _descricao, _categoria_id, _capa_id);
    SET @last_produto_id = LAST_INSERT_ID();

    -- Inserir imagens de detalhe
    OPEN _cursor;
    read_loop: LOOP
        FETCH _cursor INTO _url;
        IF _done THEN
            LEAVE read_loop;
        END IF;
        INSERT INTO tb_imagem (url, tipo) VALUES (_url, 'detalhe');
        SET _imagem_id = LAST_INSERT_ID();
        INSERT INTO tb_produto_imagem (produto_id, imagem_id) VALUES (@last_produto_id, _imagem_id);
    END LOOP;
    CLOSE _cursor;
END //

DELIMITER ;
