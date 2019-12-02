DROP TABLE IF EXISTS invoice;

CREATE TABLE
IF NOT EXISTS invoice
(
    id int,
    nomeCli text,
    enderecoCli text,
    PRIMARY KEY
(id)
);

DROP TABLE IF EXISTS invoice_item;

CREATE TABLE
IF NOT EXISTS invoice_item
(
    id int,
    idInvoice int,
    descricaoServ text,
    quantidade float,
    valorUnit float,
    imposto float,
    desconto float,
    nomeRec text,
    funcaoRec text,
    PRIMARY KEY
(idInvoice,id)
);
