
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

        case 'cerrar_sesion':
            titulo.innerText = "Cerrar Sesion";
            cerrarSesion(contenedor);
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
                        <h5 class="subtitle-chart">Distribución por Gerencia</h5>
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
                                <th>Serial</th>
                                <th>Clase</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Fecha Mov.</th>
                                <th>Operador / Responsable</th> 
                            </tr>
                        </thead>
                        <tbody id="body-auditoria">
                            <tr><td colspan="7" class="empty-state">Inicie una consulta de auditoría</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/**
 * Lógica funcional para la Auditoría de Movimientos
 */

// 1. Función genérica para llamar a la API
async function obtenerDatosAuditoria(fechaInicio, fechaFin) {
    const tbody = document.getElementById('body-auditoria');
    tbody.innerHTML = '<tr><td colspan="5">Cargando datos...</td></tr>';

    try {
        const url = `/api/auditoria?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
        const response = await fetch(url);
        const data = await response.json();

        tbody.innerHTML = ''; // Limpiar mensaje de carga

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No se encontraron movimientos en este rango.</td></tr>';
            return;
        }

        data.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.fmo || 'N/A'}</td>
                    <td>${item.serial}</td>
                    <td>${item.clase_nombre || 'N/A'}</td>
                    <td>${item.tipo}</td>
                    <td>${item.estado}</td>
                    <td>${new Date(item.fecha_modificacion).toLocaleString()}</td>
                    <td>${item.responsable_completo || 'N/A'}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error cargando auditoría:", error);
        tbody.innerHTML = '<tr><td colspan="7" style="color:red" class="empty-state">Error al cargar la auditoría.</td></tr>';
    }
}

// 2. Función para los botones 1D, 7D, 1M
function cargarAuditoria(dias) {
    const hoy = new Date();
    const fechaFin = hoy.toISOString().split('T')[0]; // Fecha actual
    
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - dias);
    const fechaInicio = inicio.toISOString().split('T')[0];

    // Actualizamos los inputs visualmente (opcional)
    document.getElementById('fecha-inicio').value = fechaInicio;
    document.getElementById('fecha-fin').value = fechaFin;

    obtenerDatosAuditoria(fechaInicio, fechaFin);
}

// 3. Función para el botón de búsqueda con lupa
function consultarFechasPersonalizadas() {
    const inicio = document.getElementById('fecha-inicio').value;
    const fin = document.getElementById('fecha-fin').value;

    if (!inicio || !fin) {
        alert("Por favor selecciona ambas fechas.");
        return;
    }
    
    obtenerDatosAuditoria(inicio, fin);
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
        const etiquetas = Object.keys(conteoGerencias);
        const valores = Object.values(conteoGerencias);
        window.chartDona = new Chart(ctxDona, {
            type: 'doughnut',
            data: {
                labels: Object.keys(conteoGerencias),
                datasets: [{
                    data: Object.values(conteoGerencias),
                    backgroundColor: generarColores(etiquetas.length)
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

function generarColores(cantidad) {
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
        // Genera colores distribuyendo el tono (hue) uniformemente en el círculo cromático
        const h = Math.round((i * 360) / cantidad);
        colores.push(`hsl(${h}, 70%, 60%)`);
    }
    return colores;
}

/**
 * Genera el formulario de registro con diseño de cuadrícula equilibrado
 */
function cargarFormularioRegistro(contenedor) {
    contenedor.innerHTML = `
        <div class="animacion-seccion contenedor-formulario">
            <form id="form-registro-equipo" class="grid-formulario">
                
                <!-- SECCIÓN 1: Identificación (Ahora más limpia con 3 campos) -->
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

                <!-- SECCIÓN 2: Clasificación (Ahora con Modelo para equilibrar) -->
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
                        <div class="campo">
                            <label>Modelo</label>
                            <input type="text" name="modelo" placeholder="Ej: Latitude 5420" required>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 3: Ubicación y Asignación -->
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

                <!-- SECCIÓN 4: Contabilidad y Estado -->
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

let catalogosSistema = null; // Se inicializa como null para saber si ya cargó

async function inicializarCatalogos() {
    try {
        const [clases, gerencias, departamentos, responsables] = await Promise.all([
            fetch('/api/clases').then(r => r.json()),
            fetch('/api/gerencias').then(r => r.json()),
            fetch('/api/departamentos').then(r => r.json()),
            fetch('/api/responsables').then(r => r.json())
        ]);

        catalogosSistema = { clases, gerencias, departamentos, responsables };
        return catalogosSistema;
    } catch (error) {
        console.error("Error cargando catálogos para edición:", error);
        return null;
    }
}


/**
 * Genera una pantalla emergente (Modal) para el registro de tablas maestras
 */
async function abrirInterfazRegistro(tipo, data = null) {
    let equipo = (typeof data === 'object' && data !== null) 
                 ? data 
                 : todosLosEquipos.find(e => e.id == data) || {};

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
        
        case 'registrar_usuario':
        titulo = "Registrar Nuevo Usuario";
        icono = "fa-user-plus";
        endpoint = "/api/registrar-usuario";
        htmlFormulario = `
        <div class="campo">
            <label>Cédula</label>
            <input type="text" name="cedula" placeholder="Ej: 12345678" required>
        </div>
        <div class="campo">
            <label>Nombre de usuario (Login)</label>
            <input type="text" name="username" placeholder="Ej: mau.arismendi" required>
        </div>
        <div class="campo">
            <label>Nombre Real</label>
            <input type="text" name="nombre_real" placeholder="Ej: Mauricio" required>
        </div>
        <div class="campo">
            <label>Apellido</label>
            <input type="text" name="apellido" placeholder="Ej: Arismendi" required>
        </div>
        <div class="campo">
            <label>Contraseña</label>
            <input type="password" name="password" required>
        </div>
        <div class="campo">
            <label>Rol de Acceso</label>
            <select name="rol" required>
                <option value="usuario">Usuario Normal</option>
                <option value="admin">Administrador</option>
            </select>
        </div>`;
        break;

        case 'editar_equipo':
            // 1. Cargamos los catálogos. Se guardan en la constante 'catalogos'
            const catalogos = await inicializarCatalogos();
            
            if (!catalogos) {
                alert("Error al cargar los catálogos de la base de datos.");
                return;
            }

            titulo = "Modificar Equipo de Inventario";
            icono = "fa-pen-to-square";
            // Forzamos a que el ID sea solo la parte numérica antes del primer símbolo extraño
            const idLimpio = String(equipo.id).split(':')[0].trim();
            endpoint = `/api/equipos/${idLimpio}`;

            // 2. Helper de comparación por texto (mantiene el ID como value)
            const generarHTMLOpciones = (lista, valorActual, esResponsable = false) => {
                return lista.map(item => {
                    const nombreCatalogo = esResponsable 
                        ? `${item.nombre} ${item.apellido}`.trim() 
                        : item.nombre;

                    // Comparamos contra el texto que ya trae tu equipo (clase, departamento, etc.)
                    const isSelected = String(nombreCatalogo).toLowerCase() === String(valorActual).toLowerCase() 
                        ? 'selected' 
                        : '';

                    return `<option value="${item.id}" ${isSelected}>${nombreCatalogo}</option>`;
                }).join('');
            };

            htmlFormulario = `
                <input type="hidden" name="id" value="${equipo.id}">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-height: 70vh; overflow-y: auto; padding-right: 10px;">
                    
                    <div class="campo">
                        <label>Clase de Equipo</label>
                        <select name="clase" required>
                            <option value="">Seleccione Clase...</option>
                            ${generarHTMLOpciones(catalogos.clases, equipo.clase)}
                        </select>
                    </div>

                    <div class="campo">
                        <label>Tipo</label>
                        <input type="text" name="tipo" value="${equipo.tipo || ''}" required>
                    </div>

                    <div class="campo">
                        <label>FMO (Activo)</label>
                        <input type="text" name="fmo" value="${equipo.fmo || ''}" required>
                    </div>

                    <div class="campo">
                        <label>Número de Serial</label>
                        <input type="text" name="serial" value="${equipo.serial || ''}" required>
                    </div>

                    <div class="campo">
                        <label>Modelo</label>
                        <input type="text" name="modelo" value="${equipo.modelo || ''}">
                    </div>

                    <div class="campo">
                        <label>Marca</label>
                        <input type="text" name="marca" value="${equipo.marca || ''}" required>
                    </div>

                    <div class="campo">
                        <label>Gerencia</label>
                        <select name="gerencia" id="select-gerencia" required>
                            <option value="">Seleccione Gerencia...</option>
                            ${generarHTMLOpciones(catalogos.gerencias, equipo.gerencia)}
                        </select>
                    </div>

                    <div class="campo">
                        <label>Departamento</label>
                        <select name="departamento" id="select-departamento" required>
                            <option value="">Seleccione Departamento...</option>
                            ${generarHTMLOpciones(catalogos.departamentos, equipo.departamento)}
                        </select>
                    </div>

                    <div class="campo">
                        <label>Responsable</label>
                        <select name="responsable" required>
                            <option value="">Seleccione Responsable...</option>
                            ${generarHTMLOpciones(catalogos.responsables, equipo.asignado, true)}
                        </select>
                    </div>

                    <div class="campo">
                        <label>Estado Actual</label>
                        <select name="estado" required>
                            <option value="Asignado" ${equipo.estado === 'Asignado' ? 'selected' : ''}>Asignado</option>
                            <option value="Almacén" ${equipo.estado === 'Almacén' ? 'selected' : ''}>En Almacén</option>
                            <option value="Reparación" ${equipo.estado === 'Reparación' ? 'selected' : ''}>En Reparación</option>
                            <option value="Desincorporado" ${equipo.estado === 'Desincorporado' ? 'selected' : ''}>Desincorporado</option>
                        </select>
                    </div>

                    <div class="campo" style="grid-column: span 2;">
                        <label>Observaciones</label>
                        <textarea name="observaciones" rows="2">${equipo.observaciones || equipo.observacion || ''}</textarea>
                    </div>
                </div>`;
            break;

            case 'subir_archivo':
            // 1. Capturamos el ID en una constante local para asegurar su disponibilidad
            const idCapturado = data; 
            const equipoImg = todosLosEquipos.find(e => e.id == idCapturado);
            
            titulo = "Documentación Fotográfica";
            icono = "fa-images";
            
            htmlFormulario = `
                <div class="info-registro-mini">
                    <p><strong>Equipo:</strong> ${equipoImg ? equipoImg.marca + ' ' + equipoImg.modelo : 'N/A'}</p>
                    <p><strong>Serial:</strong> ${equipoImg ? equipoImg.serial : 'N/A'}</p>
                </div>
                <div class="campo full-width">
                    <label>Orden de Compra / Evidencia Física</label>
                    <div class="zona-drop" id="zona-arrastre">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <p>Arrastra la imagen aquí o <span>haz clic para buscar</span></p>
                        <input type="file" id="input-archivo" accept="image/*,application/pdf" multiple style="display:none">
                    </div>
                    <div id="vista-previa" class="preview-img-contenedor"></div>
                </div>
            `;

            setTimeout(() => {
                const btnGuardar = document.querySelector('.btn-guardar-maestro');
                if (!btnGuardar) return;

                const nuevoBtn = btnGuardar.cloneNode(true);
                btnGuardar.parentNode.replaceChild(nuevoBtn, btnGuardar);
                
                nuevoBtn.onclick = (e) => {
                    e.preventDefault();
                    // 2. Usamos la constante capturada anteriormente
                    manejarSubidaImagen(idCapturado, equipoImg);
                };

                activarLogicaArrastre(); 
            }, 100);
            break;
            
            case 'ver_equipo':
    const idVer = data;
    const e = todosLosEquipos.find(item => item.id == idVer);
    
    titulo = "Ficha Técnica del Activo";
    icono = "fa-eye";

    if (!e) {
        htmlFormulario = `<p class="error">Error: Equipo no encontrado.</p>`;
        break;
    }

    htmlFormulario = `
        <div class="visualizacion-equipo">
            <div class="panel-datos">
                <div class="grupo-info">
                    <label><i class="fa-solid fa-microchip"></i> Hardware</label>
                    <p><strong>Clase:</strong> ${e.clase || 'N/A'}</p>
                    <p><strong>Marca/Modelo:</strong> ${e.marca} ${e.modelo || ''}</p>
                    <p><strong>Serial:</strong> <span class="badge-serial">${e.serial}</span></p>
                    <p><strong>FMO:</strong> ${e.fmo || 'Sin asignar'}</p>
                </div>
                
                <div class="grupo-info">
                    <label><i class="fa-solid fa-location-dot"></i> Ubicación y Control</label>
                    <p><strong>Estado:</strong> <span class="status-${String(e.estado).toLowerCase()}">${e.estado}</span></p>
                    <p><strong>Gerencia:</strong> ${e.gerencia || 'N/A'}</p>
                    <p><strong>Departamento:</strong> ${e.departamento || 'N/A'}</p>
                    <p><strong>Responsable:</strong> ${e.asignado || 'Sin responsable'}</p>
                </div>

                <div class="grupo-info full-width">
                    <label><i class="fa-solid fa-comment"></i> Observaciones</label>
                    <p class="txt-observacion">${e.observaciones || e.observacion || 'Sin notas adicionales.'}</p>
                </div>
            </div>

            <div class="panel-archivos">
                <label><i class="fa-solid fa-paperclip"></i> Documentos Adjuntos</label>
                <div id="visor-archivos-equipo" class="mini-galeria-visor">
                    <p class="cargando-mini">Cargando archivos...</p>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
    const btnGuardar = document.querySelector('.btn-guardar-maestro');
    const instruccion = document.querySelector('.instruccion');
    
    if (btnGuardar) btnGuardar.style.display = 'none'; // Ocultamos el botón de acción
    if (instruccion) instruccion.innerText = "Detalles técnicos registrados en el sistema";

    cargarAdjuntosVisor(idVer);
}, 150);
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
                ${htmlFormulario}
                <div class="modal-footer-sistema">
                    <button type="button" onclick="this.closest('.modal-overlay-sistema').remove()" class="btn-cancelar">Cerrar</button>
                    <button type="submit" class="btn-guardar-maestro">Guardar Registro</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    
// Lógica de envío dinámica (Detecta si es creación o edición)
document.getElementById('form-maestro-dinamico').onsubmit = async (e) => {
    e.preventDefault();

    const btnGuardar = e.target.querySelector('.btn-guardar-maestro');
    if (btnGuardar && btnGuardar.style.display === 'none') {
        return; 
    }

    if (e.target.querySelector('input[type="file"]')) {
        return; 
    }

    if (e.target.querySelector('input[type="file"]')) {
        return; 
    }
    
    // Extraemos los datos del formulario (incluyendo el nuevo campo Modelo)
    const datos = Object.fromEntries(new FormData(e.target));

    // Determinamos el método: PUT si hay un ID al final del endpoint, POST si no.
    const partesEndpoint = endpoint.split('/');
    const ultimoSegmento = partesEndpoint.pop() || partesEndpoint.pop(); 
    const metodoSugerido = (!isNaN(ultimoSegmento)) ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch(endpoint, {
            method: metodoSugerido,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            alert("Operación realizada con éxito");
            
            // 1. Cerramos el modal/overlay
            if (typeof overlay !== 'undefined' && overlay) {
                overlay.remove();
            }

            // 2. REFRESCO DE LA TABLA
            // Buscamos el contenedor principal donde se renderiza el inventario
            const contenedorApp = document.getElementById('contenedor-dinamico') || 
                     document.getElementById('contenedor-principal') || 
                     document.querySelector('.main-content');

            if (contenedorApp && typeof cargarInventario === 'function') {
                // Ejecutamos la carga de la tabla para ver los cambios (incluido el Modelo)
                await cargarInventario(contenedorApp); 
            } else {
                // Si el sistema no encuentra dónde refrescar, recarga la página por seguridad
                window.location.reload();
            }

        } else {
            const errorData = await respuesta.json();
            alert("Error: " + (errorData.message || "No se pudo guardar en el servidor"));
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Error de conexión con el servidor");
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
async function cargarAdjuntosVisor(idEquipo) {
    const contenedor = document.getElementById('visor-archivos-equipo');
    if (!contenedor) return;

    try {
        const res = await fetch(`/api/equipos/${idEquipo}/imagenes`);
        const archivos = await res.json();

        if (!archivos || archivos.length === 0) {
            contenedor.innerHTML = '<p class="sin-archivos">No hay evidencias registradas.</p>';
            return;
        }

        // Generamos todas las cards. Si hay 5 imágenes, se crearán 5 divs.
        contenedor.innerHTML = archivos.map(arc => {
            // Aseguramos que la ruta use el prefijo correcto si es necesario
            const rutaCompleta = arc.ruta_archivo; 
            const esPDF = rutaCompleta.toLowerCase().endsWith('.pdf');
            
                        // Dentro de cargarAdjuntosVisor...
            // Dentro de cargarAdjuntosVisor, en el mapeo de archivos:
            return `
                <div class="card-archivo-mini" title="Click para abrir documento">
                    ${esPDF 
                        ? `<a href="${rutaCompleta}" target="_blank" class="enlace-pdf">
                            <i class="fa-solid fa-file-pdf"></i>
                            <span>Ver PDF</span>
                        </a>` 
                        : `<div class="contenedor-img-ajustada" onclick="window.open('${rutaCompleta}', '_blank')">
                            <img src="${rutaCompleta}" alt="Evidencia" onerror="this.src='/imagenes/img-not-found.jpg'">
                        </div>`
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error("Error en visor:", error);
        contenedor.innerHTML = '<p class="error">Error de conexión al cargar archivos.</p>';
    }
}

async function manejarSubidaImagen(idEquipo, datosEquipo) {
    if (!idEquipo) {
        alert("ID de equipo no definido.");
        return;
    }

    const input = document.getElementById('input-archivo');
    // Verificamos que haya al menos un archivo
    if (!input || input.files.length === 0) return alert("Por favor, seleccione al menos una imagen.");

    // Variable para rastrear si todas las subidas fueron exitosas
    let errores = 0;

    // BUCLE PARA MÚLTIPLES ARCHIVOS
    for (let i = 0; i < input.files.length; i++) {
        const archivo = input.files[i];
        const formData = new FormData();
        
        // IMPORTANTE: Añadimos la marca que faltaba
        formData.append('orden_compra', datosEquipo?.orden_compra || 'OC');
        formData.append('marca', datosEquipo?.marca || 'Marca'); // ESTA LÍNEA FALTABA
        formData.append('serial', datosEquipo?.serial || 'S-S');
        formData.append('imagen', archivo); 

        try {
            const respuesta = await fetch(`/api/equipos/${idEquipo}/imagenes`, {
                method: 'POST',
                body: formData
            });

            if (!respuesta.ok) errores++;
        } catch (error) {
            console.error("Error en archivo:", archivo.name, error);
            errores++;
        }
    }

    if (errores === 0) {
        alert("Todos los archivos se subieron con éxito");
    } else {
        alert(`Se completó la subida con ${errores} error(es)`);
    }

    // Limpieza de interfaz
    const modal = document.getElementById('modal-emergente');
    if (modal) modal.remove();
    
    const contenedor = document.getElementById('contenedor-dinamico') || document.querySelector('.main-content');
    if (typeof cargarInventario === 'function') await cargarInventario(contenedor);
}

function activarLogicaArrastre() {
    const zona = document.getElementById('zona-arrastre');
    const input = document.getElementById('input-archivo');
    const vista = document.getElementById('vista-previa');

    if(!zona) return;

    zona.onclick = () => input.click();
    zona.ondragover = (e) => { e.preventDefault(); zona.classList.add('zona-activa'); };
    zona.ondragleave = () => zona.classList.remove('zona-activa');
    zona.ondrop = (e) => {
        e.preventDefault();
        zona.classList.remove('zona-activa');
        input.files = e.dataTransfer.files;
        mostrarPreview(input.files[0], vista);
    };
    input.onchange = () => mostrarPreview(input.files[0], vista);
}

function mostrarPreview(archivo, contenedor) {
    if (!archivo) return;

    // Si es un PDF, mostramos un icono decorativo en lugar de intentar leer la imagen
    if (archivo.type === "application/pdf") {
        contenedor.innerHTML = `
            <div class="pdf-preview-item">
                <i class="fa-solid fa-file-pdf" style="font-size: 3rem; color: #e74c3c;"></i>
                <p style="margin-top: 10px; font-size: 0.9rem;">${archivo.name}</p>
            </div>
        `;
        return; // Salimos de la función
    }

    // Si es imagen, mantenemos tu lógica original con FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
        contenedor.innerHTML = `<img src="${e.target.result}" class="img-preview-fichas">`;
    };
    reader.readAsDataURL(archivo);
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
                                <th>Marca</th> <th>Modelo</th> <th>Estado</th> 
                                <th>Asignado</th> <th>Gerencia</th> <th>Departamento</th>
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
        const estadoClase = equipo.estado?.toLowerCase() || 'desconocido';
        
        return `
            <tr>
                <td>${equipo.clase || '-'}</td>
                <td>${equipo.tipo || '-'}</td>
                <td>${equipo.fmo || '-'}</td>
                <td>${equipo.serial || '-'}</td>
                <td>${equipo.marca || '-'}</td>
                <td>${equipo.modelo || '-'}</td>
                <td><span class="etiqueta-estado ${estadoClase}">${equipo.estado || 'N/A'}</span></td>
                <td>${equipo.asignado || 'Sin Asignar'}</td>
                <td>${equipo.gerencia || '-'}</td>
                <td>${equipo.departamento || '-'}</td>
                <td title="${equipo.observaciones || ''}">
                    <div style="max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${equipo.observaciones || '-'}
                    </div>
                </td>
                <td>${fechaMod}</td>
                <td>${equipo.usuario_modificacion || 'Sistema'}</td>
                <td class="celda-acciones">
                    <button class="btn-mini btn-ojo" title="Ver Detalles" onclick="abrirInterfazRegistro('ver_equipo', '${equipo.id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-mini btn-archivo" title="Subir Imágenes" onclick="abrirInterfazRegistro('subir_archivo', '${equipo.id}')">
                        <i class="fa-solid fa-images"></i>
                    </button>
                    <button class="btn-mini btn-editar" title="Modificar" onclick="abrirInterfazRegistro('editar_equipo', '${equipo.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-mini btn-eliminar" title="Eliminar" onclick="confirmarEliminar('${equipo.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    

    
}


// Asegúrate de que esta función esté definida de forma global
function confirmarEliminar(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro?")) {
        // Aquí llamas a tu API para eliminar
        fetch(`/api/equipos/${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert("Registro eliminado correctamente.");
                // Recargar la tabla o remover la fila
                location.reload(); 
            } else {
                alert("Error al eliminar el registro.");
            }
        })
        .catch(error => console.error('Error:', error));
    }
}
/**
 * Variables globales para almacenar los catálogos y filtrar localmente
 */
// Variables globales para catálogos
let catalogoGerencias = [];
let catalogoDepartamentos = [];
let catalogoResponsables = []; // Añadida
let catalogoClases = [];       // Añadida



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

                // Guardamos en los catálogos globales para que 'editar_equipo' los vea
        catalogoGerencias = gerencias;
        catalogoDepartamentos = departamentos;
        catalogoResponsables = responsables;
        catalogoClases = clases;

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
                    <button class="btn-secundario" onclick="abrirInterfazRegistro('registrar_usuario')"  >Administrar Usuarios</button>
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

function cerrarSesion() {
    // 1. Limpiamos el almacenamiento local y de sesión
    sessionStorage.removeItem('autenticado');
    localStorage.clear();

    // 2. Avisamos al servidor que destruya la sesión en la base de datos/memoria
    fetch('/api/logout', { method: 'POST' })
        .then(() => {
            // 3. Redirigimos al login
            window.location.href = 'login.html';
            
            // 4. LÍNEA CRÍTICA: Limpiamos el historial de navegación
            // Esto reemplaza la página actual por el login, evitando que el botón "Atrás" funcione
            window.history.replaceState(null, '', 'login.html');
        });
}