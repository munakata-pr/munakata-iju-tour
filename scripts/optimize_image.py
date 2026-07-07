import os
from PIL import Image

def optimize_and_copy_image():
    src_path = '/Users/masashi/Desktop/外観1/外観1.jpg'
    dest_path = '/Users/masashi/Desktop/同期なし/munakata-iju-tour/assets/toyotahome_exterior.jpg'
    
    if not os.path.exists(src_path):
        print(f"Error: Source image not found at {src_path}")
        return False
        
    print(f"Opening source image: {src_path} (Size: {os.path.getsize(src_path)} bytes)")
    
    img = Image.open(src_path)
    # 元画像の回転情報を維持するため、EXIFに配慮（PillowのImageOps.exif_transposeが便利です）
    from PIL import ImageOps
    img = ImageOps.exif_transpose(img)
    
    # 適切なサイズに縮小 (Web表示用に最大幅1200pxにリサイズ)
    max_size = 1200
    w, h = img.size
    if w > max_size or h > max_size:
        if w > h:
            new_w = max_size
            new_h = int(h * (max_size / w))
        else:
            new_h = max_size
            new_w = int(w * (max_size / h))
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        print(f"Resized image from {w}x{h} to {new_w}x{new_h}")
    else:
        print(f"Image is already smaller than {max_size}px, skipping resize.")
        
    # Web用に圧縮して保存 (品質85)
    img.save(dest_path, 'JPEG', quality=85, optimize=True)
    print(f"Optimized image saved to {dest_path} (Size: {os.path.getsize(dest_path)} bytes)")
    return True

if __name__ == '__main__':
    optimize_and_copy_image()
