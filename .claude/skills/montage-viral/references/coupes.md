# Les coupes : ne jamais manger un mot

Retour utilisateur (Henritokane) : « y'a bcp de cut pendant des fins de phrases ça coupe les mots ».

## Ce que fait le moteur (`noyau.borne_segment`)

- Coupes calées sur des îlots de parole lus sur l'énergie (toutes les 5 ms), pas sur les frontières de Whisper ;
  70 ms de traîne après la dernière syllabe, 50 ms avant l'attaque.
- Mots étirés par Whisper repérés (durée anormale) : leur frontière ne compte pas.
- Deux plans consécutifs dans la source partagent un point de coupe, sauf si un vrai silence les sépare (le silence
  part) ; si un plan a avalé les mots du suivant, la coupe revient à l'entrée du suivant.
- Fondus de 12 à 25 ms sur le son aux vraies coupes.

## La vérification (avant chaque rendu)

1. `python work/diag_coupes.py` : niveau à chaque coupe. Sous −36 dB : silence. Entre −36 et −30 : creux entre deux
   mots enchaînés, en général bon. Au-dessus de −30 : **à vérifier**.
2. `python work/profil.py a b` : énergie toutes les 20 ms + mots + îlots. Un creux sous −35 dB = vrai silence, on
   coupe dedans. Une montée brève et forte = attaque d'un mot.
3. `python work/retranscrire.py a b` : seconde écoute Whisper du passage (débuts de mots plus justes, phrase répétée).
4. Corriger dans le découpage : `entree_src` / `sortie_src` (secondes de la source), ou prolonger le plan jusqu'à la
   fin de la phrase plutôt que de couper dans un enchaînement.

Pièges vus : « marche » étiré de 2 s ; « on » étiré de 0,8 s qui faisait entendre la fin du mot d'avant ; une phrase
dite deux fois dont Whisper ne transcrit qu'une ; « fin février » dont le « f » était coupé ; la fin de « scaling »
avant la signature.
