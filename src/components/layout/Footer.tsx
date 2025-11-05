const Footer = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";

  return (
    <footer className="bg-gradient-to-br from-accent-900 via-accent-800 to-accent-900 text-white border-t-2 border-accent-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Logo and description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/aleatory_logo_typo_s.webp"
                alt="Aleatory"
                className="h-10 sm:h-12"
              />
            </div>
            <p className="text-accent-200 text-sm text-center md:text-left max-w-xs">
              Tirage au sort et tournois simplifiés pour tous vos besoins
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold text-base sm:text-lg mb-3 text-accent-100">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-center md:text-left">
              <a
                href="/"
                className="text-accent-300 hover:text-primary-400 transition-colors"
              >
                Accueil
              </a>
              <a
                href="/lottery"
                className="text-accent-300 hover:text-primary-400 transition-colors"
              >
                Lottery Machine
              </a>
              <a
                href="/tournament"
                className="text-accent-300 hover:text-primary-400 transition-colors"
              >
                Tournament Mode
              </a>
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-semibold text-base sm:text-lg mb-3 text-accent-100">
              Légal
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-center md:text-left">
              <a
                href="/legal-notice"
                className="text-accent-300 hover:text-primary-400 transition-colors"
              >
                Mentions légales
              </a>
              <a
                href="/privacy-policy"
                className="text-accent-300 hover:text-primary-400 transition-colors"
              >
                Politique de confidentialité
              </a>
              <a
                href="/terms-of-service"
                className="text-accent-300 hover:text-primary-400 transition-colors"
              >
                CGU
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-accent-700 my-6"></div>

        {/* Copyright */}
        <div className="text-center text-sm text-accent-300">
          <p className="mb-2">
            © {currentYear} <span className="font-semibold">Aleatory</span>.
            Tous droits réservés.
          </p>
          <p className="text-xs text-accent-400">Version {appVersion}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
