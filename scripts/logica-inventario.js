// logica-inventario.js - Gestión de inventario y datos
class InventarioManager {
    constructor() {
        this.db = null;
        this.productos = [];
        this.marcas = [];
        this.modelos = [];
        this.sistemas = [];
        this.componentes = [];
        this.init();
    }

    async init() {
        try {
            await this.initDB();
            await this.cargarDatosCSV();
            this.setupEventListeners();
            this.cargarProductos();
            this.poblarListas();
        } catch (error) {
            console.error('Error inicializando inventario:', error);
        }
    }

    // Configurar IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('OyarceStockDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear store para productos
                if (!db.objectStoreNames.contains('productos')) {
                    const store = db.createObjectStore('productos', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('producto', 'producto', { unique: false });
                    store.createIndex('marca', 'marca', { unique: false });
                    store.createIndex('modelo', 'modelo', { unique: false });
                    store.createIndex('sistema', 'sistema', { unique: false });
                }
            };
        });
    }

    // Cargar datos desde CSV
    async cargarDatosCSV() {
        try {
            // Cargar marcas
            const marcasResponse = await fetch('data/HojaMarcas.csv');
            const marcasText = await marcasResponse.text();
            this.procesarMarcas(marcasText);

            // Cargar sistemas
            const sistemasResponse = await fetch('data/HojaSistemas.csv');
            const sistemasText = await sistemasResponse.text();
            this.procesarSistemas(sistemasText);

        } catch (error) {
            console.error('Error cargando datos CSV:', error);
        }
    }

    procesarMarcas(csvText) {
        const lineas = csvText.trim().split('\n');
        const marcasLinea = lineas[0].split(',');
        
        // Extraer marcas (saltando el encabezado)
        this.marcas = marcasLinea.slice(1).filter(marca => marca.trim() !== '');
        
        // Procesar modelos por marca
        this.modelos = {};
        for (let i = 1; i < lineas.length; i++) {
            const valores = lineas[i].split(',');
            if (valores.length > 1) {
                for (let j = 1; j < valores.length; j++) {
                    const modelo = valores[j].trim();
                    if (modelo && modelo !== 'Varios') {
                        const marca = this.marcas[j - 1];
                        if (!this.modelos[marca]) {
                            this.modelos[marca] = [];
                        }
                        if (!this.modelos[marca].includes(modelo)) {
                            this.modelos[marca].push(modelo);
                        }
                    }
                }
            }
        }
    }

    procesarSistemas(csvText) {
        const lineas = csvText.trim().split('\n');
        const sistemasLinea = lineas[0].split(',');
        
        // Extraer sistemas (saltando el encabezado)
        this.sistemas = sistemasLinea.slice(1).filter(sistema => sistema.trim() !== '');
        
        // Procesar componentes por sistema
        this.componentes = {};
        for (let i = 1; i < lineas.length; i++) {
            const valores = lineas[i].split(',');
            if (valores.length > 1) {
                for (let j = 1; j < valores.length; j++) {
                    const componente = valores[j].trim();
                    if (componente) {
                        const sistema = this.sistemas[j - 1];
                        if (!this.componentes[sistema]) {
                            this.componentes[sistema] = [];
                        }
                        if (!this.componentes[sistema].includes(componente)) {
                            this.componentes[sistema].push(componente);
                        }
                    }
                }
            }
        }
    }

    // Poblar listas desplegables
    poblarListas() {
        // Poblar marcas
        this.poblarSelect('marca', this.marcas);
        this.poblarSelect('filtroMarca', this.marcas);
        
        // Poblar sistemas
        this.poblarSelect('sistema', this.sistemas);
        this.poblarSelect('filtroSistema', this.sistemas);
        
        // Poblar años (20 años atrás)
        this.poblarAños();
    }

    poblarSelect(selectId, opciones) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Limpiar opciones existentes (excepto la primera)
        const primeraOpcion = select.firstElementChild;
        select.innerHTML = '';
        if (primeraOpcion) {
            select.appendChild(primeraOpcion);
        }

        // Agregar nuevas opciones
        opciones.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion;
            option.textContent = opcion;
            select.appendChild(option);
        });
    }

    poblarAños() {
        const selectAño = document.getElementById('año');
        if (!selectAño) return;

        const añoActual = new Date().getFullYear();
        const años = [];
        
        for (let i = 0; i < 20; i++) {
            años.push(añoActual - i);
        }
        
        this.poblarSelect('año', años);
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegación por pestañas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarPestaña(e.target.dataset.tab);
            });
        });

        // Formulario de agregar producto
        document.getElementById('formAgregarProducto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarProducto();
        });

        // Filtros de marca y sistema
        document.getElementById('marca').addEventListener('change', (e) => {
            this.actualizarModelos(e.target.value);
        });

        document.getElementById('sistema').addEventListener('change', (e) => {
            this.actualizarComponentes(e.target.value);
        });

        // Búsqueda en inventario
        document.getElementById('buscarInventario').addEventListener('input', (e) => {
            this.filtrarInventario(e.target.value);
        });

        // Filtros de inventario
        document.getElementById('filtroMarca').addEventListener('change', () => {
            this.filtrarInventario();
        });

        document.getElementById('filtroSistema').addEventListener('change', () => {
            this.filtrarInventario();
        });

        // Botón de acción rápida
        document.getElementById('btnAccionRapida').addEventListener('click', () => {
            this.cambiarPestaña('agregar');
        });
    }

    // Cambiar pestaña
    cambiarPestaña(pestañaId) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${pestañaId}"]`).classList.add('active');

        // Mostrar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(pestañaId).classList.add('active');
    }

    // Actualizar modelos según marca seleccionada
    actualizarModelos(marca) {
        const selectModelo = document.getElementById('modelo');
        selectModelo.innerHTML = '<option value="">Seleccionar modelo</option>';
        
        if (marca && this.modelos[marca]) {
            this.modelos[marca].forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo;
                option.textContent = modelo;
                selectModelo.appendChild(option);
            });
        }
    }

    // Actualizar componentes según sistema seleccionado
    actualizarComponentes(sistema) {
        const selectComponente = document.getElementById('componente');
        selectComponente.innerHTML = '<option value="">Seleccionar componente</option>';
        
        if (sistema && this.componentes[sistema]) {
            this.componentes[sistema].forEach(componente => {
                const option = document.createElement('option');
                option.value = componente;
                option.textContent = componente;
                selectComponente.appendChild(option);
            });
        }
    }

    // Agregar producto
    async agregarProducto() {
        const formData = new FormData(document.getElementById('formAgregarProducto'));
        const producto = {
            producto: formData.get('producto'),
            descripcion: formData.get('descripcion'),
            marca: formData.get('marca'),
            modelo: formData.get('modelo'),
            año: formData.get('año'),
            sistema: formData.get('sistema'),
            componente: formData.get('componente'),
            estado: formData.get('estado'),
            precio: parseFloat(formData.get('precio')) || 0,
            cantidad: parseInt(formData.get('cantidad')) || 1,
            fechaCreacion: new Date().toISOString()
        };

        try {
            await this.guardarProducto(producto);
            this.mostrarMensaje('Producto agregado exitosamente', 'success');
            document.getElementById('formAgregarProducto').reset();
            this.cargarProductos();
            this.cambiarPestaña('inventario');
        } catch (error) {
            console.error('Error agregando producto:', error);
            this.mostrarMensaje('Error al agregar producto', 'error');
        }
    }

    // Guardar producto en IndexedDB
    async guardarProducto(producto) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['productos'], 'readwrite');
            const store = transaction.objectStore('productos');
            const request = store.add(producto);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Cargar productos desde IndexedDB
    async cargarProductos() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['productos'], 'readonly');
            const store = transaction.objectStore('productos');
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.productos = request.result;
                this.mostrarInventario();
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Mostrar inventario
    mostrarInventario() {
        const contenedor = document.getElementById('listaInventario');
        contenedor.innerHTML = '';

        if (this.productos.length === 0) {
            contenedor.innerHTML = '<p class="no-products">No hay productos en el inventario</p>';
            return;
        }

        this.productos.forEach(producto => {
            const elemento = this.crearElementoProducto(producto);
            contenedor.appendChild(elemento);
        });
    }

    // Crear elemento HTML para producto
    crearElementoProducto(producto) {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <div class="product-info">
                <h3>${producto.producto}</h3>
                <p><strong>Marca:</strong> ${producto.marca} | <strong>Modelo:</strong> ${producto.modelo}</p>
                ${producto.año ? `<p><strong>Año:</strong> ${producto.año}</p>` : ''}
                ${producto.sistema ? `<p><strong>Sistema:</strong> ${producto.sistema}</p>` : ''}
                ${producto.componente ? `<p><strong>Componente:</strong> ${producto.componente}</p>` : ''}
                ${producto.descripcion ? `<p><strong>Descripción:</strong> ${producto.descripcion}</p>` : ''}
                <p><strong>Estado:</strong> ${producto.estado || 'No especificado'}</p>
                <p><strong>Cantidad:</strong> ${producto.cantidad}</p>
                ${producto.precio > 0 ? `<p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>` : ''}
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="inventarioManager.editarProducto(${producto.id})">Editar</button>
                <button class="btn-delete" onclick="inventarioManager.eliminarProducto(${producto.id})">Eliminar</button>
            </div>
        `;
        return div;
    }

    // Filtrar inventario
    filtrarInventario(textoBusqueda = '') {
        const marca = document.getElementById('filtroMarca').value;
        const sistema = document.getElementById('filtroSistema').value;
        const busqueda = textoBusqueda || document.getElementById('buscarInventario').value;

        let productosFiltrados = this.productos;

        if (marca) {
            productosFiltrados = productosFiltrados.filter(p => p.marca === marca);
        }

        if (sistema) {
            productosFiltrados = productosFiltrados.filter(p => p.sistema === sistema);
        }

        if (busqueda) {
            const termino = busqueda.toLowerCase();
            productosFiltrados = productosFiltrados.filter(p => 
                p.producto.toLowerCase().includes(termino) ||
                p.descripcion.toLowerCase().includes(termino) ||
                p.marca.toLowerCase().includes(termino) ||
                p.modelo.toLowerCase().includes(termino)
            );
        }

        this.mostrarProductosFiltrados(productosFiltrados);
    }

    // Mostrar productos filtrados
    mostrarProductosFiltrados(productos) {
        const contenedor = document.getElementById('listaInventario');
        contenedor.innerHTML = '';

        if (productos.length === 0) {
            contenedor.innerHTML = '<p class="no-products">No se encontraron productos</p>';
            return;
        }

        productos.forEach(producto => {
            const elemento = this.crearElementoProducto(producto);
            contenedor.appendChild(elemento);
        });
    }

    // Eliminar producto
    async eliminarProducto(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }

        try {
            await this.eliminarProductoBD(id);
            this.mostrarMensaje('Producto eliminado exitosamente', 'success');
            this.cargarProductos();
        } catch (error) {
            console.error('Error eliminando producto:', error);
            this.mostrarMensaje('Error al eliminar producto', 'error');
        }
    }

    // Eliminar producto de IndexedDB
    async eliminarProductoBD(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['productos'], 'readwrite');
            const store = transaction.objectStore('productos');
            const request = store.delete(id);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Mostrar mensaje
    mostrarMensaje(mensaje, tipo) {
        // Crear elemento de mensaje
        const div = document.createElement('div');
        div.className = `message ${tipo}`;
        div.textContent = mensaje;
        
        // Agregar al DOM
        document.body.appendChild(div);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            div.remove();
        }, 3000);
    }
}

// Inicializar cuando se carga la página
let inventarioManager;
document.addEventListener('DOMContentLoaded', () => {
    inventarioManager = new InventarioManager();
});
