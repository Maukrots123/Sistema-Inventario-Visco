
async function cambiarSeccion(nombreSeccion, elemento) {
    const contenedor = document.getElementById('contenedor-dinamico');
    const titulo = document.getElementById('titulo-seccion');
    
    const enlaces = document.querySelectorAll('.menu-navegacion a');
    enlaces.forEach(link => link.classList.remove('activo'));
    elemento.classList.add('activo');

    

    switch (nombreSeccion) {
        case 'dashboard':
            titulo.innerText = "Panel de Control";
            
            // 1. Mostramos un estado de carga (como hace el inventario)
            contenedor.innerHTML = '<p class="cargando">Calculando métricas de Visco...</p>';
            
            try {
                // 2. REPLICA: Hacemos el fetch y esperamos la respuesta (esto llena la variable global)
                const respuesta = await fetch('/api/equipos');
                todosLosEquipos = await respuesta.json(); 

                // 3. Inyectamos la interfaz vacía
                cargarInterfazPanel(contenedor);
                
                // 4. Ejecutamos la lógica (ahora sí hay datos seguros en todosLosEquipos)
                setTimeout(() => {
                    inicializarLogicaPanel();
                }, 50);
                
            } catch (error) {
                console.error("Error en Dashboard-Visco:", error);
                contenedor.innerHTML = '<div class="error-box">Error al sincronizar indicadores.</div>';
            }
            break;

        case 'inventario':
            titulo.innerText = "Gestión de Inventario";
            await cargarInventario(contenedor);
            break;
        case 'registro':
            titulo.innerText = "Registro de Nuevo Equipo";
            cargarFormularioRegistro(contenedor);
            await cargarOpcionesFormulario();
            break;
        case 'actas':
            titulo.innerText = "Actas de Entrega";
            contenedor.innerHTML = '<p class="cargando">Cargando actas...</p>';
            cargarInterfazActas(contenedor);
            break;

        case 'config':
            titulo.innerText = "Configuración";
            cargarInterfazConfig(contenedor);
            break;
    
        default:
            contenedor.innerHTML = '<h2>Sección en Desarrollo</h2>';
    }
}

/**
 * Genera la interfaz del Panel de Control con métricas y auditoría detallada
 */
