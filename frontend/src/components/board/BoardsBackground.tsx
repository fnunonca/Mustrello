import React, { useEffect, useRef } from 'react';
import type * as ThreeTypes from 'three';
import { BOARD_PALETTE } from '../../utils/boardColors';

interface Floater {
  mesh: ThreeTypes.Mesh;
  base: ThreeTypes.Vector3;
  speed: number;
  phase: number;
  spin: number;
}

/**
 * Fixed full-viewport Three.js background: floating rounded-box blocks +
 * particle stars + mouse parallax. Mounted only on the dashboard. Ported
 * from prototypes/boards-3d.html's `#bg` scene. Loads three lazily so it
 * never bloats the main bundle, and fully disposes on unmount.
 */
export const BoardsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let disposed = false;
    let rafId = 0;
    const cleanupFns: Array<() => void> = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    void (async () => {
      const THREE = await import('three');
      const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 0, 12);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x445066, 1.1);
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(5, 8, 6);
      scene.add(hemi, key);

      const geometries: ThreeTypes.BufferGeometry[] = [];
      const materials: ThreeTypes.Material[] = [];

      const blockGeo = new RoundedBoxGeometry(1.6, 1.0, 0.18, 4, 0.12);
      geometries.push(blockGeo);

      const floaters: Floater[] = [];
      for (let i = 0; i < 16; i++) {
        const [c1] = BOARD_PALETTE[i % BOARD_PALETTE.length];
        const material = new THREE.MeshStandardMaterial({
          color: c1,
          roughness: 0.35,
          metalness: 0.1,
          transparent: true,
          opacity: 0.55,
        });
        materials.push(material);

        const mesh = new THREE.Mesh(blockGeo, material);
        const scale = 0.5 + Math.random() * 0.9;
        mesh.scale.setScalar(scale);
        mesh.position.set(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 12,
          -2 - Math.random() * 10
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        scene.add(mesh);

        floaters.push({
          mesh,
          base: mesh.position.clone(),
          speed: 0.2 + Math.random() * 0.4,
          phase: Math.random() * 6.28,
          spin: (Math.random() - 0.5) * 0.4,
        });
      }

      const starGeo = new THREE.BufferGeometry();
      const starPos = new Float32Array(600 * 3);
      for (let i = 0; i < starPos.length; i++) {
        starPos[i] = (Math.random() - 0.5) * (i % 3 === 2 ? 20 : 30);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      geometries.push(starGeo);

      const starMat = new THREE.PointsMaterial({ color: 0x5060a0, size: 0.05, transparent: true, opacity: 0.6 });
      materials.push(starMat);
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

      const mouse = { x: 0, y: 0 };
      const handlePointerMove = (event: PointerEvent) => {
        mouse.x = event.clientX / window.innerWidth - 0.5;
        mouse.y = event.clientY / window.innerHeight - 0.5;
      };
      if (!reducedMotion) {
        window.addEventListener('pointermove', handlePointerMove);
        cleanupFns.push(() => window.removeEventListener('pointermove', handlePointerMove));
      }

      const resize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', resize);
      cleanupFns.push(() => window.removeEventListener('resize', resize));
      resize();

      const clock = new THREE.Clock();
      const tick = () => {
        const t = clock.getElapsedTime();
        floaters.forEach((f) => {
          f.mesh.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * 0.5;
          f.mesh.rotation.x += f.spin * 0.01;
          f.mesh.rotation.y += f.spin * 0.012;
        });
        stars.rotation.y = t * 0.01;
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.04;
        camera.position.y += (-mouse.y * 1.2 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, -4);
        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
      };

      if (reducedMotion) {
        renderer.render(scene, camera);
      } else {
        rafId = requestAnimationFrame(tick);
      }

      cleanupFns.push(() => {
        cancelAnimationFrame(rafId);
        geometries.forEach((g) => g.dispose());
        materials.forEach((m) => m.dispose());
        renderer.dispose();
      });
    })();

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
      cleanupFns.length = 0;
    };
  }, []);

  return <canvas ref={canvasRef} className="boards-bg-canvas" aria-hidden="true" />;
};
