import os
import requests
import zipfile
from io import BytesIO

def download_dejavu_fonts():
    """Download DejaVu fonts needed for the PDF report generation"""
    print("Downloading DejaVu fonts...")
    
    # Create fonts directory if it doesn't exist
    if not os.path.exists('fonts'):
        os.makedirs('fonts')
    
    # URLs for the DejaVu fonts
    urls = {
        'DejaVuSansCondensed.ttf': 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSansCondensed.ttf',
        'DejaVuSansCondensed-Bold.ttf': 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSansCondensed-Bold.ttf'
    }
    
    # Download each font
    for font_name, url in urls.items():
        font_path = os.path.join('fonts', font_name)
        
        # Skip if font already exists
        if os.path.exists(font_path):
            print(f"Font {font_name} already exists.")
            continue
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            with open(font_path, 'wb') as f:
                f.write(response.content)
                
            print(f"Downloaded {font_name}")
        except Exception as e:
            print(f"Error downloading {font_name}: {str(e)}")
    
    print("Font download complete!")

if __name__ == "__main__":
    download_dejavu_fonts() 