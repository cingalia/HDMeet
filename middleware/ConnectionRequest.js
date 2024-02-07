module.exports = function () {
require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
});

connection.connect((err) => {
	if (err) {
		console.error('Erreur de connexion à la base de données MySQL :', err);
	} else {
		console.log('Connecté à la base de données hdmeet');
	}
});
//return connection object
return connection
}