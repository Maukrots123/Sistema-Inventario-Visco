document.querySelector('.formulario-acceso').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;
    // Capturamos el estado del checkbox (true o false)
    const recordar = document.getElementById('recordarme').checked;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, recordar }) // Enviamos 'recordar'
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = 'index.html'; // O la página principal del sistema
        } else {
            alert(data || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});