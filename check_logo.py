import struct

# Check images.png (favicon)
with open('src/assets/images.png', 'rb') as f:
    h = f.read(24)
sig = h[:8]
print(f"PNG signature valid: {sig == b'\\x89PNG\\r\\n\\x1a\\n'}")
if sig[:4] == b'\\x89PNG':
    w = struct.unpack('>I', h[16:20])[0]
    ht = struct.unpack('>I', h[20:24])[0]
    print(f"images.png dimensions: {w}x{ht}")
else:
    print(f"images.png has signature: {sig.hex()}")

# Check hero-solar.jpg
with open('src/assets/hero-solar.jpg', 'rb') as f:
    h = f.read(4)
print(f"hero-solar.jpg starts with FF D8 FF: {h[:2] == b'\\xff\\xd8'} ({h.hex()})")