// Variable para el nivel de zoom uniforme de todas las páginas
let globalZoomLevel = 1;
let isDragging = false;
let startX, startY;
let translateX = 0;
let translateY = 0;
// Variable para almacenar la página que está siendo arrastrada
let draggingPage = null;

// Inicializa el flipbook y redimensiona los canvas según la pantalla
function initFlipbook() {
    const aspectRatio = 1 / 1.4;
    const displayMode = window.innerWidth < 800 ? 'single' : 'double';

    const width = displayMode === 'single' 
        ? Math.min(450, window.innerWidth * 0.95) 
        : Math.min(910, window.innerWidth * 0.9);
    const height = displayMode === 'single' 
        ? Math.min(450, width / aspectRatio)
        : Math.min(450, window.innerWidth * 0.9);

    $("#flipbook").turn({
        width: width,
        height: height,
        autoCenter: true,
        display: displayMode
    });

    resizeCanvases(); // Redimensiona los canvas al inicializar

    // Bloquea el cambio de página mientras el usuario está subrayando
    $("#flipbook").on("start", function(event, pageObject, corner) {
        if (isPencilActive || isEraserActive || isDrawing) {
            event.preventDefault(); // Bloquea el evento de cambio de página
            showDrawingAlert(); // Muestra alerta si está subrayando
        }
    });

    // Aplica el nivel de zoom global cuando se cambia de página$("#flipbook").bind("turned", function() {
    $("#flipbook").bind("turned", function() {
        if (!(isPencilActive || isEraserActive || isDrawing)) {
            applyGlobalZoom();
            // No se borra el canvas
        }
    });

    $("#flipbook").on("turning", function(event, page) {
        if (isPencilActive || isEraserActive || isDrawing) {
            event.preventDefault(); // Bloquea el cambio de página
            showDrawingAlert(); // Muestra alerta si está subrayando
        }
    });
}

// Inicializa el flipbook al cargar la página
$(document).ready(function() {
    initFlipbook();

    $(window).on('resize', function() {
        if (!isDrawing) { 
            const displayMode = window.innerWidth < 800 ? 'single' : 'double';
            const width = displayMode === 'single' 
                ? Math.min(450, window.innerWidth * 0.95) 
                : Math.min(900, window.innerWidth * 0.9);
            const height = displayMode === 'single' 
            ? Math.min(450, width / (1 / 1.4))
            : Math.min(450, width / (1 / 1.4));

            $("#flipbook").turn("size", width, height);
            $("#flipbook").turn("display", displayMode);
            
            resizeCanvases();
        }
    });
    // Evento para manejar el inicio del arrastre
    $("#flipbook").on("mousedown touchstart", startDragging);
    $(document).on("mousemove touchmove", dragImage);
    $(document).on("mouseup touchend", stopDragging);
});

// Cambia de página según el capítulo seleccionado
$('#chapter-select').on('change', function() {
    const page = $(this).val();
    $("#flipbook").turn("page", page);
    resizeCanvases();
});

// Evento para manejar el inicio del arrastre en la página donde está el mouse
function startDragging(event) {
    if (globalZoomLevel > 1 && !isPencilActive && !isEraserActive) {
        isDragging = true;
        startX = event.pageX || event.originalEvent.touches[0].pageX;
        startY = event.pageY || event.originalEvent.touches[0].pageY;

        // Detecta la página donde se realizó el mousedown y la almacena en draggingPage
        draggingPage = event.target.closest('.page');
    }
}

// Función para calcular los límites de arrastre en base al tamaño de la página y el nivel de zoom
function getDragLimits(pageElement) {
    const img = pageElement.querySelector("img");
    if (!img) return { maxX: 0, maxY: 0 };

    const pageWidth = img.offsetWidth;
    const pageHeight = img.offsetHeight;

    // Tamaño visible según el zoom (lo que está fuera de la vista es lo que se puede desplazar)
    const maxX = (pageWidth * (globalZoomLevel - 1)) / 2;
    const maxY = (pageHeight * (globalZoomLevel - 1)) / 2;

    return { maxX, maxY };
}


