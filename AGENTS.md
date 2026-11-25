# ConstruServicio OS

## Identidad y alcance
- Marca: **CONSTRUSERVICIO — SERVICIO TÉCNICO Y REPARACIÓN DE ELECTRODOMÉSTICOS**.
- WhatsApp: `3144733375`.
- Correo: `construserviciolimitada@gmail.com`.
- Dueño y responsable principal: **Richard Chávez**.
- La aplicación es un facturero digital y orden de servicio móvil para ConstruServicio Ltda., Soacha, Colombia.

## Restricción de plataforma
El teléfono del técnico bloquea la instalación de archivos `.apk` por política de crédito. La aplicación DEBE ser una PWA 100% funcional offline, desplegable en GitHub Pages e instalable desde Google Chrome mediante "Agregar a pantalla de inicio".

## Arquitectura obligatoria
- HTML: `public/index.html`.
- CSS: `public/css/styles.css`.
- Estado, formulario y consecutivo: `public/js/app.js`.
- Calculadora: `public/js/calculator.js`.
- Firma táctil: `public/js/signature.js`.
- PDF: `public/js/pdf-engine.js`.
- WhatsApp e historial: `public/js/whatsapp-bridge.js`.
- No concentrar la aplicación en un archivo gigante ni introducir dependencias remotas en runtime.

## Offline y dependencias
Todas las librerías externas deben estar en `public/vendor/`. `jsPDF` se carga localmente y todos los recursos de la aplicación se cachean en `public/sw.js`. No usar CDN en HTML, CSS o JavaScript.

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
