"""Remplace des plages d'images d'un MP4 par des images rendues à part (render.mjs --range), puis réencode avec le mix.
Découpe à l'image près (trim + concat) : pas de synchronisation de flux, donc pas de décalage.
usage : python3 scripts/splice.py source.mp4 audio.wav sortie.mp4 DOSSIER_PNG[:première_image] [DOSSIER_PNG ...]
Chaque dossier contient fNNNN.png (numéro d'image à FPS i/s, 30 par défaut ; FPS=60 pour MO3) ; la plage remplacée va de la première à la dernière image."""
import os, re, subprocess, sys

src, audio, out, *dirs = sys.argv[1:]
FPS = os.environ.get('FPS', '30')
N = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
                        'stream=nb_read_frames', '-of', 'csv=p=0', src], capture_output=True, text=True).stdout.strip())
parts = []
for d in dirs:
    fs = sorted(int(m.group(1)) for f in os.listdir(d) if (m := re.match(r'f(\d+)\.png$', f)))
    a, b = fs[0], min(fs[-1], N - 1)
    parts.append((a, b, d))
parts.sort()
inputs, chains, labels, cur = ['-i', src], [], [], 0
norm = f'fps={FPS},scale=1080:1920,setsar=1,format=yuv420p'
for k, (a, b, d) in enumerate(parts):
    if a > cur:
        chains.append(f'[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS,{norm}[s{k}]'); labels.append(f'[s{k}]')
    inputs += ['-framerate', FPS, '-start_number', str(a), '-i', os.path.join(d, 'f%04d.png')]
    chains.append(f'[{k + 1}:v]trim=end_frame={b - a + 1},setpts=PTS-STARTPTS,{norm}[p{k}]'); labels.append(f'[p{k}]')
    cur = b + 1
if cur < N:
    chains.append(f'[0:v]trim=start_frame={cur},setpts=PTS-STARTPTS,{norm}[s{len(parts)}]'); labels.append(f'[s{len(parts)}]')
fc = ';'.join(chains) + ';' + ''.join(labels) + f'concat=n={len(labels)}:v=1:a=0[v]'
ai = len(parts) + 1
cmd = ['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-i', audio, '-filter_complex', fc, '-map', '[v]', '-map', f'{ai}:a',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
       '-r', FPS, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', out]
subprocess.run(cmd, check=True)
M = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries',
                        'stream=nb_read_frames', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip())
print(f'{out} : {M} images (source {N}), plages remplacées : ' + ', '.join(f'{a}–{b}' for a, b, _ in parts))
assert M == N, 'nombre d images différent'
