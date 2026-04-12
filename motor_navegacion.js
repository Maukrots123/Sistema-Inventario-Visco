/**
 * Función principal para gestionar la navegación dinámica
 */
async function cambiarSeccion(nombreSeccion, elemento) {
    const contenedor = document.getElementById('contenedor-dinamico');
    
    // 1. Gestionar la clase 'activo' en el menú lateral
    const enlaces = document.querySelectorAll('.menu-navegacion a');
    enlaces.forEach(link => link.classList.remove('activo'));
    elemento.classList.add('activo');

    // 2. Lógica de carga según la sección seleccionada
    switch (nombreSeccion) {
        case 'inventario':
            await cargarInventario(contenedor);
            break;
        case 'dashboard':
            contenedor.innerHTML = `
                <div class="contenedor-tabla">
                    <h2>Panel de Control</h2>
                    <p>Resumen general del estado de los equipos en Visco.</p>
                </div>`;
            break;
        case 'actas':
            contenedor.innerHTML = `
                <div class="contenedor-tabla">
                    <h2>Actas de Entrega</h2>
                    <p>Módulo para la generación y firma digital de actas FMO.</p>
                </div>`;
            break;
        case 'ordenes':
            contenedor.innerHTML = `
                <div class="contenedor-tabla">
                    <h2>Órdenes de Compra</h2>
                    <p>Historial de documentos y facturación telemática.</p>
                </div>`;
            break;
        case 'config':
            contenedor.innerHTML = `
                <div class="contenedor-tabla">
                    <h2>Configuración</h2>
                    <p>Ajustes de usuario y parámetros de la base de datos visco_bd.</p>
                </div>`;
            break;
        default:
            contenedor.innerHTML = '<h2>Sección no encontrada</h2>';
    }
}

/**
 * Función específica para traer datos reales desde PostgreSQL
 */
async function cargarInventario(contenedor) {
    contenedor.innerHTML = '<p>Cargando datos de Visco...</p>';

    try {
        const respuesta = await fetch('/api/equipos');
        const equipos = await respuesta.json();

        let tablaHTML = `
            <div class="contenedor-tabla">
                <div class="encabezado-tabla">
                    <h2>Inventario Real de Equipos</h2>
                    <div class="filtros-fecha">
                        <input type="date" value="2026-04-12">
                    </div>
                </div>
                <table class="tabla-datos">
                    <thead>
                        <tr>
                            <th>FMO</th>
                            <th>Marca</th>
                            <th>Serial</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        equipos.forEach(equipo => {
            tablaHTML += `
                <tr>
                    <td><strong>${equipo.fmo || 'N/A'}</strong></td>
                    <td>${equipo.marca}</td>
                    <td>${equipo.serial}</td>
                    <td><span class="etiqueta-estado ${equipo.estado.toLowerCase() === 'operativo' ? 'operativo' : 'danado'}">${equipo.estado}</span></td>
                </tr>
            `;
        });

        tablaHTML += `</tbody></table></div>`;
        contenedor.innerHTML = tablaHTML;

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = '<p>Error al conectar con el servidor Express.</p>';
    }
}