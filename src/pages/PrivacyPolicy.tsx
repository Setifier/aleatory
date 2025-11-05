import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="bg-secondary-50 min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-gray-700">
              Accueil
            </Link>
            <span>→</span>
            <span>Politique de confidentialité</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Politique de confidentialité
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <div className="prose prose-sm sm:prose max-w-none">
            <p className="text-gray-700 mb-6">
              La protection de vos données personnelles est une priorité pour
              Setifier D & D. Cette politique de confidentialité vous informe sur
              la manière dont nous collectons, utilisons et protégeons vos données
              personnelles lors de l'utilisation du site Aleatory (aleatory.fr).
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              1. Responsable du traitement des données
            </h2>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="font-semibold text-gray-900 mb-2">Setifier D & D</p>
              <p className="text-gray-700">Représentée par Arnaud VILLAUME</p>
              <p className="text-gray-700">Email : contact@aleatory.fr</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              2. Données personnelles collectées
            </h2>
            <p className="text-gray-700 mb-4">
              Dans le cadre de l'utilisation d'Aleatory, nous collectons les
              données suivantes :
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2.1 Données d'identification et d'authentification
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Adresse email</li>
              <li>Mot de passe (chiffré et sécurisé)</li>
              <li>Pseudo (optionnel)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2.2 Données d'utilisation
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Historique des tirages au sort effectués</li>
              <li>Items sauvegardés et leurs paramètres</li>
              <li>Organisation des items en dossiers</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2.3 Données de sécurité
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Tokens d'authentification (sessions)</li>
              <li>
                Facteurs d'authentification à deux facteurs (2FA/MFA) si activés
              </li>
              <li>Logs de connexion (date, heure)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2.4 Données techniques
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Cookies de session (nécessaires au fonctionnement)</li>
              <li>Adresse IP (pour la sécurité et la prévention des abus)</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              3. Finalité du traitement des données
            </h2>
            <p className="text-gray-700 mb-4">
              Vos données personnelles sont collectées et traitées pour les
              finalités suivantes :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Création et gestion de votre compte utilisateur</li>
              <li>Authentification et sécurisation de l'accès à votre compte</li>
              <li>
                Fonctionnement des services (tirages, sauvegarde, organisation)
              </li>
              <li>Amélioration de l'expérience utilisateur</li>
              <li>Détection et prévention des fraudes</li>
              <li>Respect de nos obligations légales</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              4. Base légale du traitement
            </h2>
            <p className="text-gray-700 mb-4">
              Le traitement de vos données repose sur :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Votre consentement lors de la création de votre compte</li>
              <li>L'exécution du contrat d'utilisation du service</li>
              <li>
                Nos intérêts légitimes (sécurité, amélioration du service)
              </li>
              <li>Le respect de nos obligations légales</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              5. Destinataires des données
            </h2>
            <p className="text-gray-700 mb-4">
              Vos données personnelles sont traitées par :
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              5.1 Services internes
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4">
              <li>Setifier D & D (éditeur et responsable du site)</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              5.2 Prestataires techniques
            </h3>
            <div className="space-y-3 mb-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium text-gray-900">Supabase</p>
                <p className="text-sm text-gray-700">
                  Hébergement de la base de données, authentification
                </p>
                <p className="text-sm text-gray-700">
                  Localisation : États-Unis (certification Privacy Shield)
                </p>
                <p className="text-sm text-gray-700">
                  Politique :{" "}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    https://supabase.com/privacy
                  </a>
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium text-gray-900">Vercel</p>
                <p className="text-sm text-gray-700">Hébergement du site web</p>
                <p className="text-sm text-gray-700">
                  Localisation : États-Unis
                </p>
                <p className="text-sm text-gray-700">
                  Politique :{" "}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    https://vercel.com/legal/privacy-policy
                  </a>
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium text-gray-900">Sentry</p>
                <p className="text-sm text-gray-700">Monitoring des erreurs</p>
                <p className="text-sm text-gray-700">
                  Localisation : États-Unis
                </p>
                <p className="text-sm text-gray-700">
                  Politique :{" "}
                  <a
                    href="https://sentry.io/privacy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    https://sentry.io/privacy/
                  </a>
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Vos données ne sont jamais vendues, louées ou échangées à des tiers
              à des fins commerciales.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              6. Durée de conservation des données
            </h2>
            <p className="text-gray-700 mb-4">
              Vos données personnelles sont conservées pendant toute la durée
              d'utilisation de votre compte et :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>
                <strong>Données de compte</strong> : jusqu'à la suppression de
                votre compte
              </li>
              <li>
                <strong>Historique et items sauvegardés</strong> : supprimés
                immédiatement lors de la suppression du compte
              </li>
              <li>
                <strong>Logs de sécurité</strong> : conservés 12 mois maximum
              </li>
            </ul>
            <p className="text-gray-700 mb-6">
              En cas d'inactivité prolongée (plus de 3 ans sans connexion), nous
              nous réservons le droit de supprimer votre compte après vous en
              avoir informé par email.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              7. Sécurité des données
            </h2>
            <p className="text-gray-700 mb-4">
              Nous mettons en œuvre toutes les mesures techniques et
              organisationnelles appropriées pour protéger vos données
              personnelles contre la destruction, la perte, l'altération, la
              divulgation non autorisée ou l'accès non autorisé :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Chiffrement des mots de passe (algorithme bcrypt)</li>
              <li>Connexions sécurisées (HTTPS/SSL)</li>
              <li>Authentification à deux facteurs disponible (2FA/MFA)</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Surveillance et monitoring des accès</li>
              <li>Sauvegardes régulières</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              8. Vos droits
            </h2>
            <p className="text-gray-700 mb-4">
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), vous disposez des droits suivants :
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              8.1 Droit d'accès
            </h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez demander une copie de toutes les données personnelles
              que nous détenons sur vous.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              8.2 Droit de rectification
            </h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez modifier vos informations personnelles directement
              depuis la page Paramètres de votre compte.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              8.3 Droit à l'effacement
            </h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez supprimer votre compte et toutes vos données à tout
              moment depuis la page Paramètres. La suppression est immédiate et
              définitive.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              8.4 Droit à la portabilité
            </h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez demander à recevoir vos données dans un format structuré
              et couramment utilisé.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              8.5 Droit d'opposition
            </h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez vous opposer au traitement de vos données pour des
              motifs légitimes.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              8.6 Droit de limitation
            </h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez demander la limitation du traitement de vos données dans
              certaines circonstances.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              Comment exercer vos droits ?
            </h3>
            <p className="text-gray-700 mb-4">
              Pour exercer vos droits, contactez-nous à :{" "}
              <a
                href="mailto:contact@aleatory.fr"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                contact@aleatory.fr
              </a>
            </p>
            <p className="text-gray-700 mb-6">
              Nous nous engageons à répondre à votre demande dans un délai maximum
              d'un mois.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              9. Cookies
            </h2>
            <p className="text-gray-700 mb-4">
              Aleatory utilise uniquement des cookies strictement nécessaires au
              fonctionnement du site :
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              9.1 Cookies de session
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>
                <strong>Finalité</strong> : Maintenir votre connexion active
              </li>
              <li>
                <strong>Durée</strong> : Jusqu'à déconnexion ou fermeture du
                navigateur
              </li>
              <li>
                <strong>Type</strong> : Cookie technique essentiel
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              9.2 Cookies d'authentification
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>
                <strong>Finalité</strong> : Sécuriser votre session et vérifier
                votre identité
              </li>
              <li>
                <strong>Durée</strong> : Variable selon vos paramètres de
                connexion
              </li>
              <li>
                <strong>Type</strong> : Cookie de sécurité
              </li>
            </ul>

            <p className="text-gray-700 mb-4">
              Aucun cookie de tracking, analytique ou publicitaire n'est utilisé
              sur Aleatory.
            </p>
            <p className="text-gray-700 mb-6">
              Vous pouvez configurer votre navigateur pour refuser les cookies,
              mais cela empêchera le fonctionnement du site.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              10. Transferts internationaux de données
            </h2>
            <p className="text-gray-700 mb-4">
              Certaines de nos données sont hébergées aux États-Unis via nos
              prestataires techniques (Supabase, Vercel, Sentry). Ces transferts
              sont encadrés par :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Les clauses contractuelles types de l'Union européenne</li>
              <li>
                Les certifications et garanties de sécurité de nos prestataires
              </li>
              <li>Le respect des principes du RGPD</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              11. Modifications de la politique de confidentialité
            </h2>
            <p className="text-gray-700 mb-4">
              Nous nous réservons le droit de modifier cette politique de
              confidentialité à tout moment. Toute modification sera publiée sur
              cette page avec une nouvelle date de mise à jour.
            </p>
            <p className="text-gray-700 mb-6">
              En cas de modification substantielle, nous vous en informerons par
              email ou via une notification sur le site.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              12. Réclamation
            </h2>
            <p className="text-gray-700 mb-4">
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez
              introduire une réclamation auprès de la Commission Nationale de
              l'Informatique et des Libertés (CNIL) :
            </p>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="font-semibold text-gray-900 mb-2">CNIL</p>
              <p className="text-gray-700">3 Place de Fontenoy</p>
              <p className="text-gray-700">TSA 80715</p>
              <p className="text-gray-700">75334 PARIS CEDEX 07</p>
              <p className="text-gray-700">Téléphone : 01 53 73 22 22</p>
              <p className="text-gray-700">
                Site web :{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  https://www.cnil.fr
                </a>
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              13. Contact
            </h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant cette politique de confidentialité ou
              le traitement de vos données personnelles, vous pouvez nous
              contacter :
            </p>
            <p className="text-gray-700 mb-6">
              <strong>Email</strong> :{" "}
              <a
                href="mailto:contact@aleatory.fr"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                contact@aleatory.fr
              </a>
            </p>
            <p className="text-gray-700 mb-6">
              Nous nous engageons à répondre à vos questions dans les meilleurs
              délais.
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 italic">
                Dernière mise à jour : Novembre 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
