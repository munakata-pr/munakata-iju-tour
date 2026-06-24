import os
from PIL import Image, ImageOps

def crop_favicon():
    img_path = '/Users/masashi/Desktop/同期なし/munakata-iju-tour/assets/favicon.png'
    if not os.path.exists(img_path):
        print(f"Error: File not found at {img_path}")
        return

    # 画像を開く
    img = Image.open(img_path).convert('RGBA')
    width, height = img.size
    print(f"Original size: {width}x{height}")

    # 白背景（R > 250, G > 250, B > 250）以外の範囲を見つける
    # コンテンツの境界を検出するため、ピクセルデータを走査
    pixels = img.load()
    
    # 左上ピクセル (0,0) を背景色の参照値とする
    bg_r, bg_g, bg_b, bg_a = pixels[0, 0]
    print(f"Corner pixel (0,0) color: R={bg_r}, G={bg_g}, B={bg_b}, A={bg_a}")

    # 四隅のピクセルを出力して確認
    print(f"Top-right (width-1, 0) color: {pixels[width-1, 0]}")
    print(f"Bottom-left (0, height-1) color: {pixels[0, height-1]}")
    print(f"Bottom-right (width-1, height-1) color: {pixels[width-1, height-1]}")

    left = width
    top = height
    right = 0
    bottom = 0
    
    found_content = False
    
    # 背景とみなすRGB値の閾値（各値がこの値以上なら白背景とみなす）
    bg_threshold = 240
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # RGBがすべて閾値以上（白に近い）か、アルファ値が低い（透明）なら背景とみなす
            is_background = (r >= bg_threshold and g >= bg_threshold and b >= bg_threshold) or (a < 10)
            
            if not is_background:
                found_content = True
                if x < left:
                    left = x
                if x > right:
                    right = x
                if y < top:
                    top = y
                if y > bottom:
                    bottom = y

    if not found_content:
        print("No content found (image might be entirely background color).")
        return

    print(f"Content bounding box: l={left}, t={top}, r={right}, b={bottom}")
    
    content_w = right - left + 1
    content_h = bottom - top + 1
    print(f"Content dimensions: {content_w}x{content_h}")
    
    # 正方形のサイズを決定
    max_dim = max(content_w, content_h)
    
    # 視認性を高めるため、余白（マージン）を最小限（約5%）にする
    margin = int(max_dim * 0.05)
    if margin < 2:
        margin = 2
        
    new_size = max_dim + margin * 2
    
    # 新しい白い正方形画像を作成
    cropped_img = Image.new('RGBA', (new_size, new_size), (255, 255, 255, 255))
    
    # コンテンツを新しい画像の中央に配置
    paste_x = margin + (max_dim - content_w) // 2
    paste_y = margin + (max_dim - content_h) // 2
    
    # 元の画像からコンテンツ部分を切り取って貼り付け
    box = (left, top, right + 1, bottom + 1)
    content_crop = img.crop(box)
    cropped_img.paste(content_crop, (paste_x, paste_y), content_crop)
    
    # ファビコンとして適切なサイズ（例えば 256x256）にリサイズ
    final_img = cropped_img.resize((256, 256), Image.Resampling.LANCZOS)
    
    # 保存
    final_img.save(img_path, 'PNG')
    print(f"Saved cropped and resized favicon to {img_path}")

if __name__ == '__main__':
    crop_favicon()