// Arrastra la imagen con límites
function dragImage(event) {
    if (!isDragging || !draggingPage) return;
    
    event.preventDefault();
    const x = event.pageX || event.originalEvent.touches[0].pageX;
    const y = event.pageY || event.originalEvent.touches[0].pageY;
    
    let deltaX = (x - startX) / globalZoomLevel;
    let deltaY = (y - startY) / globalZoomLevel;

    // Calcula los límites máximos de desplazamiento
    const { maxX, maxY } = getDragLimits(draggingPage);

    // Limita `translateX` y `translateY` dentro de los límites calculados
    translateX = Math.max(-maxX, Math.min(maxX, translateX + deltaX));
    translateY = Math.max(-maxY, Math.min(maxY, translateY + deltaY));

    applyZoomToDraggingPage();

    startX = x;
    startY = y;
}

// Evento para detener el arrastre de la imagen
function stopDragging() {
    isDragging = false;
    draggingPage = null; // Resetea la página arrastrada
}

// Función para aplicar el zoom y el arrastre con límites
function applyZoomToDraggingPage() {
    if (draggingPage) {
        const img = draggingPage.querySelector("img");
        
        if (img) {
            if (globalZoomLevel > 1) {
                img.style.transform = `scale(${globalZoomLevel}) translate(${translateX}px, ${translateY}px)`;
            } else {
                // Restaura la imagen a su posición original si el zoom es 1
                img.style.transform = `scale(1)`;
                translateX = 0;
                translateY = 0;
            }
            img.style.transformOrigin = "center center";
        }
    }
}

// Vincula los eventos de inicio, arrastre y fin de arrastre a las páginas
$(document).ready(function() {
    // Inicia el arrastre cuando se hace clic o se toca dentro del flipbook
    $("#flipbook").on("mousedown touchstart", startDragging);
    $(document).on("mousemove touchmove", dragImage);
    $(document).on("mouseup touchend", stopDragging);
});

// Redimensiona cada canvas para que coincida con su página y ajusta al nivel de zoom global
function resizeCanvases() {
    document.querySelectorAll("#flipbook .page .drawing-canvas").forEach(canvas => {
        const page = canvas.closest('.page');

        if (page) {
            // Ajusta el canvas al tamaño de la página considerando el nivel de zoom
            canvas.width = page.offsetWidth;
            canvas.height = page.offsetHeight;
            canvas.style.transform = `scale(${globalZoomLevel})`; // Escala el canvas para que coincida con el zoom
            canvas.style.transformOrigin = 'top left';
            canvas.style.pointerEvents = isPencilActive || isEraserActive ? "auto" : "none"; // Habilita el resaltado
        }
    });
}

//Aplica el nivel de zoom y la posición de arrastre a todas las páginas
function applyGlobalZoom() {
    document.querySelectorAll("#flipbook .page img").forEach(img => {
        if (globalZoomLevel > 1) {
            img.style.transform = `scale(${globalZoomLevel}) translate(${translateX}px, ${translateY}px)`;
        } else {
            // Restaura la imagen a su posición original si el zoom es 1
            img.style.transform = `scale(1)`;
            translateX = 0;
            translateY = 0;
        }
        img.style.transformOrigin = "center center";
    });
    resizeCanvases(); // Asegura que los canvas se ajusten al nuevo nivel de zoom
}

// Variables de herramientas
let isPencilActive = false;
let isEraserActive = false;
let isDrawing = false;
let pencilSize = 10;
let eraserSize = 20;
const pencilColor = "rgba(255, 235, 59, 0.015)";

// Traducciones de idiomas
const translations = {
    es: {
        activatePencil: "Activar Resaltador",
        deactivatePencil: "Desactivar Resaltador",
        activateEraser: "Activar Borrador",
        deactivateEraser: "Desactivar Borrador"
    },
    en: {
        activatePencil: "Activate Highlighter",
        deactivatePencil: "Deactivate Highlighter",
        activateEraser: "Activate Eraser",
        deactivateEraser: "Deactivate Eraser"
    }
};

// Detectar el idioma
const lang = document.documentElement.lang || 'es';

// Activar o desactivar el lápiz
document.getElementById("toggle-pencil").addEventListener("click", () => {
    isPencilActive = !isPencilActive;
    isEraserActive = false;
    updateToolState();
});

// Activar o desactivar el borrador
document.getElementById("toggle-eraser").addEventListener("click", () => {
    isEraserActive = !isEraserActive;
    isPencilActive = false;
    updateToolState();
});

