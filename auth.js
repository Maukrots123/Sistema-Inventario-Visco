document.querySelector('.formulario-acceso').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const usuario = document.getElementById('usuario').value;
    const clave = document.getElementById('clave').value;

    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usuario, password: clave })
        });

        if (respuesta.ok) {
            // Si el login es exitoso, redirigimos al sistema
            window.location.href = 'index.html';
        } else {
            // Manejo de errores (ej. usuario o clave incorrecta)
            const error = await respuesta.text();
            alert("Error: " + error);
        }
    } catch (err) {
        console.error("Error al conectar con el servidor:", err);
        alert("No se pudo conectar con el servidor. Intenta más tarde.");
    }
});