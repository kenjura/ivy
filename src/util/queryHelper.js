const mysql   = require('mysql');

module.exports.execute = execute;

function execute(query) {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      database: process.env.MYSQL_DB,
      flags: 'PLUGIN_AUTH',
    });

    connection.connect();

    console.log('sending query...', query);

    connection.query(query, (err, data, fields) => {
      if (err) reject(err);
      resolve(data);
    });

    connection.end();
  });
}