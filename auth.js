document.querySelector('.formulario-acceso').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;
    const recordar = document.getElementById('recordarme').checked;

    // 1. Capturamos los elementos del contenedor de error nativo
    const contenedorError = document.getElementById('mensaje-error');
    const textoError = document.getElementById('texto-error');

    // 2. Limpiamos y ocultamos el aviso en cada nuevo intento de login
    if (contenedorError) contenedorError.style.display = 'none';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, recordar })
        });

        // Manejo seguro por si el backend devuelve un texto plano o un JSON estructurado ({ mensaje: "..." })
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (response.ok) {
            window.location.href = 'index.html';
        } else {
            // 3. Extraemos el mensaje de error del backend
            const mensajeFinal = (data && data.mensaje) ? data.mensaje : (typeof data === 'string' ? data : 'Usuario o contraseña incorrectos.');

            // 4. Mostramos el aviso en la tarjeta de login de forma elegante
            if (contenedorError && textoError) {
                textoError.textContent = mensajeFinal;
                contenedorError.style.display = 'block';
            } else {
                // Respaldo por si el HTML no se ha actualizado todavía
                Swal.fire({
                    icon: 'error',
                    title: 'Error de Acceso',
                    text: mensajeFinal,
                    confirmButtonColor: '#e74c3c'
                });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        if (contenedorError && textoError) {
            textoError.textContent = 'No se pudo conectar con el servidor. Inténtalo más tarde.';
            contenedorError.style.display = 'block';
        }
    }
});