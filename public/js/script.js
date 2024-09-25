document.addEventListener('DOMContentLoaded', function() {
    // Código dentro de esta función se ejecutará solo cuando el DOM esté completamente cargado
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita la recarga de la página
            
            const nombre = document.getElementById('nombre').value;
            const apellidos = document.getElementById('apellidos').value;

            // Crear el objeto con los datos del formulario
            const formData = { nombre, apellidos };

            // Enviar los datos al servidor con fetch
            fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData), // Enviar los datos como JSON
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Formulario enviado correctamente.');
                } else {
                    alert('Error al enviar el formulario.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error al enviar el formulario.');
            });
        });
    } else {
        console.error('No se encontró el formulario con ID "contactForm".');
    }
});
