
async function cambiarSeccion(nombreSeccion, elemento) {
    const contenedor = document.getElementById('contenedor-dinamico');
    const titulo = document.getElementById('titulo-seccion');
    
    const enlaces = document.querySelectorAll('.menu-navegacion a');
    enlaces.forEach(link => link.classList.remove('activo'));
    elemento.classList.add('activo');

    switch (nombreSeccion) {
        case 'inventario':
            titulo.innerText = "Gestión de Inventario";
            await cargarInventario(contenedor);
            break;
        case 'registro':
            titulo.innerText = "Registro de Nuevo Equipo";
            cargarFormularioRegistro(contenedor);
            await cargarOpcionesFormulario();
            break;
        case 'dashboard':
            titulo.innerText = "Panel de Control";
            contenedor.innerHTML = '<div class="contenedor-tabla"><h2>Resumen General</h2></div>';
            break;
        default:
            contenedor.innerHTML = '<h2>Sección en Desarrollo</h2>';
    }
}

/**
 * Genera el formulario de registro con diseño de cuadrícula
 */
function cargarFormularioRegistro(contenedor) {
    contenedor.innerHTML = `
        <div class="contenedor-formulario">
            <form id="form-registro-equipo" class="grid-formulario">
                
                <div class="seccion-form">
                    <h3><i class="fa-solid fa-tag"></i> Identificación del Equipo</h3>
                    <div class="campos-grupo">
                        <div class="campo">
                            <label>FMO</label>
                            <input type="text" name="fmo" placeholder="Ej: 123456" required>
                        </div>
                        <div class="campo">
                            <label>Serial</label>
                            <input type="text" name="serial" placeholder="Número de serie" required>
                        </div>
                        <div class="campo">
                            <label>Marca</label>
                            <input type="text" name="marca" placeholder="Ej: Dell, HP, Cisco" required>
                        </div>
                    </div>
                </div>

                <div class="seccion-form">
                    <h3><i class="fa-solid fa-layer-group"></i> Clasificación</h3>
                    <div class="campos-grupo">
                        <div class="campo">
                            <label>Clase</label>
                            <input type="text" name="clase" placeholder="Ej: Computación">
                        </div>
                        <div class="campo">
                            <label>Tipo</label>
                            <input type="text" name="tipo" placeholder="Ej: Laptop">
                        </div>
                        
                    </div>
                </div>

                <div class="seccion-form">
                    <h3><i class="fa-solid fa-location-dot"></i> Ubicación y Asignación</h3>
                    <div class="campos-grupo">
                        <div class="campo">
                            <label>Gerencia</label>
                            <select name="gerencia" id="reg-gerencia">
                                <option value="">Seleccione Gerencia</option>
                            </select>
                        </div>
                        <div class="campo">
                            <label>Departamento</label>
                            <select name="departamento" id="reg-departamento">
                                <option value="">Seleccione Departamento</option>
                            </select>
                        </div>

                        <div class="campo">
                            <label>Asignado a:</label>
                            <select name="responsable" id="reg-responsable">
                                <option value="">Seleccione Responsable</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="seccion-form">
                    <h3><i class="fa-solid fa-file-invoice-dollar"></i> Contabilidad y Estado</h3>
                    <div class="campos-grupo">
                        <div class="campo">
                            <label>Centro de Costo (CECO)</label>
                            <input type="text" name="centro_costo" placeholder="Código CECO">
                        </div>
                        
                        <div class="campo">
                            <label>Estado Actual</label>
                            <select name="estado">
                                <option value="Asignado">Asignado</option>
                                <option value="Dañado">Dañado</option>
                                <option value="En Revisión">En Revisión</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="seccion-form full-width">
                    <h3><i class="fa-solid fa-comment-dots"></i> Observaciones</h3>
                    <textarea name="observaciones" rows="3" placeholder="Detalles adicionales del equipo..."></textarea>
                </div>

                <div class="form-acciones full-width">
                    <button type="reset" class="btn-secundario">Limpiar Formulario</button>
                    <button type="submit" class="btn-reporte-premium">
                        <i class="fa-solid fa-floppy-disk"></i> GUARDAR EN SISTEMA
                    </button>
                </div>
            </form>
        </div>
    `;
}



/**
 * Función para cargar Inventario con columnas totalmente independientes
 */
