import { useState } from "react";
import MfaManager from "../auth/MfaManager";
import ChangePasswordForm from "../auth/ChangePasswordForm";

const SecuritySection = () => {
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Sécurité</h2>

      {/* MFA Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Authentification à deux facteurs (2FA)
        </h3>
        <MfaManager />
      </div>

      {/* Password Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Mot de passe
        </h3>
        {showChangePasswordForm ? (
          <ChangePasswordForm onCancel={() => setShowChangePasswordForm(false)} />
        ) : (
          <button
            onClick={() => setShowChangePasswordForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Changer le mot de passe
          </button>
        )}
      </div>
    </div>
  );
};

export default SecuritySection;