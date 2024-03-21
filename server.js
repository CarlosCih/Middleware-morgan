const express = require('express');
const mysql = require('mysql');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login'
});

// Conexión a la base de datos
db.connect((err) => {
  if (err) throw err;
  console.log('Conexión a la base de datos establecida');
});

// Middleware para parsing de JSON en las solicitudes HTTP
app.use(express.json());

// Ruta del archivo de registro
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// Middleware para logging de solicitudes HTTP, se muestran en consola
app.use(morgan('combined'));

// Middleware para logging de solicitudes HTTP, se guarda en archivo
app.use(morgan('combined', { stream: accessLogStream }));

// Ruta de inicio
app.get('/', (req, res) => {
  res.send('Bienvenido a mi aplicación Node.js con Morgan');
});

// Ruta para el registro de usuarios
app.post('/registro', (req, res) => {
  const { personName, personLName, personEmail, personPhone, userTypeId, cveUser, departament, groupStdnt, career, dependence } = req.body;

  if (!personName || !personEmail || !personPhone || !userTypeId || !cveUser) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados' });
  }

  const insertUserQuery = 'CALL insertUser(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(insertUserQuery, [personName, personLName, personEmail, personPhone, userTypeId, cveUser, departament, groupStdnt, career, dependence], (err, results) => {
    if (err) {
      console.error('Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    console.log('Usuario registrado correctamente');
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  });
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', (req, res) => {
  const getUsersQuery = 'SELECT * FROM catusers';

  db.query(getUsersQuery, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.status(200).json(results);
  });
});

// Ruta para obtener un usuario por ID
app.get('/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const getUserByIdQuery = 'SELECT * FROM catusers WHERE userId = ?';

  db.query(getUserByIdQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener usuario por ID:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(results[0]);
  });
});

// Ruta para actualizar información de un usuario por ID
app.put('/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const { personName, personLName, personEmail, personPhone, userTypeId, cveUser, departament, groupStdnt, career, dependence } = req.body;

  if (!personName || !personEmail || !personPhone || !userTypeId || !cveUser) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados' });
  }

  const updateUserQuery = 'UPDATE catusers SET personName = ?, personLName = ?, personEmail = ?, personPhone = ?, userTypeId = ?, cveUser = ?, departament = ?, groupStdnt = ?, career = ?, dependence = ? WHERE userId = ?';

  db.query(updateUserQuery, [personName, personLName, personEmail, personPhone, userTypeId, cveUser, departament, groupStdnt, career, dependence, userId], (err, results) => {
    if (err) {
      console.error('Error al actualizar usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario actualizado correctamente');
    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  });
});

// Ruta para eliminar un usuario por ID
app.delete('/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const deleteUserQuery = 'DELETE FROM catusers WHERE userId = ?';

  db.query(deleteUserQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error al eliminar usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario eliminado correctamente');
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
