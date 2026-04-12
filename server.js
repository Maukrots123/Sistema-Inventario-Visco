const express = require('express');
const app = express();
const pool = require('./db'); // Importas tu conexión
const path = require('path');

app.use(express.json());
// Servir tus archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// RUTA PARA OBTENER LOS EQUIPOS DESDE POSTGRES
app.get('/api/equipos', async (req, res) => {
    try {
        const query = 'SELECT * FROM equipo ORDER BY id ASC';
        const resultado = await pool.query(query);
        res.json(resultado.rows); // Enviamos los datos como JSON
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error en el servidor');
    }
});

// Iniciar servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});