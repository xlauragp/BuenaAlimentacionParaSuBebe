function initFlipbook() {
    const displayMode = window.innerWidth < 768 ? 'single' : 'double';

    $("#flipbook").turn({
        width: displayMode === 'single' ? Math.min(425, window.innerWidth * 0.95) : Math.min(850, window.innerWidth * 0.9), // Ancho ajustado
        height: Math.min(450, window.innerHeight * 0.6), // Altura ajustada
        autoCenter: true,
        display: displayMode // Modo de visualización
    });
}

// Inicializar el flipbook al cargar la página
$(document).ready(function() {
    initFlipbook();

    // Detectar cambio de tamaño de pantalla
    $(window).on('resize', function() {
        const newDisplayMode = window.innerWidth < 768 ? 'single' : 'double';
        
        $("#flipbook").turn("size", 
            newDisplayMode === 'single' ? Math.min(425, window.innerWidth * 0.95) : Math.min(850, window.innerWidth * 0.9), 
            Math.min(450, window.innerHeight * 0.6)
        );

        $("#flipbook").turn("display", newDisplayMode);
    });
});

// Cambiar de página según el capítulo seleccionado
$('#chapter-select').on('change', function() {
    var page = $(this).val();
    $("#flipbook").turn("page", page);
});

// Elementos y estados
const pencilButton = document.getElementById("toggle-pencil");
const eraserButton = document.getElementById("toggle-eraser");
const pages = document.querySelectorAll("#flipbook .page");
let isPencilActive = false;
let isEraserActive = false;
let isDrawing = false;

// Color y grosor del subrayado
const pencilColor = "rgba(255, 235, 59, 0.01)";
const basePencilSize = 10;
let eraserSize = 20;

// Tamaño adaptable
function adjustToolSizes() {
    const scale = Math.max(0.5, window.innerWidth / 1024);
    eraserSize = 20 * scale;
}
adjustToolSizes();
window.addEventListener("resize", adjustToolSizes);

/// Traducciones de idiomas
const translations = {
    es: {
        activatePencil: "Activar Lápiz",
        deactivatePencil: "Desactivar Lápiz",
        activateEraser: "Activar Borrador",
        deactivateEraser: "Desactivar Borrador"
    },
    en: {
        activatePencil: "Activate Pencil",
        deactivatePencil: "Deactivate Pencil",
        activateEraser: "Activate Eraser",
        deactivateEraser: "Deactivate Eraser"
    }
};

// Detectar el idioma
const lang = document.documentElement.lang || 'es';

// Alternar el lápiz
pencilButton.addEventListener("click", () => {
    isPencilActive = !isPencilActive;
    isEraserActive = false;
    pencilButton.textContent = isPencilActive ? translations[lang].deactivatePencil : translations[lang].activatePencil;
    eraserButton.textContent = translations[lang].activateEraser;
    toggleCanvasPointerEvents(isPencilActive || isEraserActive);
});

// Alternar el borrador
eraserButton.addEventListener("click", () => {
    isEraserActive = !isEraserActive;
    isPencilActive = false;
    eraserButton.textContent = isEraserActive ? translations[lang].deactivateEraser : translations[lang].activateEraser;
    pencilButton.textContent = translations[lang].activatePencil;
    toggleCanvasPointerEvents(isPencilActive || isEraserActive);
});

// Configurar eventos de dibujo en cada página
pages.forEach(page => {
    const canvas = page.querySelector(".drawing-canvas");
    const ctx = canvas.getContext("2d");

    // Ajustar el tamaño del canvas
    canvas.width = page.offsetWidth;
    canvas.height = page.offsetHeight;

    ctx.lineWidth = basePencilSize;
    ctx.strokeStyle = pencilColor;

    // Eventos de dibujo
    canvas.addEventListener("mousedown", (e) => {
        if (isPencilActive || isEraserActive) {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
            $("#flipbook").turn("disable", true); // Desactiva el cambio de página
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (isDrawing) {
            if (isPencilActive) {
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.strokeStyle = pencilColor;
                ctx.lineWidth = basePencilSize;
                ctx.stroke();
            } else if (isEraserActive) {
                ctx.clearRect(e.offsetX - eraserSize / 2, e.offsetY - eraserSize / 2, eraserSize, eraserSize);
            }
        }
    });

    canvas.addEventListener("mouseup", () => {
        isDrawing = false;
        ctx.closePath();
        $("#flipbook").turn("disable", false); // Habilita el cambio de página
    });

    canvas.addEventListener("mouseleave", () => {
        isDrawing = false;
        ctx.closePath();
        $("#flipbook").turn("disable", false); // Habilita el cambio de página
    });
});

// Función para activar/desactivar eventos de dibujo en canvas
function toggleCanvasPointerEvents(enable) {
    pages.forEach(page => {
        const canvas = page.querySelector(".drawing-canvas");
        canvas.style.pointerEvents = enable ? "auto" : "none";
    });
}

pages.forEach(page => {
    const canvas = page.querySelector(".drawing-canvas");
    const ctx = canvas.getContext("2d");
    console.log(canvas, ctx);  // Verificar si el contexto está siendo inicializado
    ctx.lineWidth = basePencilSize;
    ctx.strokeStyle = pencilColor;
});

$(window).on('resize', function() {
    console.log('Resize triggered', window.innerWidth, window.innerHeight);
    const newDisplayMode = window.innerWidth < 768 ? 'single' : 'double';
    $("#flipbook").turn("size", 
        newDisplayMode === 'single' ? Math.min(425, window.innerWidth * 0.95) : Math.min(850, window.innerWidth * 0.9),
        Math.min(450, window.innerHeight * 0.6)
    );
    $("#flipbook").turn("display", newDisplayMode);
});
