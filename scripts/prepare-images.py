"""Turns the photos downloaded from the old WordPress site into sized WebP files.

    python scripts/prepare-images.py <folder with the old site's downloads>

The source folder is the capture of sperantatm.adventist.ro (wp-content uploads in
their year/month folders, plus an "extra" folder). It is not in this repo. Needs
Pillow. Re-run it when a photo changes; it overwrites src/assets/img.
"""
import os
import shutil
import sys
from PIL import Image

if len(sys.argv) != 2:
    sys.exit(__doc__)

SRC = sys.argv[1]
WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(WEB, 'src', 'assets', 'img')

# target name -> (source, max width, quality)
JOBS = {
    'hero.webp': ('assets/2022/11/20190518-Inaugurare-BAZS-Speranta-TM-0098-scaled.jpg', 2000, 72),
    'cladire.webp': ('assets/2022/11/60348659_2199829143441023_5794321081745539072_n.png', 900, 78),
    'copii-ilustratie.webp': ('assets/2025/11/20e05fc6-03f7-4d78-86d8-06f063e2c877.png', 1100, 80),
    'cine-suntem.webp': ('assets/2023/01/20190518-Inaugurare-BAZS-Speranta-TM-0054.jpg', 1200, 76),
    'documentar.webp': ('extra/yt-cEFF7NLLZBo.jpg', 1280, 78),
    'copii-video-poster.webp': ('extra/poster-18.jpg', 600, 80),
    'covers/biblia.webp': ('assets/2022/11/Biblia-Sfanta-Scriptura.png', 440, 84),
    'covers/viata-lui-isus.webp': ('assets/2022/11/Viatalui-Iisus-Ellen-White.png', 440, 84),
    'covers/tragedia-veacurilor.webp': ('assets/2025/05/download.jpg', 440, 84),
    'covers/calea-catre-hristos.webp': ('assets/2022/11/Calea-catre-Hristos-Ellen-White.png', 440, 84),
    'covers/biblia-pentru-elevi.webp': ('extra/biblia-pentru-elevi.png', 440, 84),
    'covers/mesajul-lui-dumnezeu-pentru-tine.webp': ('assets/2025/11/P1790050_72126.jpg', 440, 84),
    'banners/biblia.webp': ('assets/2025/06/sfanta_scriptura_1.jpg', 1600, 70),
    'banners/viata-lui-isus.webp': ('assets/2025/06/viata-lui-isus.jpg', 1600, 70),
    'banners/tragedia-veacurilor.webp': ('assets/2025/06/tragedia-veacurilor.jpg', 1600, 70),
    'banners/calea-catre-hristos.webp': ('assets/2025/06/25369.jpg', 1600, 70),
    'banners/biblia-pentru-elevi.webp': ('extra/biblia-pentru-elevi.png', 1600, 70),
    'banners/mesajul-lui-dumnezeu-pentru-tine.webp': ('assets/2025/11/P1790050_72126.jpg', 1600, 70),
}

for name, (src, width, quality) in JOBS.items():
    out = os.path.join(IMG, name)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(os.path.join(SRC, src)).convert('RGB')
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(out, 'WEBP', quality=quality, method=6)
    print(f'{name:48} {im.size} {os.path.getsize(out) // 1024} KB')

# Logo stays PNG (transparent, small). The icon becomes the favicon.
shutil.copy(os.path.join(SRC, 'assets/2023/01/logo-1.png'), os.path.join(IMG, 'logo.png'))
os.makedirs(os.path.join(WEB, 'public', 'media'), exist_ok=True)
icon = Image.open(os.path.join(SRC, 'assets/2023/01/Biserica-Adventista-de-Ziua-a-Saptea-icon.png'))
icon.resize((64, 64), Image.LANCZOS).save(os.path.join(WEB, 'public', 'favicon.png'))
icon.resize((180, 180), Image.LANCZOS).save(os.path.join(WEB, 'public', 'apple-touch-icon.png'))
shutil.copy(os.path.join(SRC, 'extra/video/copii.mp4'), os.path.join(WEB, 'public', 'media', 'copii.mp4'))
print('logo, favicon, video copied')
