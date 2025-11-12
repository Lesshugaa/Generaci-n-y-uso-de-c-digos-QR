/* ==========================================================
   Actividad 14 — Generación y uso de Códigos QR (Web)
   - Generar QR personalizable (tamaño, colores, margen, ECC)
   - Descargar PNG del QR
   - Escanear QR con cámara (stream + jsQR)
   - Escanear QR desde imagen subida
========================================================== */

/* ---------- Generación de QR ---------- */
const output = document.getElementById("qr-output");
let qrobj = null;

function eccLevel(value){
  // Mapeo de niveles de corrección de error para qrcodejs
  const map = {
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H
  };
  return map[value] ?? QRCode.CorrectLevel.M;
}

function generateQR(){
  const text = document.getElementById("qr-text").value.trim();
  const size = Math.max(120, Math.min(640, parseInt(document.getElementById("qr-size").value, 10) || 256));
  const ecc = eccLevel(document.getElementById("qr-ecc").value);
  const colorDark = document.getElementById("qr-fg").value || "#000000";
  const colorLight = document.getElementById("qr-bg").value || "#ffffff";
  const margin = Math.max(0, Math.min(16, parseInt(document.getElementById("qr-margin").value, 10) || 2));
  const render = document.getElementById("qr-render").value;

  output.innerHTML = ""; // limpiar
  if (!text){
    output.innerHTML = `<p class="hint">Escribe contenido para generar el QR.</p>`;
    return;
  }

  // Opcional: normalizar URL si empieza por "www."
  const maybeUrl = /^www\./i.test(text) ? "https://" + text : text;

  qrobj = new QRCode(output, {
    text: maybeUrl,
    width: size,
    height: size,
    colorDark,
    colorLight,
    correctLevel: ecc
  });

  // Ajustar margen y modo de render
  const el = output.querySelector("canvas, img");
  if (el && render === "table"){
    // Recrear usando modo tabla (compatibilidad)
    output.innerHTML = "";
    const tmp = new QRCode(output, {
      text: maybeUrl, width: size, height: size,
      colorDark, colorLight, correctLevel: ecc
    });
    // qrcodejs no expone modo tabla directamente en esta versión CDN.
    // Se mantiene canvas/img como salida principal por compatibilidad.
  }

  // Agregar margen envolviendo el canvas con padding
  output.style.padding = margin + "px";
}

document.getElementById("btn-generate").addEventListener("click", generateQR);
document.getElementById("btn-clear").addEventListener("click", () => {
  output.innerHTML = "";
  document.getElementById("qr-text").value = "";
});

document.getElementById("btn-download").addEventListener("click", () => {
  const canvas = output.querySelector("canvas");
  const img = output.querySelector("img");
  if (canvas){
    const a = document.createElement("a");
    a.download = "qr.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  } else if (img && img.src){
    // Si la librería generó <img>, intentamos descargar igual
    const a = document.createElement("a");
    a.download = "qr.png";
    a.href = img.src;
    a.click();
  }
});

/* ---------- Scan con cámara (jsQR) ---------- */
const video = document.getElementById("video");
const frame = document.getElementById("frame");
const overlay = document.getElementById("scan-overlay");
const scanResult = document.getElementById("scan-result");
let stream = null, rafId = null;

async function startCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    video.srcObject = stream;
    video.play();
    overlay.textContent = "Escaneando…";
    loopScan();
  }catch(err){
    overlay.textContent = "No se pudo iniciar la cámara";
    console.error(err);
  }
}

function stopCamera(){
  if (rafId) cancelAnimationFrame(rafId);
  if (stream){
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  overlay.textContent = "Cámara detenida";
}

function loopScan(){
  const ctx = frame.getContext("2d");
  const w = frame.width, h = frame.height;

  const step = () => {
    if (!video.videoWidth){ rafId = requestAnimationFrame(step); return; }
    // Ajustar canvas al video
    frame.width = video.videoWidth;
    frame.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, frame.width, frame.height);
    const imgData = ctx.getImageData(0, 0, frame.width, frame.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "dontInvert" });
    if (code && code.data){
      scanResult.textContent = code.data;
      overlay.textContent = "¡QR detectado!";
      // Resalta el contorno (opcional)
      ctx.beginPath();
      ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
      ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
      ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
      ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
      ctx.closePath();
      ctx.lineWidth = 4; ctx.strokeStyle = "#25d366"; ctx.stroke();
    } else {
      overlay.textContent = "Escaneando…";
    }
    rafId = requestAnimationFrame(step);
  };
  step();
}

document.getElementById("btn-start").addEventListener("click", startCamera);
document.getElementById("btn-stop").addEventListener("click", stopCamera);

/* ---------- Lectura desde imagen ---------- */
const fileInput = document.getElementById("file-input");
const imgCanvas = document.getElementById("img-canvas");
const fileResult = document.getElementById("file-result");

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      imgCanvas.hidden = false;
      imgCanvas.width = img.width;
      imgCanvas.height = img.height;
      const ctx = imgCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
      const code = jsQR(data.data, data.width, data.height);
      if (code && code.data){
        fileResult.textContent = code.data;
      } else {
        fileResult.textContent = "No se detectó un QR válido en la imagen.";
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});