function cargarInterfazPanel(contenedor) {
    contenedor.innerHTML = `
        <div class="dashboard-wrapper">
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Total Activos</span>
                    <h2 id="total-activos">0</h2>
                    <p id="ultima-act" class="stat-subtext">Sincronizando...</p>
                </div>
                <div class="stat-card warning">
                    <span class="stat-label">Estado Crítico</span>
                    <h2 id="total-fallas">0</h2>
                    <p class="stat-subtext">Equipos en falla / Dañados</p>
                </div>
                <div class="stat-card primary">
                    <span class="stat-label">Clase Predominante</span>
                    <h2 id="clase-dominante">--</h2>
                    <p class="stat-subtext">Mayor volumen en stock</p>
                </div>
            </div>

            <div class="main-stats-row">
                <div class="chart-container">
                    <div class="chart-box" style="margin-bottom: 25px;">
                        <h3><i class="fa-solid fa-chart-simple"></i> Flujo de Inventario</h3>
                        <canvas id="canvas-barras"></canvas>
                    </div>

                    <div class="chart-box">
                        <h3><i class="fa-solid fa-chart-pie"></i> Estado General</h3>
                        <canvas id="canvas-dona"></canvas>
                    </div>
                </div>
        
                <div class="quick-actions">
                    <h3>Acciones Rápidas</h3>
                    <button onclick="document.querySelector('[onclick*=\\'registro\\']').click()" class="btn-dash-action success">
                        <i class="fa-solid fa-plus"></i> Registrar Nuevo Equipo
                    </button>
                    <button onclick="abrirInterfazRegistro('clase')" class="btn-dash-action alt">
                        <i class="fa-solid fa-layer-group"></i> Nueva Clase
                    </button>
                    <button onclick="abrirInterfazRegistro('responsable')" class="btn-dash-action alt">
                        <i class="fa-solid fa-user-plus"></i> Nuevo Responsable
                    </button>
                    <button onclick="abrirInterfazRegistro('gerencia')" class="btn-dash-action alt">
                        <i class="fa-solid fa-sitemap"></i> Nueva Gerencia
                    </button>
                    <button onclick="abrirInterfazRegistro('departamento')" class="btn-dash-action alt">
                        <i class="fa-solid fa-sitemap"></i> Nuevo Departamento
                    </button>
                    <button onclick="generarReportePDF()" class="btn-dash-action info">
                        <i class="fa-solid fa-file-pdf"></i> Generar Reporte PDF
                    </button>
                </div>
            </div>

            <div class="audit-section">
                <div class="audit-header">
                    <div class="audit-title">
                        <h3><i class="fa-solid fa-clock-rotate-left"></i> Auditoría de Movimientos</h3>
                        <p>Historial detallado de cambios y responsables</p>
                    </div>
                    <div class="audit-filters">
                        <div class="btn-group-audit">
                            <button onclick="cargarAuditoria(1)">1D</button>
                            <button onclick="cargarAuditoria(7)">7D</button>
                            <button onclick="cargarAuditoria(30)">1M</button>
                        </div>
                        <div class="custom-range">
                            <input type="date" id="fecha-inicio">
                            <input type="date" id="fecha-fin">
                            <button onclick="consultarFechasPersonalizadas()" class="btn-search-audit">
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="audit-table-wrapper">
                    <table class="modern-table">
                        <thead>
                            <tr>
                                <th>FMO</th>
                                <th>Tipo / Marca</th>
                                <th>Estado</th>
                                <th>Fecha Mov.</th>
                                <th>Operador / Responsable</th> 
                            </tr>
                        </thead>
                        <tbody id="body-auditoria">
                            <tr><td colspan="5" class="empty-state">Inicie una consulta de auditoría</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/**
 * Procesa la data global y rellena los indicadores del Panel de Control
 */
/**
 * Procesa la data global y rellena los indicadores del Panel de Control
 */
function inicializarLogicaPanel() {
    if (!todosLosEquipos || todosLosEquipos.length === 0) {
        console.warn("No hay datos cargados para las métricas.");
        return;
    }

    // 1. Cálculos de métricas de flujo (Normalizando a minúsculas)
    const total = todosLosEquipos.length;
    const estados = ['almacen', 'asignado', 'dañado', 'revision'];
    const conteoEstados = {};
    
    // Contamos dinámicamente cada estado
    estados.forEach(estado => {
        conteoEstados[estado] = todosLosEquipos.filter(e => 
            e.estado?.toLowerCase().trim() === estado
        ).length;
    });

    // 2. Agrupación por Gerencia (usando el campo 'gerencia' de tu API)
    const conteoGerencias = todosLosEquipos.reduce((acc, e) => {
        const gerencia = e.gerencia || 'Sin Gerencia';
        acc[gerencia] = (acc[gerencia] || 0) + 1;
        return acc;
    }, {});

    // 3. Determinar Clase Predominante
    const conteoClases = todosLosEquipos.reduce((acc, e) => {
        const clase = e.clase || 'Sin Clase';
        acc[clase] = (acc[clase] || 0) + 1;
        return acc;
    }, {});

    let claseMax = "--";
    let maxValor = 0;
    Object.entries(conteoClases).forEach(([nombre, valor]) => {
        if (valor > maxValor) { maxValor = valor; claseMax = nombre; }
    });

    // 4. Actualizar tarjetas superiores
    const elTotal = document.getElementById('total-activos');
    const elAsignados = document.getElementById('total-asignados');
    const elClase = document.getElementById('clase-dominante');
    const elAct = document.getElementById('ultima-act');

    if (elTotal) elTotal.innerText = total;
    if (elAsignados) elAsignados.innerText = conteoEstados.asignado;
    if (elClase) elClase.innerText = claseMax;
    if (elAct) elAct.innerText = `Sincronizado: ${new Date().toLocaleTimeString()}`;

    // 5. INICIALIZAR GRÁFICAS con limpieza de instancias previas
    if (window.chartBarras) window.chartBarras.destroy();
    if (window.chartDona) window.chartDona.destroy();

    // Colores corporativos
    const colores = {
        'almacen': '#3498db',
        'asignado': '#2ecc71',
        'dañado': '#e74c3c',
        'revision': '#f1c40f'
    };

    // Gráfica de Barras (Flujo Operativo: 4 estados)
    const ctxBar = document.getElementById('canvas-barras');
    if (ctxBar) {
        window.chartBarras = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['En Almacén', 'Asignados', 'Dañados', 'En Revisión'],
                datasets: [{
                    label: 'Cantidad de Equipos',
                    data: [conteoEstados.almacen, conteoEstados.asignado, conteoEstados.dañado, conteoEstados.revision],
                    backgroundColor: [colores.almacen, colores.asignado, colores.dañado, colores.revision],
                    borderRadius: 5,
                    barThickness: 65
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, precision: 0 }
                    }
                },

                plugins:{
                    legend: {
                        display: false
                    }
                }
                
            }
            
        });
    }

    // Gráfica de Dona (Distribución por Gerencia)
    const ctxDona = document.getElementById('canvas-dona');
    if (ctxDona) {
        window.chartDona = new Chart(ctxDona, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoGerencias),
                datasets: [{
                    data: Object.values(conteoGerencias),
                    backgroundColor: ['#3498db', '#9b59b6', '#e67e22', '#2ecc71', '#f1c40f']
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'right' } } 
            }
        });
    }
}

/**
 * Genera el formulario de registro con diseño de cuadrícula
 */
function cargarFormularioRegistro(contenedor) {
    contenedor.innerHTML = `
        <div class="animacion-seccion contenedor-formulario">
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
                                <select name="clase" id="reg-clase" required>
                                    <option value="">Seleccione Clase</option>
                                    </select>
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
                                <option value="Almacen">Almacen</option>
                                <option value="Dañado">Dañado</option>
                                <option value="Revision">Revision</option>                            
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

async function cargarClasesEnFormulario() {
    try {
        const respuesta = await fetch('/api/clases');
        const clases = await respuesta.json();
        const select = document.getElementById('reg-clase');
        
        clases.forEach(clase => {
            const option = document.createElement('option');
            option.value = clase.nombre; // O el ID, según lo que tu servidor espere
            option.textContent = clase.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar las clases:", error);
    }
}

/**
 * Genera una pantalla emergente (Modal) para el registro de tablas maestras
 */
function abrirInterfazRegistro(tipo) {
    let htmlFormulario = "";
    let icono = "";
    let titulo = "";
    let endpoint = ""; // Variable para definir la ruta de la API

    // Definición de campos basada en tus tablas de la base de datos
    switch (tipo) {
        case 'clase':
            titulo = "Registrar Nueva Clase";
            icono = "fa-layer-group";
            endpoint = "/api/clases"; // Aquí apuntas a la tabla correcta
            htmlFormulario = `
                <div class="campo">
                    <label>Nombre de la Clase</label>
                    <input type="text" name="nombre" placeholder="Ej: Computación" required>
                </div>`;
            break;

        case 'responsable':
            titulo = "Registrar Nuevo Responsable";
            icono = "fa-user-plus";
            endpoint = "/api/responsables";
            htmlFormulario = `
                <div class="campo">
                    <label>Cédula</label>
                    <input type="text" name="cedula" placeholder="V-00000000" required>
                </div>
                <div class="campo">
                    <label>Nombre</label>
                    <input type="text" name="nombre" placeholder="Nombre" required>
                </div>
                <div class="campo">
                    <label>Apellido</label>
                    <input type="text" name="apellido" placeholder="Apellido" required>
                </div>
                <div class="campo">
                <label>Departamento</label>
                    <select name="id_departamento" id="select-deptos" required>
                        <option value="">Cargando departamentos...</option>
                    </select>
                </div>`;
            break;

        case 'gerencia':
            titulo = "Registrar Nueva Gerencia";
            icono = "fa-sitemap"; // Icono de jerarquía/organización
            endpoint = "/api/gerencias";
            htmlFormulario = `
                <div class="campo">
                    <label>Nombre de la Gerencia</label>
                    <input type="text" name="nombre" placeholder="Ej: Gerencia General" required>
                </div>`;
            break;
            
        case 'departamento':
            titulo = "Registrar Nuevo Departamento";
            icono = "fa-sitemap";
            endpoint = "/api/departamentos";
            htmlFormulario = `
                <div class="campo">
                    <label>Nombre del Departamento</label>
                    <input type="text" name="nombre" required>
                </div>
                <div class="campo">
                    <label>Centro de Costo</label>
                    <input type="text" name="centro_costo" required>
                </div>
                <div class="campo">
                    <label>Gerencia</label>
                    <select name="id_gerencia" id="select-gerencias" required>
                        <option value="">Cargando gerencias...</option>
                    </select>
                </div>`;
            break;
            
    }
    

    // Crear el elemento del modal (PANTALLA FLOTANTE)
    const overlay = document.createElement('div');
    overlay.id = "modal-emergente";
    overlay.className = "modal-overlay-sistema active";
    
    overlay.innerHTML = `
        <div class="modal-content-sistema">
            <div class="modal-header-sistema">
                <h3><i class="fa-solid ${icono}"></i> ${titulo}</h3>
                <button type="button" class="btn-cerrar-top" onclick="this.closest('.modal-overlay-sistema').remove()">&times;</button>
            </div>
            <form id="form-maestro-dinamico" class="form-modal-body">
                <p class="instruccion">Complete los campos según el esquema de la base de datos</p>
                ${htmlFormulario}
                <div class="modal-footer-sistema">
                    <button type="button" onclick="this.closest('.modal-overlay-sistema').remove()" class="btn-cancelar">Cerrar</button>
                    <button type="submit" class="btn-guardar-maestro">Guardar Registro</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    

    // Lógica de envío
    document.getElementById('form-maestro-dinamico').onsubmit = async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(e.target));

        try {
            const respuesta = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                alert("Registro exitoso en " + endpoint);
                overlay.remove(); // Cerramos el modal
            } else {
                alert("Error al guardar en el servidor");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Lógica de carga para Responsable y Departamento
if (tipo === 'responsable' || tipo === 'departamento') {
    const select = document.getElementById(tipo === 'responsable' ? 'select-deptos' : 'select-gerencias');
    const endpointFetch = tipo === 'responsable' ? '/api/departamentos' : '/api/gerencias';
    
    if (select) {
        fetch(endpointFetch)
            .then(res => res.json())
            .then(datos => {
                select.innerHTML = '<option value="">Seleccione...</option>';
                datos.forEach(item => {
                    select.innerHTML += `<option value="${item.id}">${item.nombre}</option>`;
                });
            })
            .catch(err => {
                console.error("Error al cargar datos:", err);
                select.innerHTML = '<option value="">Error al cargar</option>';
            });
    }
}
}


let todosLosEquipos = []; // Variable global para persistencia de datos

async function cargarInventario(contenedor) {
    contenedor.innerHTML = '<p class="cargando">Conectando con el servidor de Visco...</p>';

    try {
        const respuesta = await fetch('/api/equipos');
        todosLosEquipos = await respuesta.json(); 

        // 1. Inyectamos la estructura base del inventario
        let vistaHTML = `
            <div class="animacion-seccion contenedor-inventario">
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

                    <button class="btn-reporte-premium" onclick="abrirModal()">
                        <i class="fa-solid fa-file-pdf"></i> GENERAR REPORTE
                    </button>
                </div>

                <div class="contenedor-tabla" style="overflow-x: auto;">
                    <table class="tabla-datos">
                        <thead>
                            <tr>
                                <th>Clase</th> <th>Tipo</th> <th>FMO</th> <th>Serial</th>
                                <th>Marca</th> <th>Estado</th> <th>Asignado</th>
                                <th>Gerencia</th> <th>Departamento</th> <th>C. Costo</th>
                                <th>Observaciones</th> <th>Fecha Modif.</th>
                                <th>Usuario Modif.</th> <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla"></tbody>
                    </table>
                </div>
            </div>`;
        
        contenedor.innerHTML = vistaHTML;

        // 2. Referencias al DOM para el filtrado
        const inputBusqueda = document.getElementById('input-busqueda');
        const filtroCampo = document.getElementById('filtro-campo');

        // 3. Lógica de filtrado con correcciones (Espacios y Coincidencia inicial)
        inputBusqueda.addEventListener('input', () => {
            // CORRECCIÓN: .trim() elimina espacios muertos al inicio/final
            const texto = inputBusqueda.value.trim().toLowerCase();
            const campo = filtroCampo.value;

            if (texto === "") {
                actualizarCuerpoTabla(todosLosEquipos);
                return;
            }

            const filtrados = todosLosEquipos.filter(equipo => {
                const valor = String(equipo[campo] || "").toLowerCase();
                // CORRECCIÓN: .startsWith() busca solo desde el inicio de la cadena
                return valor.startsWith(texto);
            });

            actualizarCuerpoTabla(filtrados);
        });

        // 4. Renderizado inicial
        actualizarCuerpoTabla(todosLosEquipos);

    } catch (error) {
        console.error("Error en Visco-Inventario:", error);
        contenedor.innerHTML = '<div class="error-box">Error al cargar datos del servidor.</div>';
    }
}

 
function actualizarCuerpoTabla(lista) {
    const cuerpo = document.getElementById('cuerpo-tabla');
    if (!cuerpo) return;

    cuerpo.innerHTML = lista.map(equipo => {
        const fechaMod = equipo.fecha_modificacion ? new Date(equipo.fecha_modificacion).toLocaleDateString() : 'N/A';
        const fmoId = equipo.fmo || 'S/N';
        const estadoClase = equipo.estado?.toLowerCase() || 'desconocido';
        
        return `
            <tr>
                <td>${equipo.clase || '-'}</td>
                <td>${equipo.tipo || '-'}</td>
                <td><strong>${fmoId}</strong></td>
                <td>${equipo.serial || '-'}</td>
                <td>${equipo.marca || '-'}</td>
                <td><span class="etiqueta-estado ${estadoClase}">${equipo.estado || 'N/A'}</span></td>
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
                <td class="celda-acciones">
                    <button class="btn-mini btn-ojo" title="Ver Detalles" onclick="abrirInterfazRegistro('ver_equipo', '${fmoId}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-mini btn-archivo" title="Subir Imágenes" onclick="abrirInterfazRegistro('subir_archivo', '${fmoId}')">
                        <i class="fa-solid fa-images"></i>
                    </button>
                    <button class="btn-mini btn-editar" title="Modificar" onclick="abrirInterfazRegistro('editar_equipo', '${fmoId}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-mini btn-eliminar" title="Eliminar" onclick="confirmarEliminar('${fmoId}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}
/**
 * Variables globales para almacenar los catálogos y filtrar localmente
 */
let catalogoGerencias = [];
let catalogoDepartamentos = [];

async function cargarOpcionesFormulario() {
    const selGerencia = document.getElementById('reg-gerencia');
    const selDepto = document.getElementById('reg-departamento');
    const selResp = document.getElementById('reg-responsable');
    const selClase = document.getElementById('reg-clase');

    try {
        // Usamos un catch individual para que una falla no bloquee a las demás
        const [gerencias, departamentos, responsables, clases] = await Promise.all([
            fetch('/api/gerencias').then(r => r.json()).catch(() => []),
            fetch('/api/departamentos').then(r => r.json()).catch(() => []),
            fetch('/api/responsables').then(r => r.json()).catch(() => []),
            fetch('/api/clases').then(r => r.json()).catch(() => [])
        ]);

        catalogoDepartamentos = departamentos;

        // 1. Llenar Gerencias (solo si tenemos datos)
        if (selGerencia) {
            selGerencia.innerHTML = '<option value="">Seleccione Gerencia</option>';
            gerencias.forEach(g => {
                selGerencia.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
            });
        }

        // 2. Llenar Responsables
        if (selResp) {
            selResp.innerHTML = '<option value="">Seleccione Responsable</option>';
            responsables.forEach(r => {
                selResp.innerHTML += `<option value="${r.id}">${r.nombre} ${r.apellido}</option>`;
            });
        }

        // 3. Llenar Clases
        if (selClase) {
            selClase.innerHTML = '<option value="">Seleccione Clase</option>';
            clases.forEach(c => {
                selClase.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
            });
        }

        // --- LÓGICA DE FILTRADO (Se mantiene igual) ---
        selGerencia.addEventListener('change', (e) => {
            const idGerenciaSel = e.target.value;
            selDepto.innerHTML = '<option value="">Seleccione Departamento</option>';
            const filtrados = catalogoDepartamentos.filter(d => d.id_gerencia == idGerenciaSel);
            filtrados.forEach(d => {
                selDepto.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
            });
        });

    } catch (error) {
        console.error("Error crítico en la carga:", error);
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

function confirmarEliminacion(id) {
    const confirmacion = confirm(`¿Está seguro de que desea dar de baja el equipo con FMO: ${id}? Esta acción quedará registrada en la auditoría.`);
    if (confirmacion) {
        console.log("Procediendo a eliminación lógica de:", id);
        // Aquí llamarías a tu API: ejecutarEliminacion(id);
    }
}


function cargarInterfazActas(contenedor) {
    contenedor.innerHTML = `
        <div class="animacion-seccion seccion-actas">
            <h3><i class="fa-solid fa-file-contract"></i> Gestión de Actas de Entrega</h3>
            <p>Generación y seguimiento de actas de equipos asignados.</p>
            <div class="contenedor-acciones">
                <button class="btn-secundario" onclick="generarReporteActas()">
                    <i class="fa-solid fa-print"></i> Generar Acta PDF
                </button>
            </div>
            <div id="lista-actas">
                </div>
        </div>
    `;
}

function cargarInterfazConfig(contenedor) {
    contenedor.innerHTML = `
        <div class="animacion-seccion seccion-config">
            <h3><i class="fa-solid fa-gear"></i> Configuración del Sistema</h3>
            <div class="grid-config">
                <div class="card-config">
                    <h4>Mantenimiento de Catálogos</h4>
                    <p>Administrar clases, gerencias y departamentos.</p>
                    <button class="btn-secundario">Editar Catálogos</button>
                </div>
                <div class="card-config">
                    <h4>Seguridad</h4>
                    <p>Gestión de usuarios y niveles de acceso.</p>
                    <button class="btn-secundario">Administrar Usuarios</button>
                </div>
            </div>
        </div>
    `;
}


// 1. Abrir Modal y cargar gerencias
async function abrirModal() {
    document.getElementById('modal-reporte').style.display = 'flex';
    const selGerencia = document.getElementById('pdf-gerencia');
    
    try {
        // Hacemos el fetch en el momento justo
        const respuesta = await fetch('/api/gerencias');
        const gerencias = await respuesta.json();
        
        selGerencia.innerHTML = '<option value="">Seleccione Gerencia...</option>';
        gerencias.forEach(g => {
            selGerencia.innerHTML += `<option value="${g.id}">${g.nombre}</option>`;
        });
    } catch (e) {
        console.error("Error al cargar gerencias:", e);
        alert("No se pudieron cargar las gerencias.");
    }
}

// 2. Filtrar departamentos al cambiar gerencia
async function actualizarDeptosModal() {
    const gerenciaId = document.getElementById('pdf-gerencia').value;
    const selDepto = document.getElementById('pdf-depto');
    
    // Limpiamos
    selDepto.innerHTML = '<option value="">Seleccione Departamento...</option>';
    
    if (!gerenciaId) return;

    try {
        // Obtenemos todos los departamentos (asegúrate de que esta variable tenga los datos)
        // Si no tienes una variable global, haz el fetch aquí:
        const respuesta = await fetch('/api/departamentos'); 
        const todosLosDeptos = await respuesta.json();
        
        // AQUÍ ESTÁ LA LÓGICA DE RELACIÓN DE TABLAS:
        // Filtramos buscando que el id_gerencia del departamento sea igual al seleccionado
        const filtrados = todosLosDeptos.filter(d => String(d.id_gerencia) === String(gerenciaId));
        
        filtrados.forEach(d => {
            selDepto.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
        });
        
        if (filtrados.length === 0) {
            selDepto.innerHTML = '<option value="">No hay departamentos en esta gerencia</option>';
        }
    } catch (e) {
        console.error("Error al filtrar departamentos:", e);
    }
}

function cerrarModal() { document.getElementById('modal-reporte').style.display = 'none'; }

// 3. Generar PDF definitivo
function ejecutarGeneracionPDF() {
    const selG = document.getElementById('pdf-gerencia');
    const selD = document.getElementById('pdf-depto');
    
    if(!selG.value || !selD.value) return alert("Seleccione ambos campos");
    
    const nomG = selG.options[selG.selectedIndex].text.toUpperCase();
    const nomD = selD.options[selD.selectedIndex].text.toUpperCase();
    
    const filtrados = todosLosEquipos.filter(e => e.gerencia.toUpperCase() === nomG && e.departamento.toUpperCase() === nomD);
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Encabezado
    doc.setFontSize(14); doc.text("LISTADO DE EQUIPOS TELEMÁTICOS", 148, 15, { align: "center" });
    doc.setFontSize(12); doc.text(nomD, 148, 22, { align: "center" });
    doc.text(nomG, 148, 29, { align: "center" });
    
    // Tabla con columnas solicitadas
    doc.autoTable({
        startY: 35,
        head: [["N", "Clase", "Tipo", "FMO", "Serial", "Marca", "C. Costo"]],
        body: filtrados.map((e, i) => [i+1, e.clase, e.tipo, e.fmo, e.serial, e.marca, e.centro_costo]),
        theme: 'grid'
    });
    
    doc.save(`Reporte_${nomD}.pdf`);
    cerrarModal();
}

