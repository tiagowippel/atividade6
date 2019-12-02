var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'remotemysql.com',
    user: '1srKBISyaN',
    password: 'gDS0hakWfZ',
    database: '1srKBISyaN',
});

connection.connect();

const dse = require('dse-driver');

const client = new dse.Client({
    cloud: { secureConnectBundle: './secure-connect-dbteste.zip' },
    credentials: { username: 'tiago', password: 'matrix' },
    keyspace: 'ks1',
});

connection.query(
    `
    SELECT * from invoice
    join customer on customer.id_customer = invoice.customer_id
    `,
    function(error, results, fields) {
        if (error) throw error;
        client
            .batch(
                results.map(item => {
                    return {
                        query: `INSERT INTO invoice (id,nomeCli,enderecoCli) VALUES (?,?,?)`,
                        params: [item.number, item.name, item.address],
                    };
                }),
                { prepare: true }
            )
            .then(a => {
                console.log(a);
            });
    }
);

connection.query(
    `
    SELECT * from invoice_item
    join service on invoice_item.service_id = service.service_id
    join resource on invoice_item.resource_id = resource.id_resource
    join department on resource.department = department.id_department 
    `,
    function(error, results, fields) {
        if (error) throw error;
        //console.log(results);
        client
            .batch(
                results.map(item => {
                    return {
                        query: `
                                INSERT INTO invoice_item (
                                id,
                                idInvoice,
                                descricaoServ,
                                quantidade,
                                valorUnit,
                                imposto,
                                desconto,
                                nomeRec,
                                funcaoRec
                                ) VALUES (?,?,?,?,?,?,?,?,?)
                                `,
                        params: [
                            item.invoice_item_id,
                            item.invoice_id,
                            item.service_description,
                            item.quantity,
                            item.unit_value,
                            item.tax_percent,
                            item.discount_percent,
                            item.name,
                            item.name_department,
                        ],
                    };
                }),
                { prepare: true }
            )
            .then(a => {
                console.log(a);
            });
    }
);

connection.end();
