# Manual técnico

## Responsable y datos corporativos

ConstruServicio Ltda. tiene como dueño y responsable principal a **Richard Chávez**. El contacto corporativo es WhatsApp `3144733375` y correo `construserviciolimitada@gmail.com`.

## Publicar en GitHub Pages

1. Cree un repositorio en GitHub y copie esta carpeta en su rama `main`.
2. Envíe los cambios a `main`; `.github/workflows/deploy-pages.yml` publica automáticamente la carpeta `public/`.
3. En GitHub abra **Settings > Pages** y seleccione **GitHub Actions** como origen si aún no está configurado.
4. Espere el despliegue y abra la URL HTTPS que GitHub Pages muestra. El service worker solo funciona en HTTPS o en `localhost`.
5. Pruebe una orden, genere un PDF y active modo avión antes de entregar el enlace al técnico.

## Prueba desde el teléfono en red local

1. Conecte el computador y el teléfono Android a la misma red Wi-Fi.
2. Desde la raíz del proyecto ejecute `python -m http.server 8080 --directory public --bind 0.0.0.0`.
3. En Windows ejecute `ipconfig` y copie la dirección IPv4 del adaptador conectado a la red.
4. En esta máquina, la IPv4 LAN detectada es `192.168.40.210`; abra `http://192.168.40.210:8080` en Chrome Android. Si la red cambia, use la IPv4 que muestre `ipconfig` y permita Python en redes privadas si Windows lo solicita.
5. Pruebe consecutivo, firma, PDF, historial y WhatsApp. Para validar el modo offline, cargue la aplicación una vez y active modo avión.
6. Esta dirección local sirve para pruebas; para instalación PWA definitiva use la URL HTTPS de GitHub Pages.

## Instalar en Android Chrome

1. Abra la URL publicada en Google Chrome para Android.
2. Espere a que cargue completamente y acepte **Agregar a pantalla de inicio** (también disponible en el menú de tres puntos).
3. Confirme la instalación. La aplicación quedará disponible como PWA y conservará las órdenes en el almacenamiento local del dispositivo.
4. No borre los datos del sitio ni use navegación privada: allí viven el consecutivo y las últimas 50 órdenes.

## Operación offline

El primer acceso debe realizarse con internet para que Chrome descargue el service worker, la interfaz y `jsPDF`. Después se puede activar modo avión. Si se publica una actualización, abra una vez con conexión y recargue cuando Chrome lo solicite.
