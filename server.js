const express = require('express');
const app = express();
const pool = require('./db'); // Importas tu conexión
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');

app.use(session({
    secret: 'clave_secreta_de_visco_2026', // Cámbiala por algo único
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Pon 'true' si usas HTTPS en producción
}));

app.use(express.json());
// Servir tus archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));


// --- MIDDLEWARES DE SEGURIDAD ---

// 1. Verifica si el usuario ha iniciado sesión (Autenticación)
function verificarSesion(req, res, next) {
    if (req.session.usuarioId) {
        next(); // Tiene sesión, puede continuar
    } else {
        res.status(403).send("Acceso denegado: Debes iniciar sesión primero.");
    }
}

// 2. Verifica si el usuario es administrador (Autorización)
function esAdmin(req, res, next) {
    if (req.session.rol === 'admin') {
        next(); // Es admin, puede continuar
    } else {
        res.status(403).send("Acceso denegado: Esta acción requiere permisos de administrador.");
    }
}

// Redireccionar la ruta raíz al login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.post('/api/registrar-usuario',verificarSesion, esAdmin, async (req, res) => {
    const { username, password } = req.body;
    try {
        // Encriptamos la contraseña con un factor de costo de 10
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query('INSERT INTO usuarios (username, password) VALUES ($1, $2)', 
            [username, hashedPassword]);
            
        res.status(201).send("Usuario registrado correctamente");
    } catch (err) {
        res.status(500).send("Error al registrar: " + err.message);
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const query = 'SELECT * FROM usuario WHERE nombre = $1';
        const usuarioDB = await pool.query(query, [username]);
        
        if (usuarioDB.rows.length === 0) return res.status(401).send("Usuario no encontrado");

        const usuario = usuarioDB.rows[0];
        if (password === usuario.clave) {
            // Guardamos ID y ROL en la sesión
            req.session.usuarioId = usuario.id;
            req.session.rol = usuario.rol; 
            
            return res.status(200).json({ rol: usuario.rol }); // Enviamos el rol al frontend
        } else {
            return res.status(401).send("Contraseña incorrecta");
        }
    } catch (err) {
        res.status(500).send("Error en el servidor");
    }
});
// RUTA PARA OBTENER LOS EQUIPOS DESDE POSTGRES
// ... (parte inicial del código igual)

