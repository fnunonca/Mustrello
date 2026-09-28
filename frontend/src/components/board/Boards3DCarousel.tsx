import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type * as ThreeTypes from 'three';
import type { Board } from '../../types';
import { getBoardColors } from '../../utils/boardColors';

interface Boards3DCarouselProps {
  boards: Board[];
}

interface PanelUserData {
  board: Board;
  index: number;
  angle: number;
  phase: number;
}

/** Draws a rounded rectangle path without relying on CanvasRenderingContext2D.roundRect. */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Three.js carousel view: real board data rendered onto canvas-texture
 * panels arranged in a circle. Drag to spin with snap, click a panel to
 * focus it, click the focused panel to open the board. Ported from
 * prototypes/boards-3d.html's `#stage` scene.
 */
export const Boards3DCarousel: React.FC<Boards3DCarouselProps> = ({ boards }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let disposed = false;
    let rafId = 0;
    let resizeObserver: ResizeObserver | undefined;
    const cleanupFns: Array<() => void> = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    void (async () => {
      const THREE = await import('three');
      const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js');
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 1.6, 10.5);
      camera.lookAt(0, 0.2, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x334055, 1.2));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
      keyLight.position.set(3, 6, 8);
      scene.add(keyLight);

      const floorGeo = new THREE.CircleGeometry(7, 64);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x8090c0, transparent: true, opacity: 0.12, roughness: 1 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.5;
      scene.add(floor);

      const carouselGroup = new THREE.Group();
      scene.add(carouselGroup);

      const panelGeo = new RoundedBoxGeometry(3.2, 2.0, 0.14, 4, 0.08);

      function boardTexture(board: Board) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        const [c1, c2] = getBoardColors(board.id);
        const gradient = ctx.createLinearGradient(0, 0, 640, 400);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 400);

        const shine = ctx.createRadialGradient(540, 60, 10, 540, 60, 260);
        shine.addColorStop(0, 'rgba(255,255,255,.35)');
        shine.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shine;
        ctx.fillRect(0, 0, 640, 400);

        const lists = board.lists ?? [];
        const cols = Math.min(Math.max(lists.length, 1), 4);
        const colW = (640 - 48 - (cols - 1) * 14) / cols;
        for (let i = 0; i < cols; i++) {
          const x = 24 + i * (colW + 14);
          ctx.fillStyle = 'rgba(255,255,255,.22)';
          roundRectPath(ctx, x, 24, colW, 190, 12);
          ctx.fill();
          const cardCount = Math.min(lists[i]?.cards?.length ?? 0, 4);
          for (let j = 0; j < cardCount; j++) {
            ctx.fillStyle = 'rgba(255,255,255,.88)';
            roundRectPath(ctx, x + 10, 36 + j * 40, j % 2 ? colW * 0.6 : colW - 20, 28, 6);
            ctx.fill();
          }
        }

        ctx.fillStyle = '#fff';
        ctx.font = "700 44px system-ui, sans-serif";
        ctx.fillText(board.name, 28, 282);

        const totalCards = lists.reduce((sum, list) => sum + (list.cards?.length ?? 0), 0);
        const listsLabel = lists.length === 1 ? 'lista' : 'listas';
        const cardsLabel = totalCards === 1 ? 'tarjeta' : 'tarjetas';
        ctx.font = "500 22px system-ui, sans-serif";
        ctx.fillStyle = 'rgba(255,255,255,.9)';
        ctx.fillText(`${lists.length} ${listsLabel} · ${totalCards} ${cardsLabel}`, 28, 322);

        if (board.createdAt) {
          ctx.font = "400 18px system-ui, sans-serif";
          ctx.fillStyle = 'rgba(255,255,255,.75)';
          ctx.fillText(format(new Date(board.createdAt), 'd MMM yyyy', { locale: es }), 28, 356);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        return texture;
      }

      function disposePanel(panel: ThreeTypes.Mesh) {
        const mats = Array.isArray(panel.material) ? panel.material : [panel.material];
        mats.forEach((m) => {
          const material = m as ThreeTypes.MeshStandardMaterial;
          material.map?.dispose();
          material.dispose();
        });
      }

      let panels: ThreeTypes.Mesh[] = [];
      let focused = 0;
      let rotTarget = 0;

      function buildPanels(list: Board[]) {
        panels.forEach((p) => {
          carouselGroup.remove(p);
          disposePanel(p);
        });

        const n = list.length;
        const radius = Math.max(3.2, n * 0.85);
        panels = list.map((board, i) => {
          const [, sideColor] = getBoardColors(board.id);
          const side = new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.4 });
          const front = new THREE.MeshStandardMaterial({ map: boardTexture(board), roughness: 0.35 });
          const mesh = new THREE.Mesh(panelGeo, [side, side, side, side, front, side]);
          const angle = (i / n) * Math.PI * 2;
          mesh.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
          mesh.rotation.y = angle;
          const userData: PanelUserData = { board, index: i, angle, phase: i };
          mesh.userData = userData;
          carouselGroup.add(mesh);
          return mesh;
        });

        focused = n ? Math.min(focused, n - 1) : 0;
        if (n) rotTarget = -(panels[focused].userData as PanelUserData).angle;
      }

      buildPanels(boards);

      function focusPanel(i: number) {
        const n = panels.length;
        if (!n) return;
        const step = (Math.PI * 2) / n;
        const current = Math.round(-carouselGroup.rotation.y / step);
        let delta = (((i - current) % n) + n) % n;
        if (delta > n / 2) delta -= n;
        focused = i;
        rotTarget = -(current + delta) * step;
      }

      const raycaster = new THREE.Raycaster();
      function pick(clientX: number, clientY: number) {
        const rect = renderer.domElement.getBoundingClientRect();
        const point = new THREE.Vector2(
          ((clientX - rect.left) / rect.width) * 2 - 1,
          -((clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(point, camera);
        return raycaster.intersectObjects(panels)[0]?.object as ThreeTypes.Mesh | undefined;
      }

      let drag: { x: number; start: number; moved: boolean } | null = null;

      const handlePointerDown = (event: PointerEvent) => {
        drag = { x: event.clientX, start: rotTarget, moved: false };
        container.setPointerCapture(event.pointerId);
      };
      const handlePointerMoveDrag = (event: PointerEvent) => {
        if (!drag) return;
        const dx = event.clientX - drag.x;
        if (Math.abs(dx) > 4) drag.moved = true;
        rotTarget = drag.start + dx * 0.008;
      };
      const handlePointerUp = (event: PointerEvent) => {
        if (!drag) return;
        const wasDrag = drag.moved;
        drag = null;
        const n = panels.length;
        if (!n) return;
        const step = (Math.PI * 2) / n;
        if (wasDrag) {
          const idx = Math.round(-rotTarget / step);
          rotTarget = -idx * step;
          focused = ((idx % n) + n) % n;
          return;
        }
        const hit = pick(event.clientX, event.clientY);
        if (!hit) return;
        const data = hit.userData as PanelUserData;
        if (data.index === focused) {
          navigateRef.current(`/board/${data.board.id}`);
        } else {
          focusPanel(data.index);
        }
      };
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!panels.length) return;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          focusPanel((focused + 1) % panels.length);
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          focusPanel((focused - 1 + panels.length) % panels.length);
        } else if (event.key === 'Enter') {
          const data = panels[focused].userData as PanelUserData;
          navigateRef.current(`/board/${data.board.id}`);
        }
      };

      container.addEventListener('pointerdown', handlePointerDown);
      container.addEventListener('pointermove', handlePointerMoveDrag);
      container.addEventListener('pointerup', handlePointerUp);
      container.addEventListener('keydown', handleKeyDown);
      cleanupFns.push(() => {
        container.removeEventListener('pointerdown', handlePointerDown);
        container.removeEventListener('pointermove', handlePointerMoveDrag);
        container.removeEventListener('pointerup', handlePointerUp);
        container.removeEventListener('keydown', handleKeyDown);
      });

      const resize = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.position.z = w < 600 ? 14 : 10.5;
        camera.updateProjectionMatrix();
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      const clock = new THREE.Clock();
      const tick = () => {
        const t = clock.getElapsedTime();
        carouselGroup.rotation.y += (rotTarget - carouselGroup.rotation.y) * 0.08;
        panels.forEach((p) => {
          const data = p.userData as PanelUserData;
          const isFront = data.index === focused;
          const s = isFront ? 1.12 : 0.92;
          p.scale.x += (s - p.scale.x) * 0.1;
          p.scale.y = p.scale.z = p.scale.x;
          p.position.y = Math.sin(t * 1.2 + data.phase) * 0.08 + (isFront ? 0.15 : 0);
        });
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
        panels.forEach((p) => disposePanel(p));
        panelGeo.dispose();
        floorGeo.dispose();
        floorMat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentElement === container) {
          container.removeChild(renderer.domElement);
        }
      });
    })();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      cleanupFns.forEach((fn) => fn());
      cleanupFns.length = 0;
    };
  }, [boards]);

  return (
    <div className="carousel-wrapper">
      <div
        ref={containerRef}
        className="carousel-stage"
        role="application"
        aria-label="Vista 3D de tableros"
        tabIndex={0}
      />
      <div className="carousel-hint">Arrastra para girar · clic para enfocar · clic de nuevo para abrir</div>
    </div>
  );
};
