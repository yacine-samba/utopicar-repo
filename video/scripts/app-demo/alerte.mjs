// Mes recherches : la recherche Clio 4 diesel, puis l'interrupteur « Alerte e-mail » allumé. Captures avant / après.
import { ouvrir, chercherClio } from './session.mjs';
const S = process.argv[2];
const { b, p } = await ouvrir();
await chercherClio(p);
await p.getByRole('button', { name: 'Mes recherches' }).first().click().catch(() => p.getByText('Mes recherches').first().click());
await p.waitForTimeout(1500); await p.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
await p.screenshot({ path: `${S}/alerte-avant.png`, clip: { x: 0, y: 0, width: 390, height: 1100 } });
const sw = p.getByRole('switch').first(); console.log('interrupteurs', await p.getByRole('switch').count(), await sw.boundingBox());
await sw.click(); await p.waitForTimeout(2500); await p.evaluate(() => document.activeElement?.blur());
await p.screenshot({ path: `${S}/alerte-apres.png`, clip: { x: 0, y: 0, width: 390, height: 1100 } });
await b.close();
