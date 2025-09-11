import { useState } from "react";
import Button from "../ui/Button";
import { cancelAccountDeletion } from "../../lib/accountService";

interface CancelDeletionBannerProps {
  scheduledDate: Date;
  daysRemaining: number;
  onCancelled: () => void;
}

const CancelDeletionBanner = ({ 
  scheduledDate, 
  daysRemaining, 
  onCancelled 
}: CancelDeletionBannerProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleCancelDeletion = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await cancelAccountDeletion();
      
      if (result.success) {
        onCancelled();
      } else {
        setError(result.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      setError("Erreur inattendue lors de l'annulation");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyColor = () => {
    if (daysRemaining <= 1) return "bg-red-50 border-red-200";
    if (daysRemaining <= 3) return "bg-orange-50 border-orange-200";
    return "bg-yellow-50 border-yellow-200";
  };

  const getTextColor = () => {
    if (daysRemaining <= 1) return "text-red-800";
    if (daysRemaining <= 3) return "text-orange-800";
    return "text-yellow-800";
  };

  const getIconColor = () => {
    if (daysRemaining <= 1) return "text-red-600";
    if (daysRemaining <= 3) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <div className={`${getUrgencyColor()} border rounded-lg p-4 mb-6`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className={`w-6 h-6 ${getIconColor()}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className={`font-semibold ${getTextColor()}`}>
                ⚠️ Suppression de compte programmée
              </h3>
              <div className={`mt-1 text-sm ${getTextColor()}`}>
                <p>
                  Votre compte sera définitivement supprimé le{' '}
                  <strong>{formatDate(scheduledDate)}</strong>
                </p>
                <p className="mt-1">
                  {daysRemaining > 0 ? (
                    <>
                      Il vous reste <strong>{daysRemaining} jour{daysRemaining > 1 ? 's' : ''}</strong> pour changer d'avis.
                    </>
                  ) : (
                    <span className="font-semibold">
                      ⏰ Suppression prévue aujourd'hui !
                    </span>
                  )}
                </p>
                {error && (
                  <p className="mt-2 text-red-600 text-sm">
                    {error}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
              <Button
                onClick={handleCancelDeletion}
                label={loading ? "Annulation..." : "Annuler la suppression"}
                className="bg-white border-2 border-current text-current hover:bg-gray-50 font-semibold"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelDeletionBanner;