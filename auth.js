function mostrarError(msg) {
    const c = document.getElementById('mensaje-error');
    const t = document.getElementById('texto-error');
    document.getElementById('mensaje-exito').style.display = 'none';
    if (c && t) { t.textContent = msg; c.style.display = 'block'; }
}

function mostrarExito(msg) {
    const c = document.getElementById('mensaje-exito');
    const t = document.getElementById('texto-exito');
    document.getElementById('mensaje-error').style.display = 'none';
    if (c && t) { t.textContent = msg; c.style.display = 'block'; }
}

function ocultarMensajes() {
    document.getElementById('mensaje-error').style.display = 'none';
    document.getElementById('mensaje-exito').style.display = 'none';
}

function mostrarFormulario(id) {
    document.getElementById('form-login').style.display = id === 'form-login' ? 'block' : 'none';
    document.getElementById('form-solicitar-restablecimiento').style.display = id === 'form-solicitar-restablecimiento' ? 'block' : 'none';
    document.getElementById('form-cambiar-clave').style.display = id === 'form-cambiar-clave' ? 'block' : 'none';
    ocultarMensajes();
}

// --- LOGIN ---
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    ocultarMensajes();

    const username = document.getElementById('usuario').value;
    const password = document.getElementById('clave').value;
    const recordar = document.getElementById('recordarme').checked;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, recordar })
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (response.ok) {
            if (data.debeCambiarClave) {
                mostrarFormulario('form-cambiar-clave');
                document.getElementById('usuario-solicitud').value = username;
            } else {
                window.location.href = 'index.html';
            }
        } else {
            const mensajeFinal = (data && data.mensaje) ? data.mensaje : (typeof data === 'string' ? data : 'Usuario o contraseña incorrectos.');
            mostrarError(mensajeFinal);
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarError('No se pudo conectar con el servidor. Inténtalo más tarde.');
    }
});

// --- OLVIDASTE TU CONTRASEÑA ---
document.getElementById('link-olvido-clave').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarFormulario('form-solicitar-restablecimiento');
});

document.getElementById('link-volver-login').addEventListener('click', (e) => {
    e.preventDefault();
    mostrarFormulario('form-login');
});

document.getElementById('btn-enviar-solicitud').addEventListener('click', async () => {
    const username = document.getElementById('usuario-solicitud').value.trim();
    if (!username) {
        mostrarError('Ingresa tu nombre de usuario.');
        return;
    }
    ocultarMensajes();
    try {
        const resp = await fetch('/api/solicitar-restablecimiento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await resp.json();
        if (resp.ok) {
            mostrarExito('Si el usuario existe, se ha enviado una solicitud al administrador.');
            document.getElementById('usuario-solicitud').value = '';
        } else {
            mostrarError(data.error || 'Error al enviar la solicitud.');
        }
    } catch (err) {
        mostrarError('No se pudo conectar con el servidor.');
    }
});

document.getElementById('usuario-solicitud').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-enviar-solicitud').click();
});

// --- CAMBIO FORZADO DE CONTRASEÑA ---
document.getElementById('btn-cambiar-clave').addEventListener('click', async () => {
    const claveNueva = document.getElementById('clave-nueva').value;
    const claveConfirmar = document.getElementById('clave-confirmar').value;

    if (!claveNueva || claveNueva.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (claveNueva !== claveConfirmar) {
        mostrarError('Las contraseñas no coinciden.');
        return;
    }
    ocultarMensajes();
    try {
        const resp = await fetch('/api/cambiar-clave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ claveNueva })
        });
        const data = await resp.json();
        if (resp.ok) {
            mostrarExito('Clave cambiada. Inicia sesión de nuevo.');
            mostrarFormulario('form-login');
            document.getElementById('clave').value = '';
            document.getElementById('usuario').value = document.getElementById('usuario-solicitud').value || '';
            document.getElementById('clave-nueva').value = '';
            document.getElementById('clave-confirmar').value = '';
        } else {
            mostrarError(data.error || 'Error al cambiar la contraseña.');
        }
    } catch (err) {
        mostrarError('No se pudo conectar con el servidor.');
    }
});

document.getElementById('clave-confirmar').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-cambiar-clave').click();
});
