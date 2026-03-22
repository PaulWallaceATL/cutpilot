"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "motion/react";

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100,
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

    const fov = camera.fov * (Math.PI / 180);
    const planeHeight = camera.position.z * Math.tan(fov / 2) * 2;
    const planeWidth = planeHeight * camera.aspect;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        gl_Position = projectionMatrix * viewPosition;
        vUv = uv;
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform vec2 uViewportRes;
      uniform float uTime;
      uniform float uRedFactor;
      uniform float uGreenFactor;
      uniform float uBlueFactor;
      uniform vec2 uMouse;

      vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      vec2 coverUvs(vec2 imageRes, vec2 containerRes, vec2 vUv) {
        float imageAspectX = imageRes.x/imageRes.y;
        float imageAspectY = imageRes.y/imageRes.x;
        float containerAspectX = containerRes.x/containerRes.y;
        float containerAspectY = containerRes.y/containerRes.x;
        vec2 ratio = vec2(
          min(containerAspectX / imageAspectX, 1.0),
          min(containerAspectY / imageAspectY, 1.0)
        );
        return vec2(
          vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
          vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
        );
      }

      void main() {
        vec2 squareUvs = coverUvs(vec2(1.0), uViewportRes, vUv);
        vec2 mouseInfluence = squareUvs - uMouse;
        float mouseDistance = length(mouseInfluence);
        float mouseEffect = smoothstep(0.8, 0.0, mouseDistance) * 0.3;

        float noise1 = snoise(vec3(squareUvs * 2.0 + mouseInfluence * 0.1, uTime * 0.1));
        float noise2 = snoise(vec3(squareUvs * 3.0 - mouseInfluence * 0.15, uTime * 0.08));
        float noise3 = snoise(vec3(squareUvs * 1.5 + mouseInfluence * 0.05, uTime * 0.12));

        float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
        float waves = sin(combinedNoise * 8.0 + uTime * 0.5 + mouseEffect * 5.0) * 0.5 + 0.5;
        float radialGradient = length(squareUvs - 0.5) * 2.0;

        vec3 finalColor = vec3(
          0.02 + waves * uRedFactor * (1.0 - radialGradient * 0.3) + mouseEffect * 0.15,
          0.12 + waves * uGreenFactor + sin(squareUvs.x * 3.14) * 0.15 + mouseEffect * 0.25,
          0.15 + waves * uBlueFactor + cos(squareUvs.y * 3.14) * 0.12 + mouseEffect * 0.2
        );

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uViewportRes: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uRedFactor: { value: 0.15 },
        uGreenFactor: { value: 0.55 },
        uBlueFactor: { value: 0.45 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      },
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(planeWidth, planeHeight, 1);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uMouse.value.x += (mouseRef.current.x - material.uniforms.uMouse.value.x) * 0.05;
      material.uniforms.uMouse.value.y += (mouseRef.current.y - material.uniforms.uMouse.value.y) * 0.05;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      const fov = camera.fov * (Math.PI / 180);
      const pH = camera.position.z * Math.tan(fov / 2) * 2;
      mesh.scale.set(pH * camera.aspect, pH, 1);
      material.uniforms.uViewportRes.value.set(w, h);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1.0 - (e.clientY - rect.top) / rect.height,
    };
  };

  return (
    <section
      className="relative w-full min-h-[100dvh] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* WebGL Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
      />

      {/* Framed content overlay */}
      <div className="bg-[rgba(0,0,0,0.25)] dark:bg-[rgba(0,0,0,0.45)] z-10 relative flex flex-col p-[3.5vmax] min-h-[100dvh] overflow-hidden">
        <div className="flex-1 relative w-full overflow-hidden">
          {/* Top bar: Logo + CTA */}
          <div className="p-[3.5vmax] text-white flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-2.5"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 -m-1 rounded-full bg-white/10 blur-md" />
                <Zap className="relative h-6 w-6 text-white drop-shadow-sm" />
              </div>
              <span className="text-[max(1.1rem,1.2vmax)] font-bold tracking-tight">
                CutPilot
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-[max(0.85rem,0.95vmax)] text-white/70 hover:text-white transition-colors duration-200"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 text-[max(0.85rem,0.95vmax)] font-medium text-white"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>

          {/* Decorative corners */}
          <Corner position="top-left" />
          <Corner position="top-right" />
          <Corner position="bottom-right" className="hidden md:block" />
        </div>

        {/* Mobile bottom-left corner */}
        <Corner position="bottom-left-outer" className="block md:hidden" />

        {/* Bottom section: Title + Links */}
        <div className="flex flex-col items-start md:flex-row">
          {/* Headline */}
          <div className="pb-[3.5vmax] pl-[3.5vmax] pr-[3.5vmax] text-white relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[max(0.8rem,0.9vmax)] text-white/60 font-medium tracking-wide uppercase">
                AI-Powered Fitness
              </span>
            </motion.div>

            <h1 className="text-[clamp(2.5rem,5vmax,6rem)] leading-[1.05] font-bold tracking-tight">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Your cut,
              </motion.span>
              <motion.span
                className="block bg-gradient-to-r from-white via-emerald-200 to-teal-200 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                executed.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-5 text-[max(0.95rem,1.05vmax)] text-white/50 max-w-md leading-relaxed"
            >
              Personalized plans, smart tracking, and a contextual AI coach — all in one premium experience.
            </motion.p>

            {/* Corner decorations on title area */}
            <Corner position="bottom-right" className="hidden md:block" />
            <Corner position="bottom-left" className="hidden md:block" />
          </div>

          {/* Right links panel */}
          <div className="bg-background flex-1 h-full rounded-tl-[2.5vmax] relative font-light text-[max(0.95rem,1.1vmax)] flex flex-col items-end justify-end pt-[3.5vmax] self-end pl-[3.5vmax] pr-[3.5vmax] pb-[1vmax]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="w-full flex flex-col items-end gap-5"
            >
              <Link
                href="/signup"
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-7 py-3.5 text-[max(0.9rem,1vmax)] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                Start Your Cut Free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              <ul className="flex flex-col gap-[max(0.5rem,0.6vmax)] items-end opacity-60 hover:opacity-100 transition-opacity duration-300">
                {["Free to start", "No credit card required", "AI plans in seconds"].map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
                    className="flex items-center gap-2 text-[max(0.75rem,0.85vmax)] text-muted-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-primary/50" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Link panel corners (mobile) */}
            <div
              className="block md:hidden absolute bottom-0 left-0 h-12 w-12"
              style={{
                background: "radial-gradient(circle at top left, transparent 48px, var(--background) 48px)",
                transform: "translateX(-100%) translateZ(0)",
              }}
            />
            <div
              className="block md:hidden absolute top-0 right-0 h-12 w-12"
              style={{
                background: "radial-gradient(circle at top left, transparent 48px, var(--background) 48px)",
                transform: "translateY(-100%) translateZ(0)",
              }}
            />
          </div>
        </div>

        {/* Border frame */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="h-[3.5vmax] bg-background absolute bottom-0 left-0 w-full" />
          <div className="h-[3.5vmax] bg-background absolute top-0 left-0 w-full" />
          <div className="w-[3.5vmax] bg-background absolute bottom-0 left-0 h-full" />
          <div className="w-[3.5vmax] bg-background absolute bottom-0 right-0 h-full" />
        </div>
      </div>
    </section>
  );
}

