// login.js - Manejo de autenticación
class LoginManager {
    constructor() {
        this.credenciales = {
            usuario: 'admin',
            clave: 'oyarce2024'
        };
        this.storageKey = 'oyarceAutenticado';
        this.init();
    }

    init() {
        // Verificar si ya está autenticado
        if (this.estaAutenticado()) {
            this.mostrarApp();
        } else {
            this.mostrarLogin();
        }

        // Eventos del formulario de login
        document.getElementById('btnLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.intentarLogin();
        });

        // Login con Enter
        document.getElementById('clave').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.intentarLogin();
            }
        });

        // Cerrar sesión
        document.getElementById('btnCerrarSesion').addEventListener('click', () => {
            this.cerrarSesion();
        });
    }

    estaAutenticado() {
        return localStorage.getItem(this.storageKey) === 'true';
    }

    intentarLogin() {
        const usuario = document.getElementById('usuario').value.trim();
        const clave = document.getElementById('clave').value;
        const errorDiv = document.getElementById('error-message');

        // Limpiar mensaje de error
        errorDiv.textContent = '';

        // Validar campos
        if (!usuario || !clave) {
            this.mostrarError('Por favor ingrese usuario y contraseña');
            return;
        }

        // Validar credenciales
        if (usuario === this.credenciales.usuario && clave === this.credenciales.clave) {
            this.autenticarUsuario();
        } else {
            this.mostrarError('Usuario o contraseña incorrectos');
            this.limpiarCampos();
        }
    }

    autenticarUsuario() {
        // Guardar estado de autenticación
        localStorage.setItem(this.storageKey, 'true');
        
        // Mostrar aplicación
        this.mostrarApp();
        
        // Limpiar campos
        this.limpiarCampos();
    }

    cerrarSesion() {
        // Eliminar estado de autenticación
        localStorage.removeItem(this.storageKey);
        
        // Mostrar login
        this.mostrarLogin();
        
        // Limpiar campos
        this.limpiarCampos();
    }

    mostrarLogin() {
        document.getElementById('login').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
        document.getElementById('btnAccionRapida').style.display = 'none';
        
        // Enfocar campo usuario
        setTimeout(() => {
            document.getElementById('usuario').focus();
        }, 100);
    }

    mostrarApp() {
        document.getElementById('login').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        document.getElementById('btnAccionRapida').style.display = 'block';
        
        // Limpiar mensaje de error
        document.getElementById('error-message').textContent = '';
    }

    mostrarError(mensaje) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'block';
        
        // Ocultar error después de 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    limpiarCampos() {
        document.getElementById('usuario').value = '';
        document.getElementById('clave').value = '';
    }
}

// Inicializar el manager de login cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});
