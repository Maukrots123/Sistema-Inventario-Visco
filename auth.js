document.querySelector('.formulario-acceso').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usuario, password: clave })
        });

        if (respuesta.ok) {
            // Guardamos que el usuario está autenticado en el navegador
            sessionStorage.setItem('autenticado', 'true');
            window.location.href = 'index.html';
        } else {
            const mensaje = await respuesta.text();
            alert("Acceso denegado: " + mensaje);
        }
    } catch (err) {
        alert("Error de conexión con el servidor");
    }
});