// Actualiza el estado de las herramientas// Actualiza el estado de las herramientas y muestra la alerta si el resaltador o borrador están activos
function updateToolState() {
    document.getElementById("toggle-pencil").textContent = isPencilActive ? translations[lang].deactivatePencil : translations[lang].activatePencil;
    document.getElementById("toggle-eraser").textContent = isEraserActive ? translations[lang].deactivateEraser : translations[lang].activateEraser;
    
    // Mostrar u ocultar la alerta
    const alertDrawingActive = document.getElementById("alert-drawing-active");
    if (isPencilActive || isEraserActive) {
        alertDrawingActive.style.display = 'block';
    } else {
        alertDrawingActive.style.display = 'none';
    }

    document.querySelectorAll("#flipbook .page .drawing-canvas").forEach(canvas => {
        canvas.style.pointerEvents = isPencilActive || isEraserActive ? "auto" : "none";
    });
}

// Configura los eventos de dibujo en todos los canvas
document.querySelectorAll("#flipbook .page .drawing-canvas").forEach(canvas => {
    const ctx = canvas.getContext("2d");

    canvas.addEventListener("mousedown", (e) => startDrawing(e, ctx, canvas));
    canvas.addEventListener("mousemove", (e) => draw(e, ctx, canvas));
    canvas.addEventListener("mouseup", () => stopDrawing(ctx));
    canvas.addEventListener("mouseleave", () => stopDrawing(ctx));
    canvas.addEventListener("touchstart", (e) => startDrawing(e, ctx, canvas));
    canvas.addEventListener("touchmove", (e) => draw(e, ctx, canvas));
    canvas.addEventListener("touchend", () => stopDrawing(ctx));
});

// Empieza a dibujar
function startDrawing(e, ctx, canvas) {
    e.preventDefault();
    isDrawing = true;
    ctx.beginPath();
    const [x, y] = getEventPosition(e, canvas);
    ctx.moveTo(x, y);
}

// Dibuja o borra según la herramienta activa
function draw(e, ctx, canvas) {
    if (!isDrawing) return;
    e.preventDefault();
    const [x, y] = getEventPosition(e, canvas);

    if (isPencilActive) {
        ctx.lineTo(x, y);
        ctx.strokeStyle = pencilColor;
        ctx.lineWidth = pencilSize / globalZoomLevel; // Ajusta el tamaño del lápiz con el nivel de zoom
        ctx.stroke();
        ctx.save(); // Guarda el subrayado permanentemente
    } else if (isEraserActive) {
        ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
    }
}

// Termina el dibujo
function stopDrawing(ctx) {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.closePath();
}

// Obtiene la posición del evento en el canvas
function getEventPosition(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return [x / globalZoomLevel, y / globalZoomLevel]; // Ajusta la posición según el nivel de zoom
}

// Ajusta el tamaño del lápiz y del borrador
document.getElementById("pencil-size").addEventListener("input", (event) => {
    pencilSize = event.target.value;
});

document.getElementById("eraser-size").addEventListener("input", (event) => {
    eraserSize = event.target.value;
});

// Evento para actualizar el nivel de zoom cuando el usuario mueve el control deslizante
document.getElementById("zoom-slider").addEventListener("input", (event) => {
    globalZoomLevel = parseFloat(event.target.value);
    applyGlobalZoom();
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const stripe = Stripe("tu_stripe_public_key"); // Reemplaza con tu clave pública de Stripe
    const payAndDownloadButton = document.getElementById("pay-and-download-button");

    payAndDownloadButton.addEventListener("click", initiatePayment);

    // Iniciar el proceso de pago
    async function initiatePayment() {
        try {
            const response = await fetch("/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const { clientSecret } = await response.json();

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: { token: "tok_visa" }, // Para pruebas, usa "tok_visa" de Stripe
                },
            });

            if (error) {
                alert("Error en el pago: " + error.message);
            } else if (paymentIntent.status === 'succeeded') {
                enableDownload();
            }
        } catch (error) {
            console.error("Error en el proceso de pago:", error);
        }
    }

    // Habilitar la descarga después del pago
    function enableDownload() {
        payAndDownloadButton.textContent = "Descargar PDF del Libro";
        payAndDownloadButton.removeEventListener("click", initiatePayment);
        payAndDownloadButton.addEventListener("click", () => {
            window.location.href = "libro.pdf"; // Ruta del archivo PDF
        });
    }
});
