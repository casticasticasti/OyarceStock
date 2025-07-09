// escaner-codigos.js - Funcionalidad del escáner de códigos
class EscanerCodigos {
    constructor() {
        this.stream = null;
        this.video = null;
        this.isScanning = false;
        this.init();
    }

    init() {
        this.video = document.getElementById('cameraPreview');
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('btnIniciarEscaner').addEventListener('click', () => {
            this.iniciarEscaner();
        });

        document.getElementById('btnDetenerEscaner').addEventListener('click', () => {
            this.detenerEscaner();
        });
    }

    async iniciarEscaner() {
        try {
            // Solicitar acceso a la cámara
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment', // Usar cámara trasera si está disponible
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            this.video.srcObject = this.stream;
            this.video.play();
            
            this.isScanning = true;
            this.updateUI();
            
            // Iniciar detección de códigos
            this.startCodeDetection();
            
        } catch (error) {
            console.error('Error accediendo a la cámara:', error);
            this.mostrarError('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    }

    detenerEscaner() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        this.isScanning = false;
        this.updateUI();
    }

    updateUI() {
        const btnIniciar = document.getElementById('btnIniciarEscaner');
        const btnDetener = document.getElementById('btnDetenerEscaner');
        
        if (this.isScanning) {
            btnIniciar.style.display = 'none';
            btnDetener.style.display = 'inline-block';
        } else {
            btnIniciar.style.display = 'inline-block';
            btnDetener.style.display = 'none';
        }
    }

    async startCodeDetection() {
        // Nota: Esta es una implementación básica
        // Para una detección real de códigos QR/barras, necesitarías una librería como QuaggaJS o ZXing
        
        if (!this.isScanning) return;

        try {
            // Simular detección de código
            // En una implementación real, aquí procesarías el frame de video
            await this.processFrame();
            
            // Continuar escaneando
            if (this.isScanning) {
                setTimeout(() => this.startCodeDetection(), 100);
            }
        } catch (error) {
            console.error('Error en detección:', error);
        }
    }

    async processFrame() {
        // Implementación simulada - en la práctica usarías una librería de detección
        // Por ahora, solo mostramos un mensaje de que está escaneando
        
        // Aquí iría la lógica real de detección de códigos
        // Por ejemplo, usando QuaggaJS o ZXing-js
        
        // Simulación de detección exitosa (remover en implementación real)
        if (Math.random() < 0.001) { // 0.1% de probabilidad por frame
            this.onCodeDetected('1234567890123'); // Código simulado
        }
    }

    onCodeDetected(codigo) {
        console.log('Código detectado:', codigo);
        
        // Mostrar código detectado
        document.getElementById('codigoEscaneado').innerHTML = `
            <h3>Código Detectado:</h3>
            <p class="code-result">${codigo}</p>
            <button class="btn-primary" onclick="escanerCodigos.buscarProducto('${codigo}')">
                Buscar Producto
            </button>
            <button class="btn-secondary" onclick="escanerCodigos.agregarConCodigo('${codigo}')">
                Agregar Nuevo
            </button>
        `;
        
        // Detener escáner automáticamente
        this.detenerEscaner();
    }

    buscarProducto(codigo) {
        // Buscar producto en la base de datos por código
        console.log('Buscando producto con código:', codigo);
        
        // Cambiar a pestaña de inventario y buscar
        inventarioManager.cambiarPestaña('inventario');
        document.getElementById('buscarInventario').value = codigo;
        inventarioManager.filtrarInventario(codigo);
    }

    agregarConCodigo(codigo) {
        // Cambiar a pestaña de agregar y pre-llenar el código
        inventarioManager.cambiarPestaña('agregar');
        document.getElementById('producto').value = codigo;
        document.getElementById('producto').focus();
    }

    mostrarError(mensaje) {
        const container = document.getElementById('codigoEscaneado');
        container.innerHTML = `
            <div class="error-message">
                <h3>Error:</h3>
                <p>${mensaje}</p>
            </div>
        `;
    }
}

// Inicializar escáner cuando se carga la página
let escanerCodigos;
document.addEventListener('DOMContentLoaded', () => {
    escanerCodigos = new EscanerCodigos();
});

// Funciones auxiliares para integración con librerías de escáner
// Estas funciones pueden ser usadas para integrar librerías como QuaggaJS

/**
 * Configuración para QuaggaJS (comentado para referencia)
 */
/*
function initQuagga() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#cameraPreview'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            }
        },
        decoder: {
            readers: [
                "code_128_reader",
                "ean_reader",
                "ean_8_reader",
                "code_39_reader",
                "code_39_vin_reader",
                "codabar_reader",
                "upc_reader",
                "upc_e_reader",
                "i2of5_reader"
            ]
        }
    }, function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log("Initialization finished. Ready to start");
        Quagga.start();
    });

    Quagga.onDetected(function(result) {
        console.log(result.codeResult.code);
        escanerCodigos.onCodeDetected(result.codeResult.code);
    });
}
*/

/**
 * Configuración para ZXing-js (comentado para referencia)
 */
/*
async function initZXing() {
    const { BrowserMultiFormatReader } = await import('https://unpkg.com/@zxing/library@latest/esm/index.js');
    
    const codeReader = new BrowserMultiFormatReader();
    
    try {
        const result = await codeReader.decodeOnceFromVideoDevice(undefined, 'cameraPreview');
        console.log(result.text);
        escanerCodigos.onCodeDetected(result.text);
    } catch (err) {
        console.error(err);
    }
}
*/
