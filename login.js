const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
	host     : "localhost",
	user     : "root",
	password : "ocares144",
	database : "login-socket",
});

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Renderizar plantilla de inicio de sesión
	response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Captura los campos de entrada
	let username = request.body.username;
	let password = request.body.password;
	// Asegúrese de que los campos de entrada existan y no estén vacíos
	if (username && password) {
		// Ejecute una consulta SQL que seleccionará la cuenta de la base de datos según el nombre de usuario y la contraseña especificados
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// Si hay un problema con la consulta, muestra el error
			if (error) throw error;
			// Si la cuenta existe
			if (results.length > 0) {
				//Autentifica al usuario
				request.session.loggedin = true;
				request.session.username = username;
				// Redirigir a la página de inicio
				response.redirect('/home');
			} else {
				response.send('Usuario y/o Contraseña Incorrecta');
			}			
			response.end();
		});
	} else {
		response.send('Por favor ingresa Usuario y Contraseña!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// Si el usuario está conectado(masculino)
	if (request.session.loggedin) {
		// Output username
		response.send('Te has logueado satisfactoriamente:, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('¡Inicia sesión para ver esta página!');
	}
	response.end();
});

app.listen(3000);