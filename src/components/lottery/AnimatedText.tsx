import React from "react";

interface AnimatedTextProps {
  onAnimationComplete: () => void; // Fonction à appeler lorsque l'animation est terminée
}

const AnimatedText = ({ onAnimationComplete }: AnimatedTextProps) => {
  const handleAnimationEnd = () => {
    onAnimationComplete(); // Appelle la fonction de fin lorsque l'animation CSS se termine
  };

  // Fallback au cas où onAnimationEnd ne se déclenche pas
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2400); // Durée de l'animation CSS (2.4s)

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-text-appear"
      onAnimationEnd={handleAnimationEnd}
    >
      <h1
        className="text-primary-500 text-9xl font-bold"
        style={{ textShadow: "2px 2px 0px #000000" }}
      >
        C'est parti !
      </h1>
    </div>
  );
};

export default AnimatedText;
