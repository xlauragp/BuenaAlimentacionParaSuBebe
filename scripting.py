from PIL import Image
import os

# Directorios de entrada y salida
input_folder = 'paginas_ing'  
output_folder = 'output_images_ing'

# Crear la carpeta de salida si no existe
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Define la región de recorte 
crop_region = (2, 8, 1760, 1860)

# Procesar todas las imágenes en el directorio de entrada
for filename in os.listdir(input_folder):
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)

        # Realizar el recorte
        cropped_img = img.crop(crop_region)

        # Guardar la imagen recortada en el directorio de salida
        output_path = os.path.join(output_folder, filename)
        cropped_img.save(output_path)
        
        print(f'Cropped and saved {filename} to {output_folder}')

print('All images have been cropped.')
