from PIL import Image, ImageFilter
import os

# Ruta de la imagen
image_path = 'paginas/img1.jpg'

# Abre la imagen y obtiene sus dimensiones
with Image.open(image_path) as img:
    width, height = img.size

print(f"Dimensiones de la imagen: {width}x{height}")

# Define the path to the directory containing images
input_folder = 'paginas'
output_folder = 'output_images'

# Create output folder if it doesn't exist
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Desired width and height for consistency
desired_width = 1024  # Ajusta según tus necesidades
desired_height = 1016 # Ajusta según tus necesidades

# Loop through all files in the input folder
for filename in os.listdir(input_folder):
    if filename.endswith(('.png', '.jpg', '.jpeg')):
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)

        # Apply a sharpen filter for better detail
        img = img.filter(ImageFilter.SHARPEN)

        # Resize image maintaining aspect ratio with high quality
        img.thumbnail((desired_width, desired_height), Image.LANCZOS)

        # Create a white background
        new_img = Image.new("RGB", (desired_width, desired_height), (255, 255, 255))

        # Paste the resized image onto the center of the new background
        offset = ((desired_width - img.size[0]) // 2, (desired_height - img.size[1]) // 2)
        new_img.paste(img, offset)

        # Save the resized image to the output folder with high quality
        output_path = os.path.join(output_folder, filename)
        new_img.save(output_path, quality=100, optimize=True)
        print(f'Resized and saved {filename} to {output_folder}')

print('All images have been resized.')
