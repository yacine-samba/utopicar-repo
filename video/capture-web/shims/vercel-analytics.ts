/* Remplace @vercel/analytics : aucune mesure d'audience pendant la capture. */
export const track = () => {};
export const Analytics = () => null;
