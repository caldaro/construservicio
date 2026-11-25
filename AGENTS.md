# ConstruServicio OS

## Identidad y alcance
- Marca: **CONSTRUSERVICIO — SERVICIO TÉCNICO Y REPARACIÓN DE ELECTRODOMÉSTICOS**.
- WhatsApp: `3144733375`.
- Correo: `construserviciolimitada@gmail.com`.
- Dueño y responsable principal: **Richard Chávez**.
- La aplicación es un facturero digital y orden de servicio móvil para ConstruServicio Ltda., Soacha, Colombia.

## Plataformas soportadas y sincronización obligatoria
ConstruServicio OS mantiene dos salidas sincronizadas: la PWA modular en `public/` y la compilación HTML5 monolítica para AppCreator24 en `appcreator24/index.html`. Toda modificación visual, de campos o de PDF DEBE hacerse primero en `public/` y compilarse inmediatamente con `powershell -ExecutionPolicy Bypass -File scripts/build-appcreator24.ps1`.

La PWA continúa siendo 100% offline, desplegable en GitHub Pages e instalable desde Google Chrome mediante "Agregar a pantalla de inicio". El APK de AppCreator24 también es una plataforma soportada para el teléfono de Richard Chávez.

## Portal comercial público
`web/` es el portal comercial oficial de ConstruServicio Ltda., separado de la herramienta operativa. Se publica en la raíz de GitHub Pages y dirige a técnicos a `/facturero/`, donde vive la compilación `appcreator24/`. Las modificaciones de marketing, conversión, contenido comercial o diseño de la landing deben hacerse exclusivamente dentro de `web/` sin alterar el flujo operativo del facturero.

## Restricciones Android WebView de AppCreator24
- No registrar `sw.js` ni depender de rutas relativas externas desde `appcreator24/index.html`.
- CSS, `calculator`, `signature`, `pdf-engine`, `whatsapp-bridge`, `app` y `vendor/jspdf.umd.min.js` deben quedar incrustados en línea dentro del HTML compilado.
- WhatsApp debe usar `window.location.href = "https://api.whatsapp.com/send?..."` como respaldo cuando `window.open` sea bloqueado por WebView.
- PDF debe intentar descarga directa con `doc.save(...)` y ofrecer vista previa modal en pantalla con opción de impresión mediante `window.print()` si WebView restringe descargas `blob:`.

## Arquitectura obligatoria
- HTML: `public/index.html`.
- CSS: `public/css/styles.css`.
- Estado, formulario y consecutivo: `public/js/app.js`.
- Calculadora: `public/js/calculator.js`.
- Firma táctil: `public/js/signature.js`.
- PDF: `public/js/pdf-engine.js`.
- Datos Base64 de plantilla PDF: `public/js/template-data.js`.
- WhatsApp e historial: `public/js/whatsapp-bridge.js`.
- No concentrar la aplicación en un archivo gigante ni introducir dependencias remotas en runtime.
- La concentración solo está permitida en el artefacto generado `appcreator24/index.html`; nunca en la fuente modular `public/`.

## Offline y dependencias
Todas las librerías externas deben estar en `public/vendor/`, incluyendo `jsPDF` y `pdf-lib`. La plantilla `public/assets/modelo-factura.pdf` y su copia Base64 local deben funcionar sin red; todos los recursos de la aplicación se cachean en `public/sw.js`. No usar CDN en HTML, CSS o JavaScript.

## Modelo exacto de orden de servicio
- Consecutivo persistente `CS-OS-001`, `CS-OS-002`, etc.; puede editarse manualmente. Fecha actual automática.
- Servicios múltiples: Diagnóstico, Reparación, Instalación, Mantenimiento y Otro con texto libre.
- Cliente: Nombre / Razón Social, Documento / NIT, Teléfono, Dirección, Ciudad / Barrio (Soacha por defecto), correo.
- Equipo: Tipo, Marca, Modelo, Serial y Accesorios / Observaciones.
- Descripción de falla / Reporte del cliente y Servicio realizado / Trabajo efectuado.
- Repuestos dinámicos con Cant, Descripción, Referencia, V. Unit. y V. Total; total sincronizado con Repuestos.
- Observaciones / Recomendaciones.
- Liquidación COP: Diagnóstico, Mano de obra, Repuestos, Desplazamiento, Otros y TOTAL A PAGAR en tiempo real, con miles usando punto.
- Cierre: Técnico Responsable, Nombre Cliente, garantía (30 días por defecto), cláusula legal exacta y firma táctil en canvas con limpiar.

## Calidad
Priorizar UX táctil de alto contraste, botones grandes, `inputmode="numeric"` para valores numéricos, accesibilidad, validación local y funcionamiento sin red. Probar sintaxis, rutas, service worker, PDF, consecutivo, historial de las últimas 50 órdenes y envío por WhatsApp antes de entregar cambios.

## Despliegue y prueba en red local
- Publicar `public/` desde GitHub Pages usando la rama `main` y la carpeta `/public`.
- Para probar en el teléfono antes de publicar, iniciar desde la raíz del proyecto `python -m http.server 8080 --directory public --bind 0.0.0.0`.
- Conectar computador y teléfono a la misma red Wi-Fi, consultar la IPv4 del computador con `ipconfig` y abrir `http://IP-DEL-COMPUTADOR:8080` en Chrome Android.
- Permitir Python en el Firewall de Windows si se solicita. El service worker funciona en esta prueba HTTP local y en GitHub Pages HTTPS.
- Verificar creación de PDF, firma, consecutivo, historial y WhatsApp desde el teléfono; luego probar nuevamente con modo avión.
