"""Recale les débuts de mots de faster-whisper sur l'attaque réelle de la voix.

Whisper place parfois un mot après un silence 0,4 à 0,7 s trop tard (P2 : « raté », « 1 650 », sur les prises v3 et v4).
Règle : si entre la fin du mot précédent et le début annoncé il y a un silence (≥ 150 ms sous −40 dB du pic) suivi
d'une voix continue jusqu'au début annoncé, le mot commence à cette attaque.
usage : python3 scripts/words_snap.py P1 P2 …   (depuis video/ ; réécrit audio/vo-c7/<id>.words.json)"""
import json, sys, numpy as np, librosa

def snap(wav, W, hop=0.01, db=-40, sil=0.15):
    y, sr = librosa.load(wav, sr=16000, mono=True)
    pk = np.abs(y).max() + 1e-9; n = int(hop * sr)
    e = np.array([20 * np.log10(np.sqrt((y[i:i + n] ** 2).mean()) / pk + 1e-9) for i in range(0, len(y), n)])
    on = e > db; moved = []
    for j in range(1, len(W)):
        a, b = int(W[j - 1]['e'] / hop), int(W[j]['s'] / hop)
        if b - a < int(sil / hop) or b >= len(on) or not on[b]: continue
        k = b
        while k > a and on[max(a, k - 11):k].any(): k -= 1          # remonte la voix jusqu'à son attaque (trous de moins de 110 ms : occlusives, « ra-té »)
        while k < b and not on[k]: k += 1
        if k > a and (k - a) >= 0 and not on[max(a, k - int(sil / hop)):k].any() and W[j]['s'] - k * hop > 0.15:
            moved.append(f"{W[j]['w']} {W[j]['s']:.2f}→{k * hop:.2f}"); W[j]['s'] = round(k * hop, 3)
    return W, moved

if __name__ == '__main__':
    for k in sys.argv[1:]:
        p = f'audio/vo-c7/{k}.words.json'; W, m = snap(f'audio/vo-c7/{k}.wav', json.load(open(p, encoding='utf8')))
        json.dump(W, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=0); print(k, m)
