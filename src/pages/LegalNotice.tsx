import { Link } from "react-router-dom";

const LegalNotice = () => {
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
            <span>Mentions légales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Mentions légales
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-6">
          <div className="prose prose-sm sm:prose max-w-none">
            <p className="text-gray-700 mb-6">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004
              pour la confiance en l'économie numérique, il est précisé aux
              utilisateurs du site Aleatory l'identité des différents intervenants
              dans le cadre de sa réalisation et de son suivi.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Éditeur du site
            </h2>
            <p className="text-gray-700 mb-4">Le site Aleatory est édité par :</p>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="font-semibold text-gray-900 mb-2">Setifier D & D</p>
              <p className="text-gray-700">
                Représentée par Arnaud VILLAUME (Slim ETIFIER)
              </p>
              <p className="text-gray-700">Auto-entrepreneur</p>
              <p className="text-gray-700">Adresse : Metz, Moselle, France</p>
              <p className="text-gray-700">Email : contact@aleatory.fr</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Responsable de publication
            </h2>
            <p className="text-gray-700 mb-6">
              Le responsable de publication du site est Arnaud VILLAUME.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Hébergement du site
            </h2>
            <p className="text-gray-700 mb-4">Le site Aleatory est hébergé par :</p>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="font-semibold text-gray-900 mb-2">Vercel Inc.</p>
              <p className="text-gray-700">340 S Lemon Ave #4133</p>
              <p className="text-gray-700">Walnut, CA 91789</p>
              <p className="text-gray-700">États-Unis</p>
              <p className="text-gray-700">
                Site web :{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  https://vercel.com
                </a>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="font-semibold text-gray-900 mb-2">
                Gestion DNS et domaine :
              </p>
              <p className="font-medium text-gray-800">Infomaniak SA</p>
              <p className="text-gray-700">Rue Eugène-Marziano 25</p>
              <p className="text-gray-700">1227 Genève</p>
              <p className="text-gray-700">Suisse</p>
              <p className="text-gray-700">
                Site web :{" "}
                <a
                  href="https://www.infomaniak.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  https://www.infomaniak.com
                </a>
              </p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Propriété intellectuelle
            </h2>
            <p className="text-gray-700 mb-6">
              L'ensemble du contenu du site Aleatory (structure, textes, logos,
              images, éléments graphiques, etc.) est la propriété exclusive de
              Setifier D & D, sauf mention contraire.
            </p>
            <p className="text-gray-700 mb-6">
              Toute reproduction, distribution, modification, adaptation,
              retransmission ou publication de ces différents éléments est
              strictement interdite sans l'accord exprès par écrit de Setifier D
              & D.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">
              Limitation de responsabilité
            </h2>
            <p className="text-gray-700 mb-4">
              Setifier D & D ne pourra être tenu responsable des dommages directs
              et indirects causés au matériel de l'utilisateur lors de l'accès au
              site Aleatory, et résultant soit de l'utilisation d'un matériel ne
              répondant pas aux spécifications indiquées, soit de l'apparition
              d'un bug ou d'une incompatibilité.
            </p>
            <p className="text-gray-700 mb-6">
              Setifier D & D ne pourra également être tenu responsable des
              dommages indirects consécutifs à l'utilisation du site Aleatory.
            </p>

            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Contact</h2>
            <p className="text-gray-700 mb-6">
              Pour toute question ou demande d'information concernant le site,
              vous pouvez nous contacter par email à l'adresse :{" "}
              <a
                href="mailto:contact@aleatory.fr"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                contact@aleatory.fr
              </a>
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

export default LegalNotice;
