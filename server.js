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

// 4. OBTENER RESPONSABLES (Ajustado a image_71174f)
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


// RUTA PARA REGISTRAR UN NUEVO EQUIPO
app.post('/api/equipos', async (req, res) => {
    // 1. Extraemos solo lo que realmente existe en tu tabla actual
    const {
        fmo, serial, tipo, clase, marca, modelo,
        departamento, responsable, ceco,
        estado, observaciones
    } = req.body;

    try {
        // 2. Nota que eliminamos id_gerencia (porque es redundante) y subtipos
        // Contamos los parámetros: fmo($1), serial($2)... hasta usuario($12)
        const query = `
            INSERT INTO equipo (
                fmo, serial, tipo, id_clase, marca, modelo, 
                id_departamento, id_responsable, centro_costo,
                estado, observacion, fecha_modificacion, usuario_modificacion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, $12)
            RETURNING *;
        `;

        const valores = [
            fmo,          
            serial,        
            tipo,         
            clase,         
            marca,         
            modelo,        
            departamento,  
            responsable,   
            ceco,          
            estado,        
            observaciones, 
            'Mauricio A.'  
        ];

        const resultado = await pool.query(query, valores);
        res.status(201).json({ mensaje: 'Registro guardado con éxito', data: resultado.rows[0] });
        
    } catch (err) {
        console.error("Error al insertar:", err.message);
        res.status(500).json({ error: 'Error interno: ' + err.message });
    }
});

// Iniciar servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});