import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def create_star_academy_icon(size):
    # Create image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background: Rounded rectangle / squircle with rich cosmic gradient
    # Deep blue/violet to golden-lit indigo
    radius = int(size * 0.22)
    
    # Draw gradient background on a separate image
    bg = Image.new("RGBA", (size, size), (12, 10, 36, 255))
    bg_draw = ImageDraw.Draw(bg)
    
    # Radial or linear gradient
    cx, cy = size / 2, size / 2
    for y in range(size):
        for x in range(size):
            # Distance from top-center (where the light comes from)
            dx = (x - cx) / size
            dy = (y - size * 0.3) / size
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Interpolate between deep royal violet and cosmic navy
            r = int(max(0, min(255, 30 - dist * 20 + (1 - y/size) * 35)))
            g = int(max(0, min(255, 18 - dist * 10 + (1 - y/size) * 25)))
            b = int(max(0, min(255, 75 - dist * 40 + (1 - y/size) * 60)))
            bg_draw.point((x, y), fill=(r, g, b, 255))
            
    # Mask to rounded rectangle
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=255)
    
    # Golden border ring
    border_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border_img)
    border_width = max(2, int(size * 0.02))
    border_draw.rounded_rectangle(
        [(border_width, border_width), (size - 1 - border_width, size - 1 - border_width)],
        radius=radius - border_width,
        outline=(212, 175, 55, 180),
        width=border_width
    )
    
    # Apply mask to background
    bg.putalpha(mask)
    img.paste(bg, (0, 0), bg)
    img.paste(border_img, (0, 0), border_img)
    
    # Draw central Star
    # 5-pointed star coordinates
    star_center_x = size / 2
    star_center_y = size * 0.46
    outer_radius = size * 0.28
    inner_radius = outer_radius * 0.42
    
    points = []
    for i in range(10):
        angle = -math.pi / 2 + i * (math.pi / 5)
        r = outer_radius if i % 2 == 0 else inner_radius
        px = star_center_x + r * math.cos(angle)
        py = star_center_y + r * math.sin(angle)
        points.append((px, py))
        
    # Star glow
    glow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.polygon(points, fill=(255, 215, 0, 160))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=int(size * 0.05)))
    img.paste(glow_img, (0, 0), glow_img)
    
    # Star fill (gold with light top)
    star_draw = ImageDraw.Draw(img)
    star_draw.polygon(points, fill=(255, 204, 0, 255), outline=(255, 245, 180, 255), width=max(1, int(size * 0.015)))
    
    # Inner facets of the star (3D look)
    for i in range(5):
        tip_idx = i * 2
        in_idx = (tip_idx + 1) % 10
        # Light side facet
        star_draw.polygon([
            (star_center_x, star_center_y),
            points[tip_idx],
            points[in_idx]
        ], fill=(255, 230, 120, 220))
        
    # Little sparkles / stars around
    sparkles = [
        (size * 0.22, size * 0.26, size * 0.035),
        (size * 0.78, size * 0.28, size * 0.04),
        (size * 0.20, size * 0.65, size * 0.025),
        (size * 0.80, size * 0.62, size * 0.03),
    ]
    for sx, sy, sr in sparkles:
        star_draw.ellipse([(sx - sr, sy - sr), (sx + sr, sy + sr)], fill=(255, 240, 180, 230))
        star_draw.line([(sx - sr * 2, sy), (sx + sr * 2, sy)], fill=(255, 255, 255, 220), width=1)
        star_draw.line([(sx, sy - sr * 2), (sx, sy + sr * 2)], fill=(255, 255, 255, 220), width=1)
        
    # "STAR AC" Text banner or label at bottom
    # We can draw stylized bold text or geometric letters
    # Simple crisp bar with STAR AC
    bar_y = int(size * 0.76)
    bar_h = int(size * 0.12)
    bar_w = int(size * 0.68)
    bar_x = int((size - bar_w) / 2)
    
    star_draw.rounded_rectangle(
        [(bar_x, bar_y), (bar_x + bar_w, bar_y + bar_h)],
        radius=int(bar_h * 0.4),
        fill=(18, 14, 52, 230),
        outline=(212, 175, 55, 200),
        width=max(1, int(size * 0.01))
    )
    
    # Try to load default font or draw text
    try:
        font_size = int(size * 0.075)
        # Try generic windows font
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()
        
    text = "STAR ACADEMY"
    # Measure text
    try:
        bbox = star_draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
    except Exception:
        tw, th = len(text) * font_size * 0.5, font_size
        
    tx = (size - tw) / 2
    ty = bar_y + (bar_h - th) / 2 - (font_size * 0.08)
    
    star_draw.text((tx, ty), text, font=font, fill=(255, 225, 120, 255))
    
    return img

if __name__ == "__main__":
    for size, name in [
        (512, "icons/icon-512.png"),
        (192, "icons/icon-192.png"),
        (180, "icons/apple-touch-icon.png"),
        (64, "icons/favicon.png"),
    ]:
        print(f"Generating {name} ({size}x{size})...")
        icon = create_star_academy_icon(size)
        icon.save(name, "PNG")
    print("Done!")