function Corner({
  position,
  className = "",
}: {
  position: "top-left" | "top-right" | "bottom-right" | "bottom-left" | "bottom-left-outer";
  className?: string;
}) {
  const map: Record<string, { classes: string; gradient: string }> = {
    "top-left": {
      classes: "absolute top-0 left-0",
      gradient: "radial-gradient(circle at bottom right, transparent 48px, var(--background) 48px)",
    },
    "top-right": {
      classes: "absolute top-0 right-0",
      gradient: "radial-gradient(circle at bottom left, transparent 48px, var(--background) 48px)",
    },
    "bottom-right": {
      classes: "absolute bottom-0 right-0",
      gradient: "radial-gradient(circle at top left, transparent 48px, var(--background) 48px)",
    },
    "bottom-left": {
      classes: "absolute bottom-0 left-0",
      gradient: "radial-gradient(circle at top right, transparent 48px, var(--background) 48px)",
    },
    "bottom-left-outer": {
      classes: "absolute bottom-[3.5vmax] left-[3.5vmax]",
      gradient: "radial-gradient(circle at top right, transparent 48px, var(--background) 48px)",
    },
  };

  const cfg = map[position];
  return (
    <div
      className={`${cfg.classes} h-12 w-12 ${className}`}
      style={{ background: cfg.gradient, transform: "translateZ(0)" }}
    />
  );
}
