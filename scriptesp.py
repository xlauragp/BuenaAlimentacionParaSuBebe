from PIL import Image, ImageFilter
import os

# Ruta de la imagen
image_path = 'paginas/img1.jpg'

# Abre la imagen y obtiene sus dimensiones
with Image.open(image_path) as img:
    width, height = img.size

print(f"Dimensiones de la imagen: {width}x{height}")

# Directorios de entrada y salida
input_folder = 'paginas'
output_folder = 'output_images'

# Crear la carpeta de salida si no existe
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Desired width and height f
desired_width = 1024  
desired_height = 1016 

# Procesar todas las imágenes en el directorio de entrada
for filename in os.listdir(input_folder):
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)

        # Aplicar sharpen filter para mayor detalle
        img = img.filter(ImageFilter.SHARPEN)

        # Redimensionar la imagen
        img.thumbnail((desired_width, desired_height), Image.LANCZOS)

        # Crea un fondo blanco
        new_img = Image.new("RGB", (desired_width, desired_height), (255, 255, 255))

        # Pegar la imagen al centro del fondo
        offset = ((desired_width - img.size[0]) // 2, (desired_height - img.size[1]) // 2)
        new_img.paste(img, offset)

        #Guardar la imagen redimencionada en la carpeta de salida con mejor resolución
        output_path = os.path.join(output_folder, filename)
        new_img.save(output_path, quality=100, optimize=True)
        print(f'Resized and saved {filename} to {output_folder}')

print('All images have been resized.')
