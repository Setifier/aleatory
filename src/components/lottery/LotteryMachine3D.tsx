import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Sphere, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

interface LotteryBall {
  id: string;
  name: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
}

interface LotteryMachine3DProps {
  items: Array<{ id: string; name: string }>;
  isDrawing: boolean;
  winner: string | null;
  onComplete?: () => void;
}

// Composant d'une boule individuelle
function Ball({
  position,
  name,
  color,
  isWinner,
  isDrawing,
}: {
  position: THREE.Vector3;
  name: string;
  color: string;
  isWinner: boolean;
  isDrawing: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current || isWinner) return;

    // Animation de rotation et flottement quand tirage
    if (isDrawing) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.03;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
    }
  });

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.5, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <meshStandardMaterial
          color={isWinner ? "#ffd700" : color}
          emissive={isWinner ? "#ff6600" : hovered ? color : "#000000"}
          emissiveIntensity={isWinner ? 0.8 : hovered ? 0.3 : 0}
          metalness={0.7}
          roughness={0.2}
        />
      </Sphere>

      {/* Texte sur la boule */}
      <Html
        position={[0, 0, 0]}
        center
        distanceFactor={6}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            color: isWinner ? "#000" : "#fff",
            fontSize: "10px",
            fontWeight: "bold",
            textAlign: "center",
            whiteSpace: "nowrap",
            textShadow: isWinner ? "none" : "0 0 4px rgba(0,0,0,0.8)",
            maxWidth: "80px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name.substring(0, 12)}
        </div>
      </Html>
    </group>
  );
}

// Scène 3D principale
function LotteryScene({
  balls,
  isDrawing,
  winner,
}: {
  balls: LotteryBall[];
  isDrawing: boolean;
  winner: string | null;
}) {
  const drumRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!drumRef.current) return;

    // Rotation du tambour pendant le tirage
    if (isDrawing) {
      drumRef.current.rotation.y += 0.01;
      drumRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <>
      {/* Lumières simplifiées */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />

      {/* Tambour transparent */}
      <group ref={drumRef}>
        {/* Cylindre principal */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[3, 3, 6, 32]} />
          <meshPhysicalMaterial
            color="#6161d8"
            transparent
            opacity={0.15}
            metalness={0.9}
            roughness={0.1}
            transmission={0.9}
            thickness={0.5}
          />
        </mesh>

        {/* Cercles latéraux */}
        <mesh position={[3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[2.8, 3.2, 32]} />
          <meshStandardMaterial color="#bcb88f" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[2.8, 3.2, 32]} />
          <meshStandardMaterial color="#bcb88f" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Boules */}
        {balls.map((ball) => (
          <Ball
            key={ball.id}
            position={ball.position}
            name={ball.name}
            color={ball.color}
            isWinner={winner === ball.name}
            isDrawing={isDrawing}
          />
        ))}
      </group>

      {/* Contrôles de caméra */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  );
}

export default function LotteryMachine3D({
  items,
  isDrawing,
  winner,
  onComplete,
}: LotteryMachine3DProps) {
  const [displayWinner, setDisplayWinner] = useState<string | null>(null);

  // Génération des positions des boules dans le tambour
  const balls = useMemo(() => {
    const colors = [
      "#6161d8",
      "#a195f8",
      "#bcb88f",
      "#e1d5a8",
      "#636397",
      "#7678a8",
    ];

    // Limiter à 20 boules max pour les perfs
    const limitedItems = items.slice(0, 20);

    return limitedItems.map((item, index) => {
      // Disposition aléatoire dans le tambour
      const angle = (index / limitedItems.length) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      const height = (Math.random() - 0.5) * 3;

      return {
        id: item.id,
        name: item.name,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(0, 0, 0),
        color: colors[index % colors.length],
      };
    });
  }, [items]);

  // Gestion du gagnant
  useEffect(() => {
    if (winner && !displayWinner) {
      // Délai pour l'animation
      setTimeout(() => {
        setDisplayWinner(winner);
        onComplete?.();
      }, 3000);
    } else if (!winner && displayWinner) {
      setDisplayWinner(null);
    }
  }, [winner, displayWinner, onComplete]);

  if (items.length === 0) {
    return (
      <div className="w-full h-[400px] sm:h-[500px] flex items-center justify-center glass-strong rounded-2xl border border-white/10">
        <p className="text-white/60 text-lg">
          Ajoutez des éléments pour voir la machine à loterie
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Canvas 3D */}
      <div className="w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden glass-strong border border-white/10 shadow-glow-lg">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 50 }}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
        >
          <LotteryScene balls={balls} isDrawing={isDrawing} winner={winner} />
        </Canvas>
      </div>

      {/* Affichage du gagnant */}
      <AnimatePresence>
        {displayWinner && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-strong border-2 border-secondary-400 rounded-3xl px-8 py-6 shadow-glow-gold"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <div className="text-center space-y-2">
                <motion.div
                  className="text-6xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🎉
                </motion.div>
                <h3 className="text-2xl font-bold gradient-text-gold">
                  GAGNANT !
                </h3>
                <p className="text-3xl font-bold text-white">{displayWinner}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indication de tirage */}
      {isDrawing && !displayWinner && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 glass-strong px-6 py-3 rounded-full border border-primary-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-3 h-3 bg-primary-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-white font-bold">Tirage en cours...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
