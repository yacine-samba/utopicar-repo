"""Motions des carrousels (A01 à A07) et version courte du dictionnaire : transcription mot à mot des prises de Simon
(faster-whisper medium), mesures, et choix de la prise par vidéo.
Choix : texte le plus fidèle au script (mots retrouvés), puis durée la plus courte ; aucune balise prononcée.
Sorties : audio/vo-c7/<id>-<gen>.words.json, audio/vo-c7/choix.json ({id: fichier}).
usage : python scripts/vo-c7-mots.py [id1,id2…] (depuis video/)"""
import json, glob, os, re, unicodedata, numpy as np, librosa, av
_o = av.open
def _p(*a, **k):
    k.pop('metadata_errors', None); return _o(*a, **k)
av.open = _p   # PyAV récent refuse metadata_errors
from faster_whisper import WhisperModel

SCRIPTS = {
    'dico2': "Juste un voyant rien de grave Traduction jusqu'à mille cinq cents euros Petit bruit au démarrage hmm six cents Embrayage un peu haut Neuf cents Tu additionnes pfff trois mille euros Je colle l'annonce dans UTOPICAR et bam les travaux chiffrés avant d'appeler T'as lu quoi toi Écris-le",
    'A01': "Clio à cinq mille neuf cents euros et jusqu'à dix mille euros de moteur Cinq moteurs à fuir BMW cent seize i Golf 6 TSI Fiesta EcoBoost Clio 4 TCe cent vingt Et numéro un la 208 PureTech Enregistre la liste",
    'A02': "Golf achetée neuf mille cinq cents revendue neuf mille huit cents et tu perds mille deux cents euros Sur le papier Plus trois cents Puis les frais remise en état carte grise trajet mille cinq cents Ton prix max c'était sept mille cinq cents Commente DÉBUTANT",
    'A03': "Tu vends ta 207 trois mille neuf cents euros Un acheteur la prend sans la voir Puis un SMS Paiement reçu validez vos coordonnées Le lien veut ta carte Pour recevoir de l'argent personne n'a besoin de ta carte Envoie ça à ton pote qui vend sa voiture",
    'A04': "Ta première revente Partie un Une Clio 4 à sept mille quatre cents Avant d'appeler ton prix max sept mille soixante Au téléphone Sept mille et elle est à vous Tu achètes Soixante euros sous ton plafond Partie deux samedi",
    'A05': "T'habites Lille la Clio est à Marseille Tu gagnes trois cents euros en négo Train gazole péages sandwich trois cent douze euros Ta négo Moins douze euros Et la voiture faut encore la revendre Envoie ça à ton pote qui fait mille kilomètres pour trois cents balles",
    'A06': "Ta première revente partie deux Six cent quarante euros de frais pile le budget Annonce à huit mille quatre cent quatre-vingt-dix Cinq jours Zéro appel Tu baisses Non Tu changes quatre lignes Partie trois demain",
    'PS1': "Tu craques pour cette Classe A Elle est en vente trois fois à trois prix Tu prends celle du milieu Tu perds deux mille sept cents Pfff Avant d'appeler tu colles l'annonce dans UTOPICAR et bam ton prix max seize mille cinq Trois jours offerts Lien en bio",
    'PS2': "Classe A achetée dix-neuf mille neuf cent quatre-vingt-dix Revendue dix-huit mille six cents Carte grise trajet travaux moins deux mille sept cents Pfff Rembobine Même annonce Avant d'appeler tu la colles dans UTOPICAR et bam prix max seize mille cinq Tu négocies à seize mille Plus mille deux cent quatre-vingt-dix Trois jours offerts Lien en bio",
    'FI1': "Test ADN de la Peugeot cent sept Le père c'est Toyota Même moteur que l'Aygo et la C1 Tu prends laquelle",
    'FI2': "Recette du jour Une carrosserie Peugeot un moteur Toyota et voilà la cent sept Fiable Tu cuisines laquelle",
    'A07': "Ta première revente partie trois Quatre lignes changées trois appels en deux jours Vous faites sept mille neuf Huit mille trois Pneus neufs factures Vendue Plus six cent soixante euros en douze jours Le calcul du jour un étape par étape Commente DÉBUTANT",
}
norm = lambda s: unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()
toks = lambda s: re.findall(r"[a-z0-9]+", norm(s))
M = WhisperModel('medium', device='cpu', compute_type='int8')
res = {}
import sys
ONLY = sys.argv[1].split(',') if len(sys.argv) > 1 else None
for f in sorted(glob.glob('audio/vo-c7/*.mp3')):
    k = os.path.basename(f).split('-')[0]
    if ONLY and k not in ONLY: continue
    segs, _ = M.transcribe(f, language='fr', word_timestamps=True, vad_filter=False)   # sans texte de départ : la transcription doit entendre ce que dit la prise
    W = [{'w': w.word.strip(), 's': round(w.start, 3), 'e': round(w.end, 3)} for s in segs for w in s.words]
    json.dump(W, open(f.replace('.mp3', '.words.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=0)
    got, want = toks(' '.join(w['w'] for w in W)), toks(SCRIPTS[k])
    hit = sum(1 for t in set(want) if t in got) / len(set(want))
    tags = [t for t in ('pause', 'sighs', 'laughs', 'chuckles', 'whispers', 'sarcastic', 'curious') if t in got]
    dur = librosa.get_duration(path=f)
    res.setdefault(k, []).append((f, hit, dur, tags))
    print(f"{os.path.basename(f):34s} {dur:5.2f} s · mots retrouvés {hit:4.0%} · fin {W[-1]['e']:5.2f} s{' · BALISES LUES ' + str(tags) if tags else ''}")
    print('   ', ' '.join(w['w'] for w in W))
choix = json.load(open('audio/vo-c7/choix.json', encoding='utf8')) if ONLY and os.path.exists('audio/vo-c7/choix.json') else {}
for k, L in res.items():
    L = [x for x in L if not x[3]] or L
    best = sorted(L, key=lambda x: (-round(x[1], 2), x[2]))[0]
    choix[k] = os.path.basename(best[0])
json.dump(choix, open('audio/vo-c7/choix.json', 'w', encoding='utf8'), indent=1)
print('choix', choix)
