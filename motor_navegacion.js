// Objeto que almacena el HTML de cada sección
const secciones = {
    dashboard: `
        <div class="contenedor-tabla">
            <h2>Panel de Control</h2>
            <p>Aquí verás las estadísticas generales de Visco.</p>
        </div>
    `,
    inventario: `
        <div class="contenedor-tabla">
            <div class="encabezado-tabla">
                <h2>Listado de Equipos Telemáticos</h2>
                <div class="filtros-fecha">
                    <input type="date" value="2026-04-10">
                    <span>al</span>
                    <input type="date" value="2026-04-10">
                </div>
            </div>
            <table class="tabla-datos">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>FMO</th>
                        <th>Clase</th>
                        <th>Marca / Serial</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td><strong>109440</strong></td>
                        <td>PC</td>
                        <td>DELL / 5H28DK3</td>
                        <td><span class="etiqueta-estado operativo">Operativo</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    actas: `
        <div class="contenedor-tabla">
            <h2>Gestión de Actas de Entrega</h2>
            <p>Módulo para generar y revisar actas firmadas.</p>
            <button class="boton-entrar" style="width: 200px; margin-top: 20px;">Crear Nueva Acta</button>
        </div>
    `,
    ordenes: `
        <div class="contenedor-tabla">
            <h2>Órdenes de Compra (PDF/Imágenes)</h2>
            <p>Historial de documentos cargados en PostgreSQL.</p>
        </div>
    `,
    config: `
        <div class="contenedor-tabla">
            <h2>Configuración del Sistema</h2>
            <p>Ajustes de usuario y base de datos.</p>
        </div>
    `
};

/**
 * Función para cambiar el contenido sin recargar la página
 * @param {string} nombreSeccion - Clave del objeto 'secciones'
 * @param {HTMLElement} elemento - El enlace clickeado para cambiar la clase 'activo'
 */
function cambiarSeccion(nombreSeccion, elemento) {
    // 1. Obtener el contenedor
    const contenedor = document.getElementById('contenedor-dinamico');
    
    // 2. Inyectar el HTML correspondiente
    contenedor.innerHTML = secciones[nombreSeccion];

    // 3. Gestionar la clase 'activo' en el menú
    const enlaces = document.querySelectorAll('.menu-navegacion a');
    enlaces.forEach(link => link.classList.remove('activo'));
    
    // 4. Marcar el actual como activo
    elemento.classList.add('activo');
}