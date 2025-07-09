# Guía de Archivos de OyarceStock

Este documento describe cada uno de los archivos y carpetas de la PWA **OyarceStock**, explicando en lenguaje natural su propósito y contenido.

---

## 📂 Carpetas Principales

* **data/**

  * Contiene las hojas de cálculo originales en formato CSV usadas como fuente de datos iniciales:

    * `HojaMarcas.csv`: lista de marcas de productos.
    * `HojaSistemas.csv`: lista de sistemas o categorías generales.

* **datos/**

  * Guarda archivos de datos en formato JSON que definen la estructura y validaciones de los productos:

    * `estructura-productos.json`: modelo de campos obligatorios y opcionales para cada artículo.

* **estilos/**

  * Carpeta de diseño visual con hojas de estilo CSS siguiendo las guías de Apple HIG:

    * `diseño.css`: definen tipografía del sistema, paleta de colores, espaciados y animaciones.

* **iconos/**

  * Almacena imágenes en distintos tamaños para la pantalla de inicio y splash:

    * `icono-192.png` y `icono-512.png`.

* **scripts/**

  * Contiene la lógica de la interfaz, dividida en dos funcionalidades clave:

    * `logica-inventario.js`: gestiona la carga, guardado y edición de productos en IndexedDB, así como el filtrado y la validación de campos.
    * `escaner-codigos.js`: controla la cámara para escanear códigos de barra o QR, integra la lista desplegable con búsqueda y la opción “Agregar” si no existe el elemento.

---

## 📄 Archivos en la Raíz del Proyecto

* **index.html**

  * Archivo HTML principal que estructura la aplicación:

    * Barra superior con título.
    * Sección de lista de inventario.
    * Botón flotante para abrir el escáner o formulario de nuevo producto.
    * Inclusión de hojas de estilo y scripts.

* **manifiesto.json**

  * Manifiesto web que convierte la app en PWA:

    * Define nombre (`OyarceStock`), iconos, colores de tema, modo de visualización `standalone` y orientación.

* **trabajador-servicio.js**

  * Service Worker que habilita:

    * Cacheo de recursos esenciales para funcionamiento offline.
    * Actualización en segundo plano cuando se publica nueva versión.

* **vercel.json**

  * Configuración de despliegue en Vercel:

    * Rutas personalizadas.
    * Cabeceras HTTP para control de cacheo y habilitación de Service Worker.

* **README.md**

  * Documento de referencia rápida:

    * Instrucciones de instalación local.
    * Pasos para desplegar en Vercel.
    * Explicación de la compatibilidad con la app de cotizaciones mediante exportación/importación de datos.

---

## 📝 Resumen de la Estructura de Datos

* La carpeta **data/** contiene los CSV originales de “Marcas” y “Sistemas” usados para poblar las listas desplegables.
* El JSON en **datos/estructura-productos.json** asegura que cada artículo tenga los campos definidos de forma consistente.
* Las listas en la interfaz permitirán buscar o escribir libremente y ofrecerán la opción “Agregar” si la entrada no existe en los datos originarios.

---
