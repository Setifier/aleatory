import { Link } from "react-router-dom";

const TermsOfService = () => {
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
            <span>Conditions Générales d'Utilisation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Conditions Générales d'Utilisation
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <div className="prose prose-sm sm:prose max-w-none">
            <p className="text-gray-700 mb-6">
              Les présentes Conditions Générales d'Utilisation (CGU) définissent
              les règles d'accès et d'utilisation du site Aleatory (aleatory.fr).
              En accédant et en utilisant le site, vous acceptez sans réserve les
              présentes CGU.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Objet</h2>
            <p className="text-gray-700 mb-6">
              Les présentes CGU ont pour objet de définir les conditions dans
              lesquelles Setifier D & D met à disposition des utilisateurs le
              service Aleatory, ainsi que les droits et obligations des parties
              dans ce cadre.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              2. Mentions légales
            </h2>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="text-gray-700">
                <strong>Éditeur :</strong> Setifier D & D
              </p>
              <p className="text-gray-700">
                <strong>Responsable :</strong> Arnaud VILLAUME (Slim ETIFIER)
              </p>
              <p className="text-gray-700">
                <strong>Siège social :</strong> Metz, France
              </p>
              <p className="text-gray-700">
                <strong>Email :</strong>{" "}
                <a
                  href="mailto:contact@aleatory.fr"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  contact@aleatory.fr
                </a>
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              3. Accès au service
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              3.1 Accès général
            </h3>
            <p className="text-gray-700 mb-4">
              L'accès au site Aleatory est gratuit. Certaines fonctionnalités
              nécessitent la création d'un compte utilisateur.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              3.2 Conditions d'accès
            </h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Vous devez avoir au moins 13 ans pour créer un compte</li>
              <li>
                Vous devez fournir des informations exactes lors de l'inscription
              </li>
              <li>
                Vous êtes responsable de la confidentialité de votre mot de passe
              </li>
              <li>
                Vous ne devez pas créer de compte au nom d'une autre personne
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              3.3 Disponibilité
            </h3>
            <p className="text-gray-700 mb-6">
              Nous nous efforçons d'assurer une disponibilité du service 24h/24 et
              7j/7. Cependant, nous ne garantissons pas l'absence d'interruptions
              pour maintenance, mises à jour ou causes indépendantes de notre
              volonté.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              4. Création et gestion du compte
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              4.1 Inscription
            </h3>
            <p className="text-gray-700 mb-4">
              Pour accéder aux fonctionnalités complètes d'Aleatory, vous devez
              créer un compte en fournissant :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Une adresse email valide</li>
              <li>Un mot de passe sécurisé</li>
              <li>Optionnellement, un pseudo</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              4.2 Exactitude des informations
            </h3>
            <p className="text-gray-700 mb-4">
              Vous vous engagez à fournir des informations exactes et à les
              maintenir à jour. Toute fausse information peut entraîner la
              suspension ou la suppression de votre compte.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              4.3 Sécurité du compte
            </h3>
            <p className="text-gray-700 mb-4">Vous êtes responsable de :</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>La confidentialité de vos identifiants de connexion</li>
              <li>Toutes les activités effectuées depuis votre compte</li>
              <li>La notification immédiate de toute utilisation non autorisée</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Nous vous recommandons fortement d'activer l'authentification à deux
              facteurs (2FA) disponible dans les paramètres de votre compte.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              4.4 Suppression du compte
            </h3>
            <p className="text-gray-700 mb-6">
              Vous pouvez supprimer votre compte à tout moment depuis la page
              Paramètres. La suppression est immédiate et définitive. Toutes vos
              données (historique, items sauvegardés, dossiers) seront
              définitivement supprimées.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              5. Utilisation du service
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              5.1 Usage autorisé
            </h3>
            <p className="text-gray-700 mb-4">
              Aleatory est un service de génération de tirages au sort permettant
              de :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Créer des tirages personnalisés</li>
              <li>Sauvegarder des items et les organiser en dossiers</li>
              <li>Consulter l'historique de vos tirages</li>
              <li>Gérer votre compte et vos préférences</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              5.2 Usages interdits
            </h3>
            <p className="text-gray-700 mb-4">Vous vous engagez à ne pas :</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Utiliser le service à des fins illégales ou frauduleuses</li>
              <li>Tenter d'accéder aux comptes d'autres utilisateurs</li>
              <li>
                Perturber le fonctionnement du service (attaques, spam, etc.)
              </li>
              <li>Extraire ou copier automatiquement le contenu du site</li>
              <li>
                Utiliser le service pour harceler, menacer ou nuire à autrui
              </li>
              <li>Tenter de contourner les mesures de sécurité</li>
              <li>Créer plusieurs comptes dans un but frauduleux</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              5.3 Sanctions
            </h3>
            <p className="text-gray-700 mb-4">
              En cas de non-respect des présentes CGU, nous nous réservons le
              droit de :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Suspendre temporairement votre accès</li>
              <li>Supprimer définitivement votre compte</li>
              <li>Prendre toute mesure légale appropriée</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              6. Propriété intellectuelle
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              6.1 Propriété du site
            </h3>
            <p className="text-gray-700 mb-4">
              L'ensemble des éléments du site Aleatory (design, code source,
              logos, textes, images, structure) est la propriété exclusive de
              Setifier D & D et est protégé par les lois relatives à la propriété
              intellectuelle.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              6.2 Licence d'utilisation
            </h3>
            <p className="text-gray-700 mb-4">
              Nous vous accordons une licence personnelle, non exclusive, non
              transférable et révocable d'utilisation du service dans le cadre de
              son usage normal.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              6.3 Contenu utilisateur
            </h3>
            <p className="text-gray-700 mb-6">
              Vous conservez tous les droits sur les contenus que vous créez
              (items, tirages). En utilisant Aleatory, vous nous accordez une
              licence limitée pour stocker et afficher ces contenus dans le cadre
              du fonctionnement du service.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              7. Responsabilité
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              7.1 Limitation de responsabilité
            </h3>
            <p className="text-gray-700 mb-4">
              Setifier D & D ne saurait être tenu responsable :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>
                Des dommages directs ou indirects résultant de l'utilisation ou
                de l'impossibilité d'utiliser le service
              </li>
              <li>De la perte de données</li>
              <li>Des interruptions de service</li>
              <li>Des erreurs ou bugs dans le logiciel</li>
              <li>De l'utilisation que vous faites des résultats des tirages</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              7.2 Usage des tirages
            </h3>
            <p className="text-gray-700 mb-4">
              Les tirages générés par Aleatory sont purement aléatoires et à usage
              récréatif ou organisationnel. Setifier D & D ne saurait être tenu
              responsable des conséquences de décisions prises sur la base de ces
              tirages.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              7.3 Contenu des utilisateurs
            </h3>
            <p className="text-gray-700 mb-6">
              Vous êtes seul responsable du contenu que vous créez et partagez via
              Aleatory. Nous ne sommes pas responsables des items que vous créez
              ou de l'usage que vous en faites.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              8. Protection des données personnelles
            </h2>
            <p className="text-gray-700 mb-4">
              La collecte et le traitement de vos données personnelles sont régis
              par notre Politique de Confidentialité, accessible à l'adresse :{" "}
              <Link
                to="/privacy-policy"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                aleatory.fr/privacy-policy
              </Link>
            </p>
            <p className="text-gray-700 mb-6">
              Nous nous engageons à protéger vos données conformément au Règlement
              Général sur la Protection des Données (RGPD).
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              9. Modifications du service
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              9.1 Évolutions
            </h3>
            <p className="text-gray-700 mb-4">
              Nous nous réservons le droit de :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Modifier, ajouter ou supprimer des fonctionnalités</li>
              <li>Faire évoluer l'interface du site</li>
              <li>Mettre à jour les technologies utilisées</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              9.2 Notification
            </h3>
            <p className="text-gray-700 mb-6">
              Les modifications importantes vous seront notifiées par email ou via
              le site.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              10. Modifications des CGU
            </h2>
            <p className="text-gray-700 mb-4">
              Nous nous réservons le droit de modifier les présentes CGU à tout
              moment. Les modifications entrent en vigueur dès leur publication sur
              le site.
            </p>
            <p className="text-gray-700 mb-6">
              En cas de modification substantielle, nous vous en informerons par
              email ou via une notification sur le site. Votre utilisation continue
              du service après notification vaut acceptation des nouvelles CGU.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              11. Résiliation
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              11.1 Par l'utilisateur
            </h3>
            <p className="text-gray-700 mb-4">
              Vous pouvez cesser d'utiliser le service et supprimer votre compte à
              tout moment.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              11.2 Par Setifier D & D
            </h3>
            <p className="text-gray-700 mb-4">
              Nous nous réservons le droit de suspendre ou de supprimer votre
              compte en cas de :
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse ou abusive du service</li>
              <li>Inactivité prolongée (plus de 3 ans)</li>
              <li>Obligation légale</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              12. Droit applicable et juridiction
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              12.1 Droit applicable
            </h3>
            <p className="text-gray-700 mb-4">
              Les présentes CGU sont régies par le droit français.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              12.2 Règlement des litiges
            </h3>
            <p className="text-gray-700 mb-4">
              En cas de litige, nous vous invitons à nous contacter en priorité à
              l'adresse{" "}
              <a
                href="mailto:contact@aleatory.fr"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                contact@aleatory.fr
              </a>{" "}
              pour rechercher une solution amiable.
            </p>
            <p className="text-gray-700 mb-4">
              À défaut d'accord amiable, tout litige relatif à l'interprétation ou
              à l'exécution des présentes CGU relève de la compétence exclusive
              des tribunaux français.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              12.3 Médiation
            </h3>
            <p className="text-gray-700 mb-6">
              Conformément à l'article L. 612-1 du Code de la consommation, vous
              pouvez recourir gratuitement à un service de médiation de la
              consommation en cas de litige.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              13. Dispositions diverses
            </h2>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              13.1 Intégralité
            </h3>
            <p className="text-gray-700 mb-4">
              Les présentes CGU constituent l'intégralité de l'accord entre vous et
              Setifier D & D concernant l'utilisation d'Aleatory.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              13.2 Nullité partielle
            </h3>
            <p className="text-gray-700 mb-4">
              Si une clause des présentes CGU est déclarée nulle ou inapplicable,
              les autres clauses restent en vigueur.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              13.3 Renonciation
            </h3>
            <p className="text-gray-700 mb-6">
              Le fait pour Setifier D & D de ne pas se prévaloir d'une disposition
              des présentes CGU ne constitue pas une renonciation à s'en prévaloir
              ultérieurement.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              14. Contact
            </h2>
            <p className="text-gray-700 mb-4">
              Pour toute question concernant les présentes Conditions Générales
              d'Utilisation, vous pouvez nous contacter :
            </p>
            <p className="text-gray-700 mb-6">
              <strong>Email :</strong>{" "}
              <a
                href="mailto:contact@aleatory.fr"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                contact@aleatory.fr
              </a>
            </p>
            <p className="text-gray-700 mb-6">
              Nous nous engageons à répondre dans les meilleurs délais.
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

export default TermsOfService;