async function cargarInventario(contenedor) {
    contenedor.innerHTML = '<p class="cargando">Conectando con el servidor de Visco...</p>';

    try {
        const respuesta = await fetch('/api/equipos');
        const equipos = await respuesta.json();

        let vistaHTML = `
            <div class="contenedor-inventario">
                <div class="panel-herramientas">
                    <div class="grupo-busqueda">
                        <div class="caja-input-inventario">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            <input type="text" id="input-busqueda" placeholder="Buscar en visco_bd...">
                        </div>
                        <select id="filtro-campo" class="select-estetico">
                            <option value="fmo">FMO</option>
                            <option value="serial">Serial</option>
                            <option value="asignado">Asignado</option>
                            <option value="clase">Clase</option>
                            <option value="estado">Estado</option>
                        </select>
                    </div>
                    
                    <button class="btn-reporte-premium" onclick="generarPDF()">
                        <i class="fa-solid fa-file-pdf"></i> GENERAR REPORTE
                    </button>
                </div>

                <div class="contenedor-tabla" style="overflow-x: auto;">
                    <table class="tabla-datos">
                        <thead>
                            <tr>
                                <th>Clase</th>
                                <th>Tipo</th>
                                <th>FMO</th>
                                <th>Serial</th>
                                <th>Marca</th>
                                <th>Estado</th>
                                <th>Asignado</th>
                                <th>Gerencia</th>
                                <th>Departamento</th>
                                <th>Centro Costo</th>
                                <th>Observaciones</th>
                                <th>Fecha Modif.</th>
                                <th>Usuario Modif.</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla">
        `;

        equipos.forEach(equipo => {
            const fechaMod = equipo.fecha_modificacion ? new Date(equipo.fecha_modificacion).toLocaleDateString() : 'N/A';

            vistaHTML += `
                <tr>
                    <td>${equipo.clase || '-'}</td>
                    <td>${equipo.tipo || '-'}</td>
                    <td><strong>${equipo.fmo || 'S/N'}</strong></td>
                    <td>${equipo.serial || '-'}</td>
                    <td>${equipo.marca || '-'}</td>
                    <td><span class="etiqueta-estado ${equipo.estado.toLowerCase()}">${equipo.estado}</span></td>
                    <td>${equipo.asignado || 'Sin Asignar'}</td>
                    <td>${equipo.gerencia || '-'}</td>
                    <td>${equipo.departamento || '-'}</td>
                    <td>${equipo.centro_costo || '-'}</td>
                    <td title="${equipo.observaciones || ''}">
                        <div style="max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${equipo.observaciones || '-'}
                        </div>
                    </td>
                    <td>${fechaMod}</td>
                    <td>${equipo.usuario_modificacion || 'Sistema'}</td>
                    <td>
                        <button class="btn-mini" title="Ver Detalles"><i class="fa-solid fa-eye"></i></button>
                    </td>
                </tr>
            `;
        });

        vistaHTML += `</tbody></table></div></div>`;
        contenedor.innerHTML = vistaHTML;

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<div class="error-box"><i class="fa-solid fa-triangle-exclamation"></i> Error al cargar datos del inventario.</div>';
    }
}

/**
 * Variables globales para almacenar los catálogos y filtrar localmente
 */
let catalogoDepartamentos = [];

async function cargarOpcionesFormulario() {
    const selGerencia = document.getElementById('reg-gerencia');
    const selDepto = document.getElementById('reg-departamento');
    const selResp = document.getElementById('reg-responsable');

    try {
        const [gerencias, departamentos, responsables] = await Promise.all([
            fetch('/api/gerencias').then(r => r.json()),
            fetch('/api/departamentos').then(r => r.json()),
            fetch('/api/responsables').then(r => r.json())
        ]);

        catalogoDepartamentos = departamentos; // Guardamos para filtrar luego

        // 1. Llenar Gerencias
        selGerencia.innerHTML = '<option value="">Seleccione Gerencia</option>';
        gerencias.forEach(g => {
            selGerencia.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
        });

        // 2. Llenar Responsables (Nombres, no IDs)
        selResp.innerHTML = '<option value="">Seleccione Responsable</option>';
        responsables.forEach(r => {
            selResp.innerHTML += `<option value="${r.id}">${r.nombre} ${r.apellido}</option>`;
        });

        // --- LÓGICA DE FILTRADO DINÁMICO ---

        // Evento cuando cambia la Gerencia
        selGerencia.addEventListener('change', (e) => {
            const idGerenciaSel = e.target.value;
            selDepto.innerHTML = '<option value="">Seleccione Departamento</option>';
            
            // Filtramos los departamentos que pertenecen a esa gerencia
            const filtrados = catalogoDepartamentos.filter(d => d.id == idGerenciaSel);
            
            filtrados.forEach(d => {
                selDepto.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
            });
        });

        // Evento cuando cambia el Departamento (Autocompletar Gerencia si se entra por aquí)
        selDepto.addEventListener('change', (e) => {
            const idDeptoSel = e.target.value;
            const deptoEncontrado = catalogoDepartamentos.find(d => d.id == idDeptoSel);
            
            if (deptoEncontrado && !selGerencia.value) {
                selGerencia.value = deptoEncontrado.id;
            }
        });

    } catch (error) {
        console.error("Error en la carga dinámica:", error);
    }
}

