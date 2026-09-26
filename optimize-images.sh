#!/bin/bash
# Aggressive image compression for maximum load time reduction

echo "🖼️  Compressing game assets..."
cd frontend/public/assets

total_before=$(du -sh . | awk '{print $1}')

# Compress PNGs with pngquant (75% quality)
for png in *.png generated/*.png; do
  if [ -f "$png" ]; then
    echo "  Compressing: $png"
    pngquant --quality 60-75 --force --strip "$png" -o "${png%.png}_tmp.png" 2>/dev/null
    if [ -f "${png%.png}_tmp.png" ]; then
      mv "${png%.png}_tmp.png" "$png"
    fi
  fi
done

# Compress JPEGs with mozjpeg (70% quality)
for jpg in *.jpeg *.jpg; do
  if [ -f "$jpg" ]; then
    echo "  Compressing: $jpg"
    jpegoptim --quality=70 --force --quiet "$jpg" 2>/dev/null || true
  fi
done

total_after=$(du -sh . | awk '{print $1}')

echo ""
echo "✅ Compression complete!"
echo "Before: $total_before"
echo "After: $total_after"
