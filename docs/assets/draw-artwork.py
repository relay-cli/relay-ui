"""Draw relay-ui's README banner and social preview with the official Relay mark."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

AVATAR, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
SS = 2  # supersampling

BG = (8, 11, 15)
SURFACE = (17, 24, 32)
RAISED = (32, 42, 52)
RULE = (52, 65, 77)
TEXT = (232, 237, 242)
MUTED = (132, 144, 156)
ACCENT = (255, 138, 61)
FOCUS = (72, 168, 255)
SUCCESS = (79, 209, 139)
WARNING = (240, 200, 75)
DANGER = (255, 77, 90)

FONTS = Path('C:/Windows/Fonts')


def mono(size, weight='Regular'):
    font = ImageFont.truetype(str(FONTS / 'CascadiaMono.ttf'), size * SS)
    font.set_variation_by_name(weight)
    return font


def title_font(size):
    font = ImageFont.truetype(str(FONTS / 'bahnschrift.ttf'), size * SS)
    font.set_variation_by_name('Bold')
    return font


def symbol(size):
    return ImageFont.truetype(str(FONTS / 'seguisym.ttf'), size * SS)


def extract_mark():
    """Lift the mark off the avatar's white background with clean, unfringed edges."""
    source = Image.open(AVATAR).convert('RGBA')
    flat = Image.new('RGBA', source.size, (255, 255, 255, 255))
    flat.alpha_composite(source)
    pixels = np.asarray(flat.convert('RGB')).astype(float)
    white = np.array([255.0, 255.0, 255.0])
    palette = np.array([[72, 165, 255], [255, 139, 58], [22, 27, 34]], dtype=float)
    distances = np.stack([np.linalg.norm(pixels - c, axis=2) for c in palette], axis=2)
    nearest = distances.argmin(axis=2)
    target = palette[nearest]
    alpha = np.linalg.norm(pixels - white, axis=2) / np.linalg.norm(target - white, axis=2)
    alpha = np.clip((alpha - 0.08) / 0.84, 0, 1)
    rgba = np.dstack([target, alpha * 255]).astype(np.uint8)
    mark = Image.fromarray(rgba, 'RGBA')
    return mark.crop(mark.getbbox())


MARK = extract_mark()


