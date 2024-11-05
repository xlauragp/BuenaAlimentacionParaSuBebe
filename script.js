$("#flipbook").turn({
    width: 850,
    height: 450,
    autoCenter: true
});

// Cambiar de página según el capítulo seleccionado
$('#chapter-select').on('change', function() {
    var page = $(this).val();
    $("#flipbook").turn("page", page);
});
