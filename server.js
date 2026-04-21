const express = require('express');
const app = express();
const pool = require('./db'); // Importas tu conexión
const path = require('path');

app.use(express.json());
// Servir tus archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// RUTA PARA OBTENER LOS EQUIPOS DESDE POSTGRES
// ... (parte inicial del código igual)

// 1. OBTENER EQUIPOS (Ajustado a tus imágenes image_7d5233 y image_7d5272)
app.get('/api/equipos', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.fmo, 
                e.serial, 
                e.marca, 
                e.modelo, 
                e.estado, 
                e.tipo, 
                e.observacion AS observaciones, 
                d.centro_costo,
                e.fecha_modificacion,
                c.nombre AS clase, 
                d.nombre AS departamento,
                g.nombre AS gerencia,    
                r.nombre || ' ' || r.apellido AS asignado 
            FROM equipo e
            LEFT JOIN clase_equipo c ON e.id_clase = c.id
            LEFT JOIN departamento d ON e.id_departamento = d.id
            LEFT JOIN gerencia g ON d.id_gerencia = g.id
            LEFT JOIN responsable r ON e.id_responsable = r.id
            ORDER BY e.fecha_modificacion DESC;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error SQL en /api/equipos:", err.message);
        res.status(500).send('Error al obtener equipos');
    }
});

// 2. OBTENER DEPARTAMENTOS 
app.get('/api/departamentos', async (req, res) => {
    try {
        // En tu imagen las columnas son: id, nombre, id_gerencia
        const query = 'SELECT id, nombre, id_gerencia FROM departamento ORDER BY nombre';
        const resDB = await pool.query(query);
        res.json(resDB.rows);
    } catch (err) { 
        console.error("Error en /api/departamentos:", err.message);
        res.status(500).send(err.message); 
    }
});

// 3. OBTENER GERENCIAS (Ajustado a image_7d5272)
app.get('/api/gerencias', async (req, res) => {
    try {
        // En tu imagen las columnas son: id, nombre
        const resDB = await pool.query('SELECT id, nombre FROM gerencia ORDER BY nombre');
        res.json(resDB.rows);
    } catch (err) { 
        console.error("Error en /api/gerencias:", err.message);
        res.status(500).send(err.message); 
    }
});

// 4. OBTENER RESPONSABLES
app.get('/api/responsables', async (req, res) => {
    try {
        // En tu imagen no existe 'nombre_completo', usamos nombre y apellido
        const resDB = await pool.query('SELECT id, cedula, nombre, apellido FROM responsable ORDER BY nombre');
        res.json(resDB.rows);
    } catch (err) { 
        console.error("Error en /api/responsables:", err.message);
        res.status(500).send(err.message); 
    }
});

// 5. OBTENER CLASES
app.get('/api/clases', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id, nombre FROM clase_equipo ORDER BY nombre');
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).send("Error al obtener clases");
    }
});


// RUTA PARA REGISTRAR UN NUEVO EQUIPO
app.post('/api/equipos', async (req, res) => {
    const { fmo, serial, tipo, clase, marca, modelo, departamento, responsable, estado, observaciones } = req.body;

    try {
        // --- PROCESO DINÁMICO PARA LA CLASE ---
        let idClaseFinal = null;

        if (clase && clase.trim() !== "") {
            // 1. Intentamos buscar la clase por nombre
            const buscarClase = await pool.query('SELECT id FROM clase_equipo WHERE LOWER(nombre) = LOWER($1)', [clase.trim()]);
            
            if (buscarClase.rows.length > 0) {
                // 2. Si existe, tomamos su ID
                idClaseFinal = buscarClase.rows[0].id;
            } else {
                // 3. Si no existe, la CREAMOS dinámicamente
                const nuevaClase = await pool.query('INSERT INTO clase_equipo (nombre) VALUES ($1) RETURNING id', [clase.trim()]);
                idClaseFinal = nuevaClase.rows[0].id;
            }
        }

        // --- INSERCIÓN DEL EQUIPO ---
        const queryEquipo = `
            INSERT INTO equipo (
                fmo, serial, tipo, id_clase, marca, modelo, 
                id_departamento, id_responsable, estado, 
                observacion, fecha_modificacion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
            RETURNING *;
        `;

        const valores = [fmo, serial, tipo, idClaseFinal, marca, modelo, departamento, responsable, estado, observaciones];
        const resultado = await pool.query(queryEquipo, valores);

        res.status(201).json({ mensaje: 'Equipo y clase registrados con éxito', data: resultado.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error en el proceso dinámico: ' + err.message });
    }
});

// Iniciar servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});