// 1. OBTENER EQUIPOS (Ajustado a tus imágenes image_7d5233 y image_7d5272)
app.get('/api/equipos',verificarSesion, async (req, res) => {
    try {
        const query = `
            SELECT 
                e.id,
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

// POST NUEVO EQUIPO
app.post('/api/equipos', verificarSesion, async (req, res) => {
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

// 2. OBTENER DEPARTAMENTOS 
app.get('/api/departamentos',verificarSesion, async (req, res) => {
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

// 2. GUARDAR NUEVO DEPARTAMENTO
app.post('/api/departamentos',verificarSesion, async (req, res) => {
    try {
        const { nombre, centro_costo, id_gerencia } = req.body;

        if (!nombre || !centro_costo || !id_gerencia) {
            return res.status(400).send("Faltan campos obligatorios: nombre, centro_costo o id_gerencia");
        }

        const query = `
            INSERT INTO departamento (nombre, centro_costo, id_gerencia) 
            VALUES ($1, $2, $3) 
            RETURNING id
        `;
        
        const resultado = await pool.query(query, [nombre, centro_costo, id_gerencia]);
        
        res.status(201).json({ 
            id: resultado.rows[0].id, 
            mensaje: "Departamento registrado exitosamente" 
        });
    } catch (err) {
        console.error("Error al registrar departamento:", err.message);
        res.status(500).send("Error interno al registrar el departamento");
    }
});

// 3. OBTENER GERENCIAS (Ajustado a image_7d5272)
app.get('/api/gerencias',verificarSesion, async (req, res) => {
    try {
        // En tu imagen las columnas son: id, nombre
        const resDB = await pool.query('SELECT id, nombre FROM gerencia ORDER BY nombre');
        res.json(resDB.rows);
    } catch (err) { 
        console.error("Error en /api/gerencias:", err.message);
        res.status(500).send(err.message); 
    }
});

// 3. GUARDAR NUEVA GERENCIA
app.post('/api/gerencias',verificarSesion, async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).send("El nombre de la gerencia es obligatorio");
        }

        const query = `
            INSERT INTO gerencia (nombre) 
            VALUES ($1) 
            RETURNING id
        `;
        
        const resultado = await pool.query(query, [nombre]);
        
        res.status(201).json({ 
            id: resultado.rows[0].id, 
            mensaje: "Gerencia registrada exitosamente" 
        });
    } catch (err) {
        console.error("Error al registrar gerencia:", err.message);
        res.status(500).send("Error interno al registrar la gerencia");
    }
});

// 4. OBTENER RESPONSABLES
app.get('/api/responsables',verificarSesion, async (req, res) => {
    try {
        // En tu imagen no existe 'nombre_completo', usamos nombre y apellido
        const resDB = await pool.query('SELECT id, cedula, nombre, apellido FROM responsable ORDER BY nombre');
        res.json(resDB.rows);
    } catch (err) { 
        console.error("Error en /api/responsables:", err.message);
        res.status(500).send(err.message); 
    }
});

// 4. GUARDAR NUEVO RESPONSABLE
app.post('/api/responsables',verificarSesion, async (req, res) => {
    try {
        const { cedula, nombre, apellido, id_departamento } = req.body;

        // Validamos que los datos requeridos no lleguen vacíos
        if (!cedula || !nombre || !apellido || !id_departamento) {
            return res.status(400).send("Todos los campos son obligatorios");
        }

        const query = `
            INSERT INTO responsable (cedula, nombre, apellido, id_departamento) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id
        `;
        
        const resultado = await pool.query(query, [cedula, nombre, apellido, id_departamento]);
        
        res.status(201).json({ 
            id: resultado.rows[0].id, 
            mensaje: "Responsable registrado exitosamente" 
        });

    } catch (err) {
        console.error("Error al registrar responsable:", err.message);
        res.status(500).send("Error interno al registrar el responsable");
    }
});



// 5. OBTENER CLASES
app.get('/api/clases',verificarSesion, async (req, res) => {
    try {
        const resultado = await pool.query('SELECT id, nombre FROM clase_equipo ORDER BY nombre');
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).send("Error al obtener clases");
    }
});

// POST CLASES 
app.post('/api/clases',verificarSesion, async (req, res) => {
    try {
        const { nombre } = req.body;
        // Inserta en la tabla correcta
        const resultado = await pool.query(
            'INSERT INTO clase_equipo (nombre) VALUES ($1) RETURNING id', 
            [nombre]
        );
        res.status(201).json({ id: resultado.rows[0].id, nombre });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error al guardar la clase");
    }
});

app.get('/api/auditoria',verificarSesion, async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    try {
        const query = `
            SELECT 
                e.fmo, 
                e.serial, 
                c.nombre AS clase_nombre, 
                e.tipo, 
                e.estado, 
                e.fecha_modificacion, 
                CONCAT(r.nombre, ' ', r.apellido) AS responsable_completo
            FROM equipo e
            LEFT JOIN clase_equipo c ON e.id_clase = c.id
            LEFT JOIN responsable r ON e.id_responsable = r.id
            WHERE e.fecha_modificacion::date BETWEEN $1 AND $2 
            ORDER BY e.fecha_modificacion DESC
        `;
        const resultado = await pool.query(query, [fecha_inicio, fecha_fin]);
        res.json(resultado.rows);
    } catch (err) {
        res.status(500).send("Error al consultar auditoría");
    }
});


// ELIMINAR usando ID
// ELIMINAR usando ID corregido
app.delete('/api/equipos/:id',verificarSesion, async (req, res) => {
    // Limpiamos el ID directamente al recibirlo
    const id = req.params.id.toString().replace(/\D/g, ''); 
    
    console.log("Servidor procesando eliminación para ID:", id);

    try {
        const resultado = await pool.query('DELETE FROM equipo WHERE id = $1', [id]);
        
        if (resultado.rowCount === 0) {
            return res.status(404).send("Registro no encontrado");
        }

        res.status(200).send("Eliminado correctamente");
    } catch (err) {
        console.error("Error en DELETE:", err.message);
        res.status(500).send("Error interno al eliminar");
    }
});

// OBTENER para editar usando ID
app.get('/api/equipos/:id',verificarSesion, async (req, res) => {
    try {
        const resDB = await pool.query('SELECT * FROM equipo WHERE id = $1', [req.params.id]);
        res.json(resDB.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.put('/api/equipos/:id',verificarSesion, async (req, res) => {
    const { id } = req.params;
    const { serial, marca, estado, id_responsable, observaciones } = req.body;

    try {
        const query = `
            UPDATE equipo 
            SET serial = $1, marca = $2, estado = $3, id_responsable = $4, observaciones = $5, fecha_modificacion = NOW()
            WHERE id = $6
        `;
        await pool.query(query, [serial, marca, estado, id_responsable, observaciones, id]);
        res.status(200).json({ message: "Equipo actualizado con éxito" });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar: " + err.message });
    }
});


app.post('/api/logout',verificarSesion, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("No se pudo cerrar la sesión");
        }
        res.clearCookie('connect.sid'); // Limpia la cookie de sesión de Express
        res.status(200).send("Sesión cerrada");
    });
});


// Iniciar servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});