def background(width, height):
    image = Image.new('RGB', (width * SS, height * SS), BG)
    glow = Image.new('L', image.size, 0)
    ImageDraw.Draw(glow).ellipse(
        (int(width * 0.45) * SS, -height * SS // 2, int(width * 1.3) * SS, height * SS),
        fill=26,
    )
    glow = glow.filter(ImageFilter.GaussianBlur(160 * SS))
    image.paste(Image.new('RGB', image.size, (28, 38, 50)), mask=glow)
    return image


def s(value):
    return int(value * SS)


def panel(draw, box, bar, label, size):
    x0, y0, x1, y1 = box
    draw.rounded_rectangle((s(x0), s(y0), s(x1), s(y1)), radius=s(12), fill=SURFACE,
                           outline=RULE, width=s(2))
    draw.rounded_rectangle((s(x0), s(y0), s(x0 + 9), s(y1)), radius=s(5), fill=bar)
    draw.rectangle((s(x0 + 5), s(y0 + 1), s(x0 + 9), s(y1 - 1)), fill=bar)
    draw.text((s(x0 + 34), s(y0 + 22)), label, font=mono(size, 'Bold'), fill=bar)
    return x0 + 34, y0 + 22 + size * 1.55


def text_run(draw, x, y, parts, size, weight='Regular'):
    """Draw [(text, color, weight?)] left to right and return the end x."""
    for part in parts:
        value, color = part[0], part[1]
        font = mono(size, part[2] if len(part) > 2 else weight)
        draw.text((s(x), s(y)), value, font=font, fill=color)
        x += draw.textlength(value, font=font) / SS
    return x


def table_panel(draw, box, size):
    x, y = panel(draw, box, FOCUS, 'TABLE', size)
    line = size * 1.38
    cell = draw.textlength('M', font=mono(size)) / SS
    total = int((box[2] - x - 34) / cell)
    widths = {'Method': 6, 'Path': total - 6 - 6 - 8 - 6, 'Status': 6, 'Time': 8}
    cols = [('Method', 0, 'l'), ('Path', 8, 'l'), ('Status', total - 16, 'r'),
            ('Time', total - 8, 'r')]

    def row(values, colors, weight='Regular'):
        for (name, start, align), value, color in zip(cols, values, colors):
            if len(value) > widths[name]:  # cut in the middle, as Table does for paths
                keep = widths[name] - 1
                value = value[: (keep + 1) // 2] + '…' + value[len(value) - keep // 2 :]
            pad = widths[name] - len(value) if align == 'r' else 0
            text_run(draw, x + (start + pad) * cell, row.y, [(value, color, weight)], size)
        row.y += line

    row.y = y
    row([c[0] for c in cols], [MUTED] * 4, 'Bold')
    draw.line((s(x), s(row.y - line * 0.2), s(x + total * cell), s(row.y - line * 0.2)),
              fill=RULE, width=s(2))
    row.y += line * 0.15
    data = [
        ('GET', '/health', '200', '3.2 ms', SUCCESS),
        ('POST', '/api/orders/2026/10/21/items', '201', '48.9 ms', SUCCESS),
        ('GET', '/api/orders/unknown', '404', '1.1 ms', WARNING),
        ('PUT', '/api/settings', '500', '212.4 ms', DANGER),
    ]
    for index, (method, path, status, time, color) in enumerate(data):
        if index == 1:
            draw.rectangle((s(x - 10), s(row.y - line * 0.12), s(x + total * cell + 10),
                            s(row.y + line * 0.86)), fill=RAISED)
            row([method, path, status, time], [FOCUS] * 4, 'Bold')
        else:
            row([method, path, status, time], [TEXT, TEXT, color, TEXT])


def spinner_panel(draw, box, size):
    x, y = panel(draw, box, ACCENT, 'SPINNER', size)
    line = size * 1.78
    sym = symbol(size)
    rows = [('⠹', ACCENT, 'Starting server', TEXT), ('✓', SUCCESS, 'Build finished', MUTED),
            ('✗', DANGER, 'Tests failed', MUTED)]
    for glyph, glyph_color, label, label_color in rows:
        draw.text((s(x), s(y)), glyph, font=sym if glyph == '✗' else mono(size, 'Bold'),
                  fill=glyph_color)
        text_run(draw, x + size * 1.1, y, [(label, label_color)], size)
        y += line


def markdown_panel(draw, box, size):
    x, y = panel(draw, box, SUCCESS, 'MARKDOWN', size)
    line = size * 1.78
    text_run(draw, x, y, [('Deploy checklist', ACCENT, 'Bold')], size)
    y += line * 1.1
    text_run(draw, x, y, [('1. ', MUTED), ('Run ', TEXT), ('npm test', ACCENT)], size)
    y += line
    text_run(draw, x, y, [('2. ', MUTED), ('Tag ', TEXT), ('main', TEXT, 'Bold')], size)
    y += line
    draw.line((s(x + 4), s(y + 2), s(x + 4), s(y + size * 1.2)), fill=RULE, width=s(3))
    text_run(draw, x + 18, y, [('Ship it.', MUTED)], size)


def place_mark(image, x, y, height):
    mark = MARK.resize((s(MARK.width * height / MARK.height), s(height)), Image.LANCZOS)
    image.paste(mark, (s(x), s(y)), mark)
    return MARK.width * height / MARK.height


def interface(draw, left, top, right, bottom, size):
    gap = 22
    split = top + (bottom - top) * 0.5
    table_panel(draw, (left, top, right, split - gap / 2), size)
    middle = left + (right - left) * 0.5
    spinner_panel(draw, (left, split + gap / 2, middle - gap / 2, bottom), size)
    markdown_panel(draw, (middle + gap / 2, split + gap / 2, right, bottom), size)


def banner():
    width, height = 2172, 724
    image = background(width, height)
    draw = ImageDraw.Draw(image)
    place_mark(image, 128, 178, 236)
    draw.text((s(58), s(440)), 'RELAY UI', font=title_font(142), fill=TEXT)
    draw.text((s(62), s(600)), 'Shared components for terminal tools.', font=mono(27),
              fill=(196, 204, 212))
    draw.line((s(940), s(74), s(940), s(650)), fill=(36, 46, 56), width=s(2))
    interface(draw, 1004, 94, 2112, 628, 25)
    image.resize((width, height), Image.LANCZOS).save(OUT / 'banner.png', optimize=True)


def social():
    width, height = 1774, 887
    image = background(width, height)
    draw = ImageDraw.Draw(image)
    mark_width = place_mark(image, 60, 346, 184)
    draw.text((s(64 + mark_width + 36), s(372)), 'RELAY UI', font=title_font(116), fill=TEXT)
    draw.line((s(836), s(150), s(836), s(737)), fill=(36, 46, 56), width=s(2))
    interface(draw, 884, 150, 1722, 737, 27)
    image.resize((width, height), Image.LANCZOS).save(OUT / 'social-preview.png', optimize=True)


banner()
social()
