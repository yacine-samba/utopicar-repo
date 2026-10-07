"""Compile le skill motion-studio en un seul fichier à coller dans n'importe quelle session (claude.ai, autre dépôt).
usage : python3 build_master_prompt.py [sortie.md]   (défaut : video/MASTER_PROMPT.md à la racine du dépôt)
Le skill reste la source : on ne modifie jamais MASTER_PROMPT.md à la main, on le régénère."""
import os, re, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(REPO, 'video', 'MASTER_PROMPT.md')
skill = open(os.path.join(HERE, 'SKILL.md')).read()
body = re.sub(r'^---.*?---\n', '', skill, flags=re.S).strip()
order = ['intake', 'utopicar', 'codes-attention', 'script-voice', 'motion-craft', 'fluidite', 'techniques', 'sound', 'sound-design', 'qa-delivery', 'lessons']
parts = [
    '# MASTER PROMPT — Motion Studio (UTOPICAR)',
    '',
    '> Colle ce texte au début d\'une nouvelle conversation, puis décris ta vidéo en une phrase.',
    '> Dans ce dépôt, tape simplement `/motion-studio` : c\'est le même contenu, chargé au besoin.',
    '> Généré depuis `.claude/skills/motion-studio/` par `scripts/build_master_prompt.py` — ne pas éditer à la main.',
    '',
    'Tu vas produire un film de motion design haut de gamme en suivant exactement le processus ci-dessous. '
    'Commence par la phase 0, puis pose le questionnaire de la phase 1 avant toute autre chose. '
    'Les renvois `references/<fichier>.md` désignent les sections « Référence » plus bas dans ce document.',
    '',
    re.sub(r'^(#{2,5}) ', lambda m: '#' + m.group(1) + ' ', body, flags=re.M).replace('# Motion Studio', '## Processus', 1),
]
for name in order:
    txt = open(os.path.join(HERE, 'references', name + '.md')).read().strip()
    txt = re.sub(r'^(#{2,5}) ', lambda m: '#' + m.group(1) + ' ', txt, flags=re.M)
    txt = re.sub(r'^# ', '## Référence `references/%s.md` — ' % name, txt, count=1, flags=re.M)
    parts += ['', '---', '', txt]
parts += ['', '---', '', '## Outil de contrôle',
          'Le script `scripts/qa_video.py` du skill mesure chaque MP4 (zones sûres, première image, images vides, plans figés, '
          'loudness et true peak du fichier encodé, son des 2 premières secondes, équilibre pour haut-parleur de téléphone). '
          'Hors de ce dépôt, recrée ces contrôles avec ffmpeg (`ebur128=peak=true`) et une analyse des bords nets dans les marges.']
open(out, 'w').write('\n'.join(parts) + '\n')
print(out, sum(1 for _ in open(out)), 'lignes')