// Agrega esto después de cargar el formulario de registro
function activarEscuchaFormulario() {
    const form = document.getElementById('form-registro-equipo');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const datos = {
            fmo: formData.get('fmo'),
            serial: formData.get('serial'),
            marca: formData.get('marca'),
            clase: formData.get('clase'), // Asegúrate que sea el ID
            tipo: formData.get('tipo'),
            gerencia: formData.get('gerencia'),
            departamento: formData.get('departamento'),
            responsable: formData.get('responsable'),
            estado: formData.get('estado'),
            observaciones: formData.get('observaciones')
        };

        try {
            const respuesta = await fetch('/api/equipos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                alert("✅ Equipo registrado exitosamente en Visco_BD");
                form.reset();
                // Opcional: Redirigir al inventario para ver el cambio
                // cambiarSeccion('inventario', document.querySelector('[onclick*="inventario"]'));
            } else {
                const err = await respuesta.json();
                alert("❌ Error: " + err.error);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    });
}

// Coloca esto al final de tu motor_navegacion.js, FUERA de cualquier función
document.addEventListener('submit', async (e) => {
    // Verificamos si el formulario que se está enviando es el de registro
    if (e.target && e.target.id === 'form-registro-equipo') {
        e.preventDefault();
        console.log("Enviando formulario..."); // Si ves esto en F12, vamos bien

        const formData = new FormData(e.target);
        const datos = {
            fmo: formData.get('fmo'),
            serial: formData.get('serial'),
            tipo: formData.get('tipo'),
            clase: formData.get('clase'),
            marca: formData.get('marca'),
            modelo: formData.get('modelo'),
            departamento: formData.get('departamento'),
            responsable: formData.get('responsable'),
            estado: formData.get('estado'),
            observaciones: formData.get('observaciones')
        };

        try {
            const respuesta = await fetch('/api/equipos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert("✅ " + resultado.mensaje);
                e.target.reset(); // Limpia el formulario
            } else {
                alert("❌ Error: " + resultado.error);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("❌ No se pudo conectar con el servidor");
        }
    }
});

function generarPDF() {
    alert("Iniciando exportación de reporte detallado...");
}

// ... (Tus funciones cambiarSeccion, cargarInventario, etc.) ...

// ESTO VA AL FINAL DE TU ARCHIVO .JS
window.onload = () => {
    // 1. Buscamos el botón de Panel de Control en tu menú lateral
    const enlaceDashboard = Array.from(document.querySelectorAll('.menu-navegacion a'))
                                 .find(a => a.innerText.includes('Panel de Control') || 
                                            (a.getAttribute('onclick') && a.getAttribute('onclick').includes('dashboard')));

    // 2. Si lo encuentra, ejecuta la navegación. Si no, llena el contenedor manualmente.
    if (enlaceDashboard) {
        cambiarSeccion('dashboard', enlaceDashboard);
    } else {
        // Plan B: Llenado manual por si el menú aún no responde
        const contenedor = document.getElementById('contenedor-dinamico');
        const titulo = document.getElementById('titulo-seccion');
        if(titulo) titulo.innerText = "Panel de Control";
        if(contenedor) {
            contenedor.innerHTML = `
                <div class="contenedor-tabla">
                    <h2>Resumen General</h2>
                    <p>Bienvenido al sistema Visco. Cargando estadísticas...</p>
                </div>`;
        }
    }
};