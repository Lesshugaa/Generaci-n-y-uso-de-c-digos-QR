# Actividad 14 — Códigos QR para Proyectos Web

Proyecto educativo que permite **generar, personalizar y leer códigos QR** desde el navegador.

## Estructura
.
├─ index.html
├─ styles.css
└─ script.js

## Funcionalidades
- **Generar QR** a partir de texto/URL con tamaño, colores, margen y nivel de corrección de error (L/M/Q/H).
- **Descargar** el QR como **PNG**.
- **Escanear en vivo** con la cámara (stream de video + decodificación).
- **Leer desde imagen** (subiendo una foto/captura del QR).

## Requisitos
- Navegador moderno con permiso para acceder a la cámara (para el escaneo en vivo).
- Conexión a Internet para cargar las librerías por CDN:
  - `qrcode.min.js` (generación)
  - `jsQR.min.js` (decodificación)

## Uso
1) Abre `index.html`.
2) En la sección **Generar código QR**, escribe el contenido y presiona **Generar**. Luego podés usar **Descargar PNG**.
3) En **Escanear QR con la cámara**, presiona **Iniciar cámara** y apunta al código.
4) En **Leer QR desde imagen**, sube una foto y obtendrás el resultado.

## Personalización
- El color de frente y de fondo, el tamaño y el margen se ajustan desde el formulario.
- Podés precargar un texto/URL por defecto editando el valor del input `#qr-text`.

## Créditos
- QRCode.js (MIT) y jsQR (MIT).
