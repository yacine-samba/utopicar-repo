/* Styles de la page 404, chargés seulement par elle (une feuille importée depuis la page introuvable
   était préchargée sur toutes les pages du site). */
export const STYLES_404 = `
/* Page 404 : scène de nuit, toujours sombre (couleurs fixes, quel que soit le thème du site).
   Mouvements : arrivée de la Polo, roues, warnings, profondeur à la souris. Coupés par data-calme et les animations réduites. */

.n404 {
  --mx: 0;
  --my: 0;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: calc(100dvh - 72px);
  color: #f4f1ec;
  background: #05070d;
}

.n404-ciel,
.n404-lueur {
  position: absolute;
  inset: -24px;
  z-index: -1;
  pointer-events: none;
}
.n404-ciel {
  background:
    radial-gradient(ellipse 70% 35% at 70% 100%, rgb(255 120 40 / 0.16), transparent 70%),
    linear-gradient(#03050a, #0a0f1d 55%, #1a130e 100%);
  transform: translate3d(calc(var(--mx) * -8px), calc(var(--my) * -5px), 0);
  transition: transform 0.6s var(--ease-doux);
}
.n404-etoile {
  position: absolute;
  border-radius: 50%;
  background: #fff;
}
/* les warnings éclairent la scène */
.n404-lueur {
  background: radial-gradient(ellipse 45% 30% at 50% 88%, rgb(255 122 31 / 0.2), transparent 70%);
  animation: n404-warn 1.1s steps(1, end) 1.8s infinite both;
}

.n404-contenu {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 32px;
  align-items: start;
  padding-top: clamp(40px, 8vh, 88px);
}
@media (min-width: 900px) {
  .n404-contenu {
    grid-template-columns: minmax(0, 1fr) 340px;
  }
}

.n404-kicker {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #f4b490;
}
.n404 h1 {
  margin: 14px 0 0;
  font-size: clamp(56px, 10vw, 120px);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.02em;
}
.n404-sous {
  margin: 18px 0 0;
  max-width: 36ch;
  font-size: clamp(17px, 2vw, 20px);
  color: rgb(244 241 236 / 0.8);
}

.n404-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}
.n404-btn {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid rgb(244 241 236 / 0.26);
  border-radius: 999px;
  background: rgb(244 241 236 / 0.06);
  color: #f4f1ec;
  font: 600 16px/1.2 var(--font-display);
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.2s var(--ease-ressort);
}
.n404-btn:hover {
  border-color: #f38f59;
  transform: translateY(-1px);
}
.n404-btn:focus-visible {
  outline: 2px solid #f4b490;
  outline-offset: 3px;
}
.n404-btn-o {
  border-color: transparent;
  background: #ef622e;
  color: #160904;
}
.n404-btn-o:hover {
  background: #f38f59;
}

/* fausse analyse de la page, comme un ticket posé de travers */
.n404-ticket {
  padding: 18px 20px;
  border: 1px solid rgb(244 241 236 / 0.14);
  border-radius: 22px;
  background: rgb(14 12 10 / 0.72);
  backdrop-filter: blur(10px);
  box-shadow: 0 30px 60px -30px rgb(0 0 0 / 0.9);
  transform: rotate(-2deg) translate3d(calc(var(--mx) * 10px), calc(var(--my) * 6px), 0);
  transition: transform 0.6s var(--ease-doux);
}
.n404-ticket-titre {
  margin: 0 0 8px;
  font: 600 16px/1.3 var(--font-display);
}
.n404-ticket dl {
  margin: 0;
}
.n404-ticket dl div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px dashed rgb(244 241 236 / 0.14);
}
.n404-ticket dt {
  color: rgb(244 241 236 / 0.62);
  font-size: 14px;
}
.n404-ticket dd {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  text-align: right;
}
.n404-verdict {
  margin: 14px 0 0;
  font-size: 14px;
  color: rgb(244 241 236 / 0.8);
}
.n404-verdict span {
  display: inline-block;
  margin-right: 6px;
  padding: 2px 10px;
  border: 1px solid rgb(255 122 122 / 0.45);
  border-radius: 999px;
  background: rgb(255 122 122 / 0.14);
  color: #ff9a9a;
  font-weight: 700;
}

/* scène : panneau, route, voiture */
.n404-scene {
  position: relative;
  align-self: end;
  height: clamp(240px, 34vw, 400px);
  margin-top: 24px;
}
.n404-route {
  position: absolute;
  inset: auto 0 0;
  height: 36%;
  background: linear-gradient(#1b1c21, #0b0b0d 70%);
  box-shadow: 0 -1px 0 rgb(244 241 236 / 0.08);
}
.n404-bande {
  position: absolute;
  top: 74%;
  left: 0;
  right: 0;
  height: 3px;
  background: repeating-linear-gradient(90deg, rgb(255 255 255 / 0.5) 0 64px, transparent 64px 120px);
}

/* panneau devant la voiture, dans le faisceau des phares */
.n404-panneau {
  position: absolute;
  left: 7%;
  bottom: 34%;
  filter: drop-shadow(0 0 18px rgb(255 240 200 / 0.18));
  display: grid;
  justify-items: center;
  gap: 4px;
  transform: translate3d(calc(var(--mx) * -14px), calc(var(--my) * -4px), 0);
  transition: transform 0.6s var(--ease-doux);
}
.n404-panneau-plaque {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  min-width: 200px;
  padding: 7px 26px 7px 12px;
  background: #0d6b45;
  box-shadow: inset 0 0 0 2px #fff;
  color: #fff;
  font: 600 15px/1.2 var(--font-display);
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%);
}
.n404-panneau-bas {
  padding: 7px 12px 7px 26px;
  clip-path: polygon(16px 0, 100% 0, 100% 100%, 16px 100%, 0 50%);
}
.n404-panneau-pied {
  width: 6px;
  height: clamp(50px, 8vw, 96px);
  background: linear-gradient(90deg, #5a5f68, #2a2d33);
}

.n404-voiture {
  position: absolute;
  left: 50%;
  bottom: 13%;
  width: min(80vw, 640px);
  transform: translate3d(calc(-42% + var(--mx) * 22px), calc(var(--my) * 4px), 0);
  transition: transform 0.6s var(--ease-doux);
}
.n404-polo {
  display: block;
  width: 100%;
  height: auto;
  animation: n404-arrive 1.8s var(--ease-doux) both;
}
.p404-roue {
  transform-box: fill-box;
  transform-origin: center;
  animation: n404-roule 1.8s var(--ease-doux) both;
}
.p404-warn {
  animation: n404-warn 1.1s steps(1, end) 1.8s infinite both;
}

@keyframes n404-arrive {
  from {
    transform: translateX(95vw);
  }
  to {
    transform: none;
  }
}
@keyframes n404-roule {
  to {
    transform: rotate(-1440deg);
  }
}
/* allumé, éteint, et allumé à la fin (animations réduites : une seule boucle, qui finit allumée) */
@keyframes n404-warn {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.06;
  }
  100% {
    opacity: 1;
  }
}

:root[data-calme] .n404-polo,
:root[data-calme] .p404-roue {
  animation: none;
}

@media (max-width: 720px) {
  .n404-ticket {
    transform: rotate(-1.5deg);
  }
  .n404-scene {
    height: 230px;
  }
  .n404-voiture {
    width: 94vw;
    transform: translateX(-48%);
  }
  .n404-panneau {
    left: 2%;
    bottom: 40%;
    transform: scale(0.72);
    transform-origin: bottom left;
  }
}

/* téléphone : le texte, puis la voiture (visible sans défiler), puis le ticket */
@media (max-width: 899px) {
  .n404 {
    display: flex;
    flex-direction: column;
  }
  .n404-contenu {
    display: contents;
  }
  .n404-texte {
    order: 1;
    padding: 36px 20px 0;
  }
  .n404-scene {
    order: 2;
    align-self: stretch;
    margin-top: 8px;
  }
  .n404-ticket {
    order: 3;
    margin: 8px 20px 36px;
  }
}
`;
