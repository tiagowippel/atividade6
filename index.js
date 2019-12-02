const fs = require('fs');
const express = require('express');
const pdf = require('html-pdf');

const dse = require('dse-driver');

const client = new dse.Client({
    cloud: { secureConnectBundle: './secure-connect-dbteste.zip' },
    credentials: { username: 'tiago', password: 'matrix' },
    keyspace: 'ks1',
});

var app = express();

app.listen(3001, function() {
    console.log('Example app listening on port 3001!');
});

app.get('/notapdf.pdf', function(req, res) {
    //res.send(req.query.id);
    client
        .execute('SELECT * from invoice where id=?', [req.query.id], {
            prepare: true,
        })
        .then(({ rows }) => {
            if (rows.length === 0) {
                return res.sendStatus(404);
            }
            const nf = rows[0];

            client
                .execute(
                    'SELECT * from invoice_item where idinvoice=?',
                    [req.query.id],
                    {
                        prepare: true,
                    }
                )
                .then(({ rows }) => {
                    const itens = rows;
                    let vtotal = 0;
                    pdf.create(
                        `
                        <style>
                        table, th, td {
                            border: 1px solid black;
                        }
                        </style>
                    <div>
                    <li><h1>NF: ${nf.id}</h1></li>
                    <li><h3>Nome: ${nf.nomecli}</h3></li>
                    <li><h3>Endereço: ${nf.enderecocli}</h3></li>
                    <h1>Itens:</h1>
                    <table>
                    <tr>
                        <th>Descrição</th>
                        <th>Nome Recurso</th>
                        <th>Função Recurso</th>
                        <th>Qtd.</th>
                        <th>Valor Unit.</th>
                        <th>Subtotal</th>
                        <th>Imposto</th>
                        <th>Desconto</th>
                        <th>Total Item</th>
                    </tr>
                    ${itens
                        .map((item, k) => {
                            let stotal = item.quantidade * item.valorunit;
                            const imposto = stotal * item.imposto;
                            const desconto = stotal * item.desconto;
                            const totalitem = stotal + imposto - desconto;
                            vtotal += totalitem;
                            return `
                            <tr>
                                <td>${item.descricaoserv}</td>
                                <td>${item.nomerec}</td>
                                <td>${item.funcaorec}</td>
                                <td>${item.quantidade}</td>
                                <td>${item.valorunit.toFixed(2)}</td>
                                <td>${stotal.toFixed(2)}</td>
                                <td>${imposto.toFixed(2)} (${(
                                item.imposto * 100
                            ).toFixed(2)}%)</td>
                                <td>${desconto.toFixed(2)} (${(
                                item.desconto * 100
                            ).toFixed(2)}%)</td>
                                <td>${totalitem.toFixed(2)}</td>
                            </tr>
                            `;
                        })
                        .join('')}
                    </table>
                    <li><h3>Total NF: ${vtotal.toFixed(2)}</h3></li>
                    </ul>
                    </div>
                `,
                        {
                            orientation: 'landscape',
                        }
                    ).toStream(function(err, stream) {
                        stream.pipe(res);
                    });
                });
        });
});
