import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FormContact } from "@/components/site/FormContact";
import { GUIDE, OFFRES, prixTxt } from "@/lib/offres";

export const metadata: Metadata = { title: "Informations légales", description: "Mentions légales, confidentialité, conditions d'utilisation et de vente, accessibilité et contact." };

const MAJ = "3 octobre 2026";

function Section({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="scroll-mt-24 border-t border-line py-10">
      <h2 id={`${id}-t`} className="font-display text-2xl font-semibold">
        {titre}
      </h2>
      <div className="mt-4 grid gap-3 text-ink-2 [&_h3]:mt-4 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_a]:text-o2 [&_a]:underline [&_a]:underline-offset-4">{children}</div>
    </section>
  );
}

export default function Legal() {
  return (
    <div className="wrap max-w-3xl py-12">
      <h1 className="h-sec">Informations légales</h1>
      <p className="mt-3 text-ink-3">Dernière mise à jour : {MAJ}</p>
      <nav aria-label="Sommaire" className="mt-6 flex flex-wrap gap-2 text-sm">
        {[
          ["mentions", "Mentions légales"],
          ["confidentialite", "Confidentialité"],
          ["conditions", "Conditions d'utilisation"],
          ["vente", "Conditions de vente"],
          ["accessibilite", "Accessibilité"],
          ["contact", "Contact"],
        ].map(([h, l]) => (
          <a key={h} href={`#${h}`} className="rounded-full border border-line-2 px-3 py-1.5 text-ink-2 hover:text-ink">
            {l}
          </a>
        ))}
      </nav>

      <Section id="mentions" titre="Mentions légales">
        <h3>Éditeur du site</h3>
        <p>Le site utopicar.fr est édité par Yacine Samba, qui en est le directeur de la publication. Numéro SIRET : [à compléter avant l&apos;ouverture des paiements].</p>
        <p>Pour toute demande, utilisez le formulaire de contact en bas de cette page.</p>
        <h3>Hébergement</h3>
        <p>Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).</p>
        <p>Les comptes et les données sont stockés par Supabase, sur des serveurs situés dans l&apos;Union européenne (Francfort, Allemagne).</p>
        <h3>Propriété intellectuelle</h3>
        <p>Les textes, guides, visuels et éléments graphiques du site sont la propriété de l&apos;éditeur. Toute reproduction ou diffusion sans autorisation est interdite. Les marques et modèles de véhicules cités appartiennent à leurs propriétaires et ne sont mentionnés qu&apos;à titre informatif.</p>
      </Section>

      <Section id="confidentialite" titre="Politique de confidentialité">
        <h3>Responsable du traitement</h3>
        <p>Yacine Samba, éditeur du site. Contact : formulaire en bas de cette page.</p>
        <h3>Données collectées</h3>
        <ul>
          <li>Votre compte : email, prénom, ville (facultative), mot de passe chiffré, réponses aux questions d&apos;accueil.</li>
          <li>Vos analyses : le texte des annonces et les photos que vous envoyez, et les rapports produits.</li>
          <li>Pour les formules Pro : les véhicules que vous ajoutez à votre parc.</li>
          <li>Vos paiements : formule, statut de l&apos;abonnement et factures. Vos coordonnées bancaires sont traitées par Stripe et ne sont jamais vues ni conservées par Utopicar.</li>
          <li>Si vous nous écrivez : votre message et votre email de réponse.</li>
        </ul>
        <h3>Pourquoi et sur quelle base</h3>
        <ul>
          <li>Fournir le service (compte, analyses, rapports, parc) : exécution du contrat.</li>
          <li>Facturer les abonnements et les achats : exécution du contrat et obligations comptables.</li>
          <li>Prévenir les abus (limites d&apos;utilisation) : intérêt légitime de l&apos;éditeur.</li>
          <li>Répondre à vos messages : votre demande.</li>
        </ul>
        <p>Vos données ne sont jamais vendues ni louées. Aucun profilage publicitaire n&apos;est réalisé.</p>
        <h3>Qui y a accès</h3>
        <p>Seul l&apos;éditeur y a accès, ainsi que les prestataires techniques strictement nécessaires :</p>
        <ul>
          <li>Supabase : base de données et comptes (Union européenne).</li>
          <li>Anthropic : analyse du texte des annonces et des photos envoyées, pour estimer la cote et rédiger le rapport. Les contenus envoyés ne servent pas à entraîner ses modèles.</li>
          <li>Stripe : paiements et factures.</li>
          <li>Resend : envoi des emails.</li>
          <li>Vercel : hébergement du site.</li>
        </ul>
        <p>Certains de ces prestataires sont établis aux États-Unis. Les transferts hors de l&apos;Union européenne sont encadrés par les garanties prévues par le RGPD (décision d&apos;adéquation ou clauses contractuelles types).</p>
        <h3>Durée de conservation</h3>
        <ul>
          <li>Compte, analyses et parc : tant que le compte existe. Vous pouvez tout supprimer à tout moment depuis « Mon compte ».</li>
          <li>Factures : 10 ans, comme l&apos;exige la loi.</li>
          <li>Messages du formulaire de contact : 1 an.</li>
        </ul>
        <h3>Vos droits</h3>
        <p>Vous pouvez demander l&apos;accès à vos données, leur rectification, leur effacement, la limitation du traitement, vous y opposer ou demander leur portabilité. La suppression du compte se fait directement depuis « Mon compte » ; pour le reste, utilisez le formulaire de contact. Réponse sous un mois. En cas de désaccord, vous pouvez saisir la CNIL (cnil.fr).</p>
        <h3>Cookies et stockage</h3>
        <p>Ce site n&apos;utilise aucun cookie publicitaire ni de mesure d&apos;audience. Il dépose seulement les cookies nécessaires à votre connexion. Vos préférences (réponses aux questions d&apos;accueil, pause des animations, réglages de calcul) restent dans votre navigateur. Les polices d&apos;écriture sont chargées depuis Fontshare, qui reçoit à cette occasion votre adresse IP.</p>
      </Section>

      <Section id="conditions" titre="Conditions d'utilisation">
        <h3>Objet</h3>
        <p>Ces conditions encadrent l&apos;utilisation du site, des comptes, de l&apos;outil d&apos;analyse et des guides. En créant un compte, vous les acceptez.</p>
        <h3>Ce que fait l&apos;outil</h3>
        <p>Utopicar est une aide à la décision. Ses cotes, verdicts, coûts et conseils sont des estimations calculées à partir du texte et des photos de l&apos;annonce. Ils ne remplacent ni une inspection du véhicule, ni l&apos;essai, ni l&apos;avis d&apos;un professionnel. Avant d&apos;acheter, faites examiner la voiture et vérifiez vous-même les documents.</p>
        <h3>Contenu informatif</h3>
        <p>Les guides et contenus sont fournis à titre informatif et pédagogique. Ils ne constituent ni un conseil juridique, fiscal, comptable ou financier, ni une expertise mécanique d&apos;un véhicule précis. Aucun résultat financier n&apos;est garanti.</p>
        <h3>Votre compte</h3>
        <p>Votre compte est personnel. Gardez votre mot de passe confidentiel. Un usage automatisé ou abusif (revente des analyses, extraction massive) peut entraîner la suspension du compte.</p>
        <h3>Responsabilité</h3>
        <p>L&apos;éditeur s&apos;efforce de fournir des informations exactes mais ne peut garantir l&apos;absence d&apos;erreur. Il ne saurait être tenu responsable des décisions d&apos;achat ou de vente prises sur la base de ces contenus.</p>
        <h3>Droit applicable</h3>
        <p>Ces conditions sont soumises au droit français. En cas de litige, une solution amiable est recherchée avant toute action.</p>
      </Section>

      <Section id="vente" titre="Conditions générales de vente">
        <h3>Offres et prix</h3>
        <p>Les prix sont indiqués en euros, toutes taxes comprises :</p>
        <ul>
          {Object.values(OFFRES)
            .filter((o) => o.prix > 0)
            .map((o) => (
              <li key={o.id}>
                {o.famille === "benef" ? `Benef ${o.nom}` : o.nom} : {prixTxt(o.prix)} par mois, {o.analyses} analyses par mois.
              </li>
            ))}
          <li>
            {GUIDE.nom} : {GUIDE.prix} €, paiement unique, accès sans limite de durée.
          </li>
        </ul>
        <h3>Abonnement</h3>
        <p>Les abonnements sont mensuels, sans engagement, et se renouvellent automatiquement chaque mois. Vous pouvez résilier à tout moment depuis « Mon compte » : l&apos;accès reste ouvert jusqu&apos;à la fin du mois payé, puis plus rien n&apos;est prélevé. Un changement de formule est appliqué immédiatement, avec un ajustement au prorata.</p>
        <h3>Paiement</h3>
        <p>Le paiement se fait par carte bancaire via Stripe. Une facture est disponible dans votre espace de gestion d&apos;abonnement.</p>
        <h3>Droit de rétractation</h3>
        <p>Vous disposez de 14 jours pour vous rétracter après la souscription. Toutefois, en demandant l&apos;accès immédiat au service ou au guide lors du paiement, vous acceptez que son exécution commence avant la fin de ce délai et vous renoncez à votre droit de rétractation pour le contenu numérique déjà fourni (articles L221-25 et L221-28 du Code de la consommation). En cas de difficulté, écrivez-nous : nous cherchons toujours une solution.</p>
        <h3>Médiation</h3>
        <p>En cas de litige non résolu avec nous, vous pouvez recourir gratuitement au médiateur de la consommation : [à compléter avant l&apos;ouverture des paiements : nom et site du médiateur]. Vous pouvez aussi utiliser la plateforme européenne de règlement des litiges en ligne.</p>
      </Section>

      <Section id="accessibilite" titre="Accessibilité">
        <p>Le site doit pouvoir être utilisé par tout le monde : au clavier, avec un lecteur d&apos;écran, avec un zoom important, sur téléphone, tablette ou ordinateur, et avec les animations réduites.</p>
        <h3>Ce qui est mis en place</h3>
        <ul>
          <li>Structure de titres et zones de page (en-tête, contenu, pied de page) lisibles par les lecteurs d&apos;écran.</li>
          <li>Lien « Aller au contenu » en début de page, visible dès qu&apos;on navigue au clavier.</li>
          <li>Navigation complète au clavier, avec un contour visible sur l&apos;élément actif ; fenêtres de dialogue qui gardent le focus et se ferment avec Échap.</li>
          <li>Chaque champ de formulaire a une étiquette ; les erreurs sont annoncées.</li>
          <li>Contrastes de texte visés au niveau AA des WCAG 2.2.</li>
          <li>Bouton « Mettre les animations en pause » en bas de chaque page ; si votre appareil demande de réduire les animations, elles sont coupées automatiquement.</li>
          <li>Contenu lisible jusqu&apos;à 320 pixels de large et avec un zoom à 200 %, sans défilement horizontal.</li>
          <li>Rapports et guides imprimables et enregistrables en PDF.</li>
        </ul>
        <h3>État de conformité</h3>
        <p>Le site a été vérifié en interne (tests automatiques et revue manuelle inspirée du RGAA 4.1 et des WCAG 2.2 niveau AA). Il n&apos;a pas encore fait l&apos;objet d&apos;un audit indépendant : il est déclaré partiellement conforme.</p>
        <h3>Signaler un problème</h3>
        <p>Si un contenu ou une fonction vous est inaccessible, écrivez-nous avec le formulaire ci-dessous en décrivant la page et le problème : nous vous proposerons une alternative. Sans réponse satisfaisante, vous pouvez saisir le Défenseur des droits (defenseurdesdroits.fr).</p>
      </Section>

      <Section id="contact" titre="Contact">
        <p>Une question, une demande sur vos données ou votre abonnement ? Écrivez-nous, la réponse arrive par email.</p>
        <FormContact />
      </Section>
    </div>
  );
}
