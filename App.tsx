
import React, { useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { 
  ArrowRight, 
  Brain, 
  Globe, 
  TrendingUp, 
  Zap, 
  CheckCircle,
  Terminal,
  Cpu,
  Target,
  Lock,
  Disc,
  Code,
  Radio,
  ChevronDown,
  Play
} from 'lucide-react';

// --- Shaders (PRESERVED) ---

const EARTH_VERTEX_SHADER = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const EARTH_FRAGMENT_SHADER = `
uniform sampler2D dayTexture;
uniform sampler2D nightTexture;
uniform vec3 sunDirection;

varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 sunDir = normalize(sunDirection);
  
  float diffuse = max(0.1, dot(normal, sunDir));
  
  vec3 dayColor = texture2D(dayTexture, vUv).rgb;
  vec3 nightColor = texture2D(nightTexture, vUv).rgb;
  
  vec3 cityLights = pow(nightColor, vec3(3.0)) * 25.0; 
  cityLights *= vec3(1.0, 0.9, 0.7);

  vec3 surfaceColor = dayColor * 0.08 * vec3(0.3, 0.5, 1.0);
  surfaceColor *= diffuse;

  vec3 finalColor = surfaceColor + cityLights;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const ATMOSPHERE_VERTEX_SHADER = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ATMOSPHERE_FRAGMENT_SHADER = `
uniform vec3 glowColor;
varying vec3 vNormal;
void main() {
  float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
  gl_FragColor = vec4(glowColor, 1.0) * intensity * 1.5;
}
`;

// --- 3D Components (PRESERVED) ---

const Earth = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const [dayMap, nightMap] = useLoader(THREE.TextureLoader, [
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
    "https://unpkg.com/three-globe/example/img/earth-night.jpg"
  ]);

  const uniforms = useMemo(() => ({
    dayTexture: { value: dayMap },
    nightTexture: { value: nightMap },
    sunDirection: { value: new THREE.Vector3(-2.0, 1.0, 3.0).normalize() }
  }), [dayMap, nightMap]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial 
          uniforms={uniforms}
          vertexShader={EARTH_VERTEX_SHADER}
          fragmentShader={EARTH_FRAGMENT_SHADER}
        />
      </mesh>
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial 
          uniforms={{
            glowColor: { value: new THREE.Color(0x3a8bff) }
          }}
          vertexShader={ATMOSPHERE_VERTEX_SHADER}
          fragmentShader={ATMOSPHERE_FRAGMENT_SHADER}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.05} />
      <Stars radius={300} depth={60} count={12000} factor={6} saturation={0.9} fade speed={0.5} />
      <Earth />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate={true}
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 2.5}
      />
    </>
  );
};

// --- UTILS & HOOKS ---

const useTextScramble = (text: string) => {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

  const scramble = () => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(interval);
      }
      iterations += 1 / 3;
    }, 30);
  };

  return { display, scramble };
};

const TextScramble = ({ text, className = "" }: { text: string, className?: string }) => {
  const { display, scramble } = useTextScramble(text);
  return (
    <span onMouseEnter={scramble} className={`inline-block cursor-crosshair ${className}`}>
      {display}
    </span>
  );
};

// --- COMPONENTS ---

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-8 h-8 border border-[#ccff00] rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
      style={{
        transform: `translate3d(${mousePosition.x - 16}px, ${mousePosition.y - 16}px, 0)`,
      }}
    >
      <div className="w-1 h-1 bg-[#ccff00]" />
    </div>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-deep-space">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-deep-space pointer-events-none" />
      </div>

      <motion.div 
        style={{ y: y1, opacity }} 
        className="z-10 relative w-full max-w-[1400px] px-4 md:px-6 flex flex-col items-center justify-between h-full py-12 md:py-20 pointer-events-none"
      >
        {/* Top Header */}
        <div className="w-full flex justify-between items-start">
             <div className="flex items-center gap-2 text-acid-green bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full md:bg-transparent md:p-0">
                 <Radio className="w-3 h-3 md:w-4 md:h-4 animate-pulse" />
                 <span className="text-[9px] md:text-[10px] font-mono tracking-[0.3em] uppercase">Live Signal</span>
             </div>
             <div className="text-right hidden md:block">
                 <div className="text-white text-xs font-bold font-mono tracking-widest uppercase">Certificación Global</div>
                 <div className="text-slate-500 text-[10px] font-mono tracking-widest">Batch: 2025 // Q4</div>
             </div>
        </div>

        {/* Main Title */}
        <div className="flex flex-col items-center justify-center relative w-full">
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
             className="flex flex-col items-center leading-[0.85] font-black uppercase tracking-tighter text-center mix-blend-difference w-full"
           >
             <div className="text-[15vw] md:text-[11rem] relative z-10 text-white">Mente y</div>
             <div className="text-[15vw] md:text-[11rem] relative z-10 text-outline opacity-80">Mercado</div>
           </motion.h1>

           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 1 }}
             className="mt-6 md:mt-8 max-w-xs md:max-w-lg text-center"
           >
              <p className="text-slate-300 font-space text-xs md:text-base leading-relaxed bg-black/30 backdrop-blur-md md:bg-transparent md:backdrop-blur-none p-4 md:p-0 rounded-xl border border-white/5 md:border-none">
                <span className="text-acid-green font-bold mr-2">///</span>
                El único programa que integra las 6 dimensiones del éxito profesional. Domina la estrategia y la ejecución.
              </p>
           </motion.div>
        </div>

        {/* Bottom CTA */}
        <div className="pointer-events-auto">
           <a href="#modules" className="flex flex-col items-center gap-2 group cursor-pointer">
               <span className="text-[9px] md:text-[10px] font-mono tracking-[0.3em] text-slate-500 group-hover:text-white transition-colors">EXPLORAR SISTEMA</span>
               <div className="w-px h-8 md:h-12 bg-gradient-to-b from-acid-green to-transparent group-hover:h-12 md:group-hover:h-16 transition-all duration-500" />
               <ChevronDown className="text-acid-green w-4 h-4 md:w-5 md:h-5 animate-bounce" />
           </a>
        </div>
      </motion.div>
    </section>
  );
};

const StreamBar = () => {
  return (
    <div className="w-full bg-card-bg border-y border-white/5 py-3 overflow-hidden z-20 relative flex items-center backdrop-blur-sm">
      <div className="absolute left-0 bg-acid-green text-black px-4 md:px-6 py-3 font-bold font-mono text-[10px] md:text-xs z-10 skew-x-12 -ml-4 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
        <span className="-skew-x-12 block">STATUS UPDATE</span>
      </div>
      <motion.div 
        className="flex whitespace-nowrap ml-32"
        animate={{ x: "-20%" }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-16 mx-8">
             <span className="text-white text-[10px] md:text-xs font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Cierre de Inscripciones: 15 de Diciembre 2025
             </span>
             <span className="text-slate-600 text-[10px] md:text-xs font-mono">///</span>
             <span className="text-acid-green text-[10px] md:text-xs font-bold font-mono uppercase tracking-widest">
                Cupos Restantes: 14
             </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const Manifesto = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 bg-deep-space relative overflow-hidden border-b border-white/5">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
        
        {/* Image/Visual Column */}
        <div className="lg:col-span-5 relative order-2 lg:order-1">
            <motion.div style={{ y }} className="relative z-10">
               <div className="aspect-[4/5] rounded-lg overflow-hidden relative border border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-deep-space/90 z-10" />
                  {/* Abstract geometric visual replacing image */}
                  <div className="w-full h-full bg-card-bg flex items-center justify-center overflow-hidden">
                      <div className="w-48 md:w-64 h-48 md:h-64 border border-acid-green/20 rounded-full absolute animate-[spin_10s_linear_infinite]" />
                      <div className="w-32 md:w-48 h-32 md:h-48 border border-white/10 rotate-45 absolute" />
                      <div className="w-24 md:w-32 h-24 md:h-32 bg-gradient-to-tr from-acid-green/20 to-transparent rounded-full blur-2xl" />
                  </div>
                  
                  <div className="absolute bottom-8 left-8 z-20">
                      <p className="text-acid-green font-mono text-xs tracking-widest mb-2">FIG 01. LA BRECHA</p>
                      <h3 className="text-2xl md:text-3xl font-syne font-bold text-white">Teoría vs. <br/>Ejecución</h3>
                  </div>
               </div>
            </motion.div>
        </div>

        {/* Text Column */}
        <div className="lg:col-span-7 order-1 lg:order-2">
            <h2 className="text-electric-indigo font-mono text-xs tracking-[0.3em] mb-6 uppercase flex items-center gap-3">
              <span className="w-8 h-px bg-electric-indigo"></span>
              Diagnóstico del Sistema
            </h2>
            
            <h3 className="text-3xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-8 md:mb-10 font-syne">
              El modelo educativo tradicional está <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">obsoleto.</span>
            </h3>
            
            <div className="space-y-6 md:space-y-8 text-base md:text-xl font-light text-slate-400 leading-relaxed">
              <p>
                Te venden información que caduca antes de que termines de leerla. El mercado digital no respeta títulos; respeta <strong className="text-white">velocidad</strong> y <strong className="text-white">resultados</strong>.
              </p>
              <p className="border-l-2 border-acid-green pl-6 italic text-slate-300">
                "Hemos hackeado el sistema para crear una certificación basada 100% en ejecución. No aprendes para luego hacer. Haces para aprender."
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8">
               <div>
                  <div className="text-3xl font-bold text-white font-syne mb-2">94%</div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Falla en aplicar teoría</div>
               </div>
               <div>
                  <div className="text-3xl font-bold text-acid-green font-syne mb-2">100%</div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Enfoque Práctico</div>
               </div>
            </div>
        </div>
      </div>
    </section>
  );
};

const ModuleCard: React.FC<{ module: any; index: number }> = ({ module, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group bg-card-bg border border-white/5 hover:border-acid-green/50 p-8 md:p-10 relative overflow-hidden transition-all duration-500 hover:-translate-y-2"
    >
       <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
          <span className="font-mono text-5xl font-bold text-white/5 group-hover:text-white/10">0{module.id}</span>
       </div>
       
       <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-8 text-acid-green group-hover:scale-110 transition-transform duration-300 border border-white/5 group-hover:border-acid-green/30 group-hover:shadow-[0_0_20px_-5px_rgba(204,255,0,0.3)]">
          {module.icon}
       </div>

       <h3 className="text-2xl font-bold text-white font-syne mb-4 group-hover:text-acid-green transition-colors">
         {module.title}
       </h3>
       
       <p className="text-slate-400 text-sm leading-relaxed mb-6">
         {module.desc}
       </p>

       <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
          <span>Core Skill: {module.sub}</span>
          <div className="h-px flex-1 bg-white/10 group-hover:bg-acid-green/50 transition-colors" />
       </div>
    </motion.div>
  );
};

const ModuleList = () => {
  const modules = [
    { id: 1, title: "Mente Estratégica", sub: "Intelligence", icon: <Brain />, desc: "7 Inteligencias Esenciales + 7 Libros clave. Domina el pensamiento crítico y la toma de decisiones." },
    { id: 2, title: "Influencia & Poder", sub: "Resilience", icon: <Zap />, desc: "Desarrolla una resiliencia inquebrantable estudiando a los 7 líderes globales más influyentes." },
    { id: 3, title: "Análisis de Negocio", sub: "Analytics", icon: <TrendingUp />, desc: "Deconstrucción de modelos de negocio unicornio (ej. ZOOM) usando el Método Harvard." },
    { id: 4, title: "Inglés Global", sub: "Negotiation", icon: <Globe />, desc: "Negociación en vivo desde Londres. Rompe barreras y cierra tratos en cualquier idioma." },
    { id: 5, title: "Método Ágil", sub: "Velocity", icon: <Cpu />, desc: "Sprints de 7 semanas. Sin relleno. Implementación de sistemas de alta velocidad." },
    { id: 6, title: "Consultoría Real", sub: "Profit", icon: <Target />, desc: "Tu misión final: Conseguir un cliente real pagado y documentar el caso de éxito." },
  ];

  return (
    <section id="modules" className="py-24 md:py-32 bg-[#030508] relative">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#1a1d2d,transparent_50%)]" />
       
       <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
             <h2 className="text-acid-green font-mono text-xs tracking-widest uppercase mb-4">Arquitectura del Programa</h2>
             <h3 className="text-4xl md:text-6xl font-bold text-white font-syne tracking-tight">
               La Matriz de <span className="text-transparent bg-clip-text bg-gradient-to-r from-acid-green to-emerald-400">Alto Valor</span>
             </h3>
             <p className="mt-6 text-slate-400">6 módulos diseñados para transformar potencial en potencia.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {modules.map((mod, idx) => (
                <ModuleCard key={mod.id} module={mod} index={idx} />
             ))}
          </div>
       </div>
    </section>
  );
};

const Roadmap = () => {
  return (
    <section className="py-24 md:py-32 bg-deep-space relative overflow-hidden border-t border-white/5">
      <div className="max-w-[1000px] mx-auto px-6 relative z-10">
        <div className="mb-16 md:mb-20 flex flex-col md:flex-row items-end justify-between gap-8 border-b border-white/10 pb-8">
           <div>
              <span className="text-electric-indigo font-mono text-xs tracking-widest uppercase block mb-4">Sincronización Semanal</span>
              <h2 className="text-4xl md:text-7xl font-black text-white uppercase font-syne">Agenda Táctica</h2>
           </div>
           <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-mono text-white uppercase tracking-wider">Live Sessions</span>
           </div>
        </div>

        <div className="space-y-4">
            {[
                { day: "MARTES", time: "19:00 EST", title: "Mentoría Central", subtitle: "Alineación Estratégica", icon: <Brain />, color: "text-acid-green", border: "border-acid-green" },
                { day: "JUEVES", time: "18:00 EST", title: "Inglés de Negocios", subtitle: "Conexión desde Londres", icon: <Globe />, color: "text-electric-indigo", border: "border-electric-indigo" },
                { day: "SÁBADO", time: "10:00 EST", title: "Taller Técnico", subtitle: "Ejecución & Herramientas", icon: <Code />, color: "text-white", border: "border-white" },
            ].map((item, i) => (
                <div key={i} className="group relative flex items-stretch bg-card-bg border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden">
                    {/* Side Indicator */}
                    <div className={`w-1 md:w-2 bg-gradient-to-b from-transparent via-white/10 to-transparent group-hover:via-${item.color.split('-')[1]} transition-colors`} />
                    
                    <div className="p-6 md:p-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                       <div className="flex items-center gap-6 md:w-1/3">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border ${item.border} border-opacity-20 flex items-center justify-center ${item.color} bg-white/5 flex-shrink-0`}>
                             {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4 md:w-5 md:h-5" })}
                          </div>
                          <div>
                             <div className="font-mono text-[10px] md:text-xs text-slate-500 tracking-widest mb-1">{item.day} // {item.time}</div>
                             <div className={`font-bold text-lg md:text-xl ${item.color}`}>{item.title}</div>
                          </div>
                       </div>
                       
                       <div className="md:w-1/3 text-slate-400 font-light text-sm">
                          {item.subtitle}
                       </div>

                       <div className="md:w-auto flex justify-end">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                             <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                          </div>
                       </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

const AccessTerminal = () => {
  const [status, setStatus] = useState('IDLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('VERIFYING');
    setTimeout(() => setStatus('GRANTED'), 2000);
  };

  return (
    <section id="checkout" className="py-24 md:py-32 px-4 bg-[#000000] min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] md:bg-[size:100px_100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-acid-green/5 rounded-full blur-[80px] md:blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-5 gap-8 md:gap-12 items-stretch">
        
        {/* Left: Offer Details */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-card-bg border border-white/10 p-8 md:p-10 backdrop-blur-md">
           <div>
               <div className="inline-flex items-center gap-2 border border-acid-green/30 rounded-full px-3 py-1 bg-acid-green/10 text-acid-green text-[10px] font-mono uppercase tracking-widest mb-6 md:mb-8">
                  <Lock className="w-3 h-3" />
                  Secure Offer
               </div>
               
               <h2 className="text-4xl md:text-5xl font-bold text-white font-syne mb-4">
                 Acceso <br/>Total
               </h2>
               <div className="text-slate-400 text-sm mb-8 md:mb-12 leading-relaxed">
                 Sprint de 7 semanas + Certificación + Herramientas.
                 Precio exclusivo de lanzamiento.
               </div>

               <div className="space-y-4 mb-8 md:mb-12">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                     <span className="text-slate-500 text-xs uppercase font-mono">Valor Real</span>
                     <span className="text-slate-500 text-sm line-through">$997 USD</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                     <span className="text-white text-xs uppercase font-mono font-bold">Tu Precio Hoy</span>
                     <span className="text-acid-green text-3xl font-bold">$25 USD</span>
                  </div>
               </div>
           </div>
           
           <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
              <Disc className="animate-spin-slow w-4 h-4" />
              <span>Processing ID: #882-X9</span>
           </div>
        </div>

        {/* Right: Terminal Form */}
        <div className="lg:col-span-3 bg-[#050505] border border-white/10 p-8 md:p-14 relative shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-acid-green via-electric-indigo to-acid-green" />
           
           <div className="flex justify-between items-center mb-8 md:mb-12">
               <div className="flex items-center gap-3">
                   <Terminal className="text-white w-6 h-6" />
                   <span className="text-white font-mono text-sm uppercase tracking-wider">Payment Terminal</span>
               </div>
               <div className="flex gap-1">
                   <div className="w-2 h-2 rounded-full bg-red-500" />
                   <div className="w-2 h-2 rounded-full bg-yellow-500" />
                   <div className="w-2 h-2 rounded-full bg-green-500" />
               </div>
           </div>

           <AnimatePresence mode='wait'>
             {status === 'GRANTED' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-12"
                >
                   <div className="w-24 h-24 rounded-full bg-acid-green/20 flex items-center justify-center mb-6 border border-acid-green">
                       <CheckCircle className="w-10 h-10 text-acid-green" />
                   </div>
                   <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-2">Transacción Aprobada</h3>
                   <p className="font-mono text-slate-500 text-xs">Iniciando secuencia de onboarding...</p>
                </motion.div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                 <div className="grid gap-6">
                     <div className="group">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-acid-green transition-colors">Nombre Completo</label>
                        <input required type="text" className="w-full bg-white/5 border border-white/10 py-3 md:py-4 px-4 text-white font-mono text-sm focus:outline-none focus:border-acid-green focus:bg-white/10 transition-all rounded-sm" placeholder="JOHN DOE" />
                     </div>
                     <div className="group">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-acid-green transition-colors">Correo Electrónico</label>
                        <input required type="email" className="w-full bg-white/5 border border-white/10 py-3 md:py-4 px-4 text-white font-mono text-sm focus:outline-none focus:border-acid-green focus:bg-white/10 transition-all rounded-sm" placeholder="ACCESS@GMAIL.COM" />
                     </div>
                     <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="group">
                           <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-acid-green transition-colors">Tarjeta</label>
                           <input required type="text" className="w-full bg-white/5 border border-white/10 py-3 md:py-4 px-4 text-white font-mono text-sm focus:outline-none focus:border-acid-green focus:bg-white/10 transition-all rounded-sm" placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="group">
                           <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-acid-green transition-colors">CVC / EXP</label>
                           <input required type="text" className="w-full bg-white/5 border border-white/10 py-3 md:py-4 px-4 text-white font-mono text-sm focus:outline-none focus:border-acid-green focus:bg-white/10 transition-all rounded-sm" placeholder="123  /  10/28" />
                        </div>
                     </div>
                 </div>

                 <button 
                   disabled={status === 'VERIFYING'}
                   type="submit" 
                   className="w-full bg-white text-black font-bold py-4 md:py-5 uppercase tracking-[0.2em] hover:bg-acid-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8"
                 >
                    {status === 'VERIFYING' ? 'ENCRIPTANDO...' : 'CONFIRMAR ACCESO'}
                    <ArrowRight className="w-4 h-4" />
                 </button>
               </form>
             )}
           </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

const Footer = () => (
    <footer className="py-12 bg-black text-center border-t border-white/5 relative z-10">
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="text-2xl font-bold text-white font-syne tracking-tighter">MENTE Y MERCADO</div>
            <div className="flex gap-8 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
               <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
               <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
            </div>
            <div className="text-slate-800 text-[10px] font-mono uppercase tracking-widest mt-4">
              System v2.5.0 // All Rights Reserved 2025.
            </div>
        </div>
    </footer>
);

export default function App() {
  return (
    <div className="antialiased selection:bg-acid-green selection:text-black bg-deep-space min-h-screen text-white">
      <CustomCursor />
      {/* Global Noise */}
      <div className="noise-overlay" />
      
      <Hero />
      <StreamBar />
      <Manifesto />
      <ModuleList />
      <Roadmap />
      <AccessTerminal />
      <Footer />
    </div>
  );
}
