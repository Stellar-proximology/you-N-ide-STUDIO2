import { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  OrbitControls, 
  Stars, 
  Sky, 
  PerspectiveCamera,
  Environment,
  Sphere,
  Box,
  Plane,
  Text
} from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Maximize2, Minimize2, RotateCcw, Info } from "lucide-react";
import { useLocation } from "wouter";
import * as THREE from "three";

interface Universe {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
  layers: SemanticLayer[];
  seed: string;
}

interface SemanticLayer {
  id: number;
  name: string;
  function: string;
  extractedData?: string;
}

interface UniverseViewer3DProps {
  universe: Universe;
  onClose: () => void;
}

function TerrainMesh({ physicalData }: { physicalData?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const complexity = physicalData ? physicalData.split(",").length : 3;
  const size = 20 + complexity * 2;
  
  return (
    <Plane 
      ref={meshRef}
      args={[size, size, 32, 32]} 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -2, 0]}
    >
      <meshStandardMaterial 
        color="#4a5568" 
        wireframe={false}
        roughness={0.8}
        metalness={0.2}
      />
    </Plane>
  );
}

function EnergeticParticles({ affectiveData }: { affectiveData?: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const tone = affectiveData?.toLowerCase() || "";
  const isDark = tone.includes("dark") || tone.includes("harsh");
  const isBright = tone.includes("bright") || tone.includes("beautiful");
  
  const color = isDark ? "#8b5cf6" : isBright ? "#fbbf24" : "#ec4899";
  const count = 500;
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function PerceptualObjects({ semanticData }: { semanticData?: string }) {
  const objects = [];
  const objectCount = semanticData ? Math.min(semanticData.split(",").length, 5) : 3;
  
  for (let i = 0; i < objectCount; i++) {
    const angle = (i / objectCount) * Math.PI * 2;
    const radius = 8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    objects.push(
      <Box
        key={i}
        position={[x, 1, z]}
        args={[1.5, 1.5, 1.5]}
      >
        <meshStandardMaterial 
          color="#3b82f6"
          roughness={0.5}
          metalness={0.5}
        />
      </Box>
    );
  }
  
  return <>{objects}</>;
}

function CognitiveElements({ reasoningData }: { reasoningData?: string }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  const isActive = reasoningData && reasoningData.length > 10;
  
  useFrame((state) => {
    if (sphereRef.current && isActive) {
      sphereRef.current.position.y = 5 + Math.sin(state.clock.elapsedTime) * 0.5;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  if (!isActive) return null;
  
  return (
    <Sphere ref={sphereRef} args={[1, 32, 32]} position={[0, 5, 0]}>
      <meshStandardMaterial
        color="#10b981"
        emissive="#10b981"
        emissiveIntensity={0.3}
        wireframe
      />
    </Sphere>
  );
}

function TranspersonalAmbience({ archetypeData }: { archetypeData?: string }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.8} 
        castShadow
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#a78bfa" />
    </>
  );
}

function VoidPotential({ voidData, seed }: { voidData?: string; seed: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const seedValue = parseInt(seed, 36) || 0;
  const noiseIntensity = (seedValue % 100) / 100;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 * noiseIntensity;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.15 * noiseIntensity;
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[15, 32, 32]} position={[0, 0, 0]}>
      <meshBasicMaterial
        color="#1a1a2e"
        transparent
        opacity={0.05 + noiseIntensity * 0.1}
        wireframe
      />
    </Sphere>
  );
}

function UniverseScene({ universe, onReset }: { universe: Universe; onReset?: () => void }) {
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 5, 15]);
  const controlsRef = useRef<any>(null);
  
  const physicalLayer = universe.layers[0];
  const energeticLayer = universe.layers[1];
  const perceptualLayer = universe.layers[2];
  const cognitiveLayer = universe.layers[3];
  const reflectiveLayer = universe.layers[4];
  const transpersonalLayer = universe.layers[5];
  const voidLayer = universe.layers[6];
  
  const perspective = reflectiveLayer?.extractedData?.includes("first-person") ? "first" : "third";
  
  useEffect(() => {
    if (perspective === "first") {
      setCameraPosition([0, 2, 5]);
    } else {
      setCameraPosition([0, 8, 15]);
    }
  }, [perspective]);
  
  useEffect(() => {
    if (controlsRef.current && cameraPosition) {
      setTimeout(() => {
        if (controlsRef.current?.saveState) {
          controlsRef.current.saveState();
        }
      }, 100);
    }
  }, [cameraPosition]);
  
  useEffect(() => {
    if (onReset && controlsRef.current) {
      (window as any).__resetUniverseView = () => {
        if (controlsRef.current) {
          controlsRef.current.reset();
        }
      };
    }
  }, [onReset]);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={75} />
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={50}
      />
      
      <TranspersonalAmbience archetypeData={transpersonalLayer?.extractedData} />
      
      <Sky 
        sunPosition={[100, 20, 100]}
        turbidity={8}
        rayleigh={6}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      <TerrainMesh physicalData={physicalLayer?.extractedData} />
      
      <EnergeticParticles affectiveData={energeticLayer?.extractedData} />
      
      <PerceptualObjects semanticData={perceptualLayer?.extractedData} />
      
      <CognitiveElements reasoningData={cognitiveLayer?.extractedData} />
      
      <VoidPotential voidData={voidLayer?.extractedData} seed={universe.seed} />
      
      <Text
        position={[0, 10, -15]}
        fontSize={1}
        color="#a78bfa"
        anchorX="center"
        anchorY="middle"
      >
        {universe.name}
      </Text>
      
      <gridHelper args={[40, 40, "#4a5568", "#2d3748"]} position={[0, -2, 0]} />
    </>
  );
}

export function UniverseViewer3D({ universe, onClose }: UniverseViewer3DProps) {
  const [, setLocation] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  
  const handleReset = () => {
    if ((window as any).__resetUniverseView) {
      (window as any).__resetUniverseView();
    }
  };
  
  return (
    <div className={`fixed inset-0 z-50 bg-background ${isFullscreen ? "" : "p-4"}`}>
      <div className="relative h-full w-full flex flex-col">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            data-testid="button-close-viewer"
          >
            <X className="h-4 w-4 mr-2" />
            Exit Universe
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            data-testid="button-toggle-fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            data-testid="button-reset-view"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            data-testid="button-toggle-info"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        {showInfo && (
          <Card className="absolute top-4 right-4 z-10 w-80 bg-background/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{universe.name}</span>
                <Badge variant="secondary">{universe.seed}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Original Prompt:</p>
                <p className="text-xs line-clamp-3">{universe.prompt}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-muted-foreground mb-2">Controls:</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Left click + drag to rotate</li>
                  <li>• Right click + drag to pan</li>
                  <li>• Scroll to zoom</li>
                  <li>• Explore the semantic layers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex-1 rounded-lg overflow-hidden bg-black">
          <Canvas shadows>
            <UniverseScene universe={universe} onReset={handleReset} />
          </Canvas>
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-background/95 backdrop-blur px-4 py-2">
            <p className="text-xs text-muted-foreground text-center">
              Seven-layer semantic universe generated from: "{universe.prompt.substring(0, 50)}..."
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
