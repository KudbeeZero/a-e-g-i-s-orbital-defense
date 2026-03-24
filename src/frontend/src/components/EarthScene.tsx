import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ASSETS } from "../assets";
import { useGameStore } from "../store/gameStore";
import type { City, Missile, Threat } from "../store/gameStore";

interface AircraftState {
  orbitAngle: number;
  orbitHeight: number;
  orbitSpeed: number;
  orbitTimer: number;
  divingToCity: boolean;
}

function createEarthTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, size);
  oceanGrad.addColorStop(0, "#0a1a4e");
  oceanGrad.addColorStop(0.5, "#0d3a7a");
  oceanGrad.addColorStop(1, "#0a1a4e");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, size, size);

  const continents = [
    { x: 220, y: 260, rx: 100, ry: 80, rotate: -0.3, color: "#2d6e2a" },
    { x: 260, y: 320, rx: 70, ry: 50, rotate: 0.2, color: "#3a7830" },
    { x: 280, y: 440, rx: 50, ry: 90, rotate: 0.3, color: "#2d6e2a" },
    { x: 510, y: 235, rx: 55, ry: 40, rotate: -0.1, color: "#4a8a3a" },
    { x: 510, y: 380, rx: 65, ry: 100, rotate: 0.0, color: "#5a7a30" },
    { x: 680, y: 240, rx: 170, ry: 80, rotate: 0.05, color: "#4a8a3a" },
    { x: 720, y: 300, rx: 100, ry: 50, rotate: -0.1, color: "#3a7030" },
    { x: 760, y: 460, rx: 60, ry: 40, rotate: 0.15, color: "#7a7a30" },
    { x: 380, y: 170, rx: 45, ry: 35, rotate: 0.3, color: "#8aaa8a" },
  ];

  for (const { x, y, rx, ry, rotate, color } of continents) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(
        (Math.random() - 0.5) * rx * 1.2,
        (Math.random() - 0.5) * ry * 1.2,
        rx * 0.35 * Math.random() + 10,
        ry * 0.25 * Math.random() + 8,
        Math.random() * Math.PI,
        0,
        Math.PI * 2,
      );
      const r = Number.parseInt(color.slice(1, 3), 16);
      const g = Number.parseInt(color.slice(3, 5), 16);
      const b = Number.parseInt(color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
      ctx.fill();
    }
    ctx.restore();
  }

  const northPole = ctx.createRadialGradient(size / 2, 0, 0, size / 2, 0, 120);
  northPole.addColorStop(0, "rgba(220,235,255,0.95)");
  northPole.addColorStop(0.7, "rgba(180,210,255,0.5)");
  northPole.addColorStop(1, "rgba(180,210,255,0)");
  ctx.fillStyle = northPole;
  ctx.fillRect(0, 0, size, 130);

  const southPole = ctx.createRadialGradient(
    size / 2,
    size,
    0,
    size / 2,
    size,
    100,
  );
  southPole.addColorStop(0, "rgba(220,235,255,0.95)");
  southPole.addColorStop(0.7, "rgba(180,210,255,0.5)");
  southPole.addColorStop(1, "rgba(180,210,255,0)");
  ctx.fillStyle = southPole;
  ctx.fillRect(0, size - 110, size, 110);

  return new THREE.CanvasTexture(canvas);
}

function createNightTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Deep dark base — space-lit Earth at night
  ctx.fillStyle = "#010308";
  ctx.fillRect(0, 0, size, size);

  // City light clusters mapped to approximate continent positions
  const clusters = [
    { x: 220, y: 255, rx: 90, ry: 45, count: 80, bright: 0.85 },  // North America East
    { x: 178, y: 258, rx: 60, ry: 35, count: 55, bright: 0.65 },  // North America West
    { x: 510, y: 230, rx: 80, ry: 38, count: 90, bright: 0.90 },  // Western Europe
    { x: 565, y: 255, rx: 45, ry: 30, count: 40, bright: 0.60 },  // Middle East
    { x: 690, y: 240, rx: 90, ry: 50, count: 95, bright: 0.95 },  // East Asia
    { x: 640, y: 295, rx: 55, ry: 35, count: 50, bright: 0.55 },  // South Asia
    { x: 315, y: 435, rx: 45, ry: 60, count: 35, bright: 0.40 },  // South America
    { x: 530, y: 360, rx: 40, ry: 55, count: 25, bright: 0.30 },  // Sub-Saharan Africa
    { x: 760, y: 455, rx: 50, ry: 30, count: 45, bright: 0.55 },  // Australia
    { x: 385, y: 165, rx: 40, ry: 28, count: 30, bright: 0.50 },  // Greenland/Canada
  ];

  for (const cl of clusters) {
    for (let i = 0; i < cl.count; i++) {
      // Distribute within ellipse
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random());
      const lx = cl.x + Math.cos(angle) * dist * cl.rx;
      const ly = cl.y + Math.sin(angle) * dist * cl.ry;
      const r = 1.5 + Math.random() * 2.5;
      const alpha = cl.bright * (0.5 + Math.random() * 0.5);
      const warmth = Math.random();
      const cr = Math.floor(240 + warmth * 15);
      const cg = Math.floor(200 + warmth * 20);
      const cb = Math.floor(100 + warmth * 80);
      const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * 3.5);
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
      grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lx, ly, r * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return new THREE.CanvasTexture(canvas);
}

function latLonToLocal(lat: number, lon: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -2 * Math.sin(phi) * Math.cos(theta),
    2 * Math.cos(phi),
    2 * Math.sin(phi) * Math.sin(theta),
  );
}

function cityWorldPos(
  lat: number,
  lon: number,
  earthRotY: number,
): THREE.Vector3 {
  const local = latLonToLocal(lat, lon);
  const cos = Math.cos(earthRotY);
  const sin = Math.sin(earthRotY);
  return new THREE.Vector3(
    local.x * cos - local.z * sin,
    local.y,
    local.x * sin + local.z * cos,
  );
}

function CityMesh({ city, missileCount }: { city: City; missileCount: number }) {
  const lightRefs = useRef<(THREE.Mesh | null)[]>([]);
  const siloRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const domeRef = useRef<THREE.Mesh>(null);
  const domeRingRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef(0);
  const flashRef2 = useRef(0); // flash timer (seconds remaining)
  const prevMissileCount = useRef(missileCount);
  const pos = latLonToLocal(city.lat, city.lon);
  const normal = pos.clone().normalize();
  const surfacePos = normal.clone().multiplyScalar(2.03);
  const siloTip = normal.clone().multiplyScalar(2.1);

  // Silo orientation: align cylinder along the surface normal
  const siloQuaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    return q;
  }, [normal]);

  const lightPositions = useMemo(() => {
    const result: THREE.Vector3[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spread = 0.04;
      const right = new THREE.Vector3(1, 0, 0);
      if (Math.abs(normal.dot(right)) > 0.9) right.set(0, 1, 0);
      const tangent = normal
        .clone()
        .cross(right)
        .normalize()
        .multiplyScalar(spread);
      const bitangent = normal
        .clone()
        .cross(tangent)
        .normalize()
        .multiplyScalar(spread);
      result.push(
        surfacePos.clone().add(
          tangent
            .clone()
            .multiplyScalar(Math.cos(angle) * 0.6)
            .add(bitangent.clone().multiplyScalar(Math.sin(angle) * 0.6)),
        ),
      );
    }
    return result;
  }, [normal, surfacePos]);

  useFrame((_state, delta) => {
    pulseRef.current += 0.04;
    const brightness = 0.7 + Math.sin(pulseRef.current) * 0.3;
    for (const m of lightRefs.current) {
      if (!m) continue;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = brightness;
    }

    // Animate shield dome pulse
    if (domeRef.current) {
      const baseDomeOpacity = city.shields > 0 ? 0.18 : 0.05;
      const mat = domeRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = baseDomeOpacity + Math.sin(pulseRef.current * 0.7) * 0.03;
    }
    if (domeRingRef.current) {
      const baseRingOpacity = city.shields > 0 ? 0.55 : 0.12;
      const mat = domeRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = baseRingOpacity + Math.sin(pulseRef.current * 0.9) * 0.08;
    }

    // Detect new missile fired → trigger launch flash
    if (missileCount > prevMissileCount.current) {
      flashRef2.current = 0.35;
    }
    prevMissileCount.current = missileCount;

    // Animate launch flash
    if (flashRef.current) {
      const mat = flashRef.current.material as THREE.MeshBasicMaterial;
      if (flashRef2.current > 0) {
        flashRef2.current = Math.max(0, flashRef2.current - delta);
        const t = flashRef2.current / 0.35;
        mat.opacity = t * 0.9;
        const scale = 1.0 + (1 - t) * 1.5;
        flashRef.current.scale.setScalar(scale);
      } else {
        mat.opacity = 0;
      }
    }
  });

  if (city.isDestroyed) {
    return (
      <mesh position={surfacePos}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#1a0800" transparent opacity={0.85} />
      </mesh>
    );
  }

  return (
    <group>
      {/* City glow sphere */}
      <mesh position={surfacePos}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Launch silo tube */}
      <mesh
        ref={siloRef}
        position={surfacePos}
        quaternion={siloQuaternion}
      >
        <cylinderGeometry args={[0.012, 0.018, 0.09, 6]} />
        <meshBasicMaterial color="#00aaff" transparent opacity={0.75} />
      </mesh>

      {/* Launch flash — sphere at silo tip that pulses when firing */}
      <mesh ref={flashRef} position={siloTip}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* City lights */}
      {lightPositions.map((lp, i) => (
        <mesh
          key={`${city.id}_l${i}`}
          ref={(el) => {
            lightRefs.current[i] = el;
          }}
          position={lp}
        >
          <sphereGeometry args={[0.018, 4, 4]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#ffffa0" : "#ffcc44"}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Shield dome — oval translucent blue energy field */}
      <mesh
        ref={domeRef}
        position={surfacePos}
        quaternion={siloQuaternion}
        scale={[1, 0.65, 1]}
      >
        <sphereGeometry args={[0.28, 24, 16]} />
        <meshBasicMaterial
          color="#0088ff"
          transparent
          opacity={city.shields > 0 ? 0.18 : 0.05}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Dome equator ring glow */}
      <mesh ref={domeRingRef} position={surfacePos} quaternion={siloQuaternion}>
        <torusGeometry args={[0.28, 0.008, 8, 40]} />
        <meshBasicMaterial
          color="#33aaff"
          transparent
          opacity={city.shields > 0 ? 0.55 : 0.12}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

interface TrailPoint {
  id: number;
  pos: THREE.Vector3;
}

function SmokeTrail({
  points,
  color,
}: { points: TrailPoint[]; color: string }) {
  if (points.length === 0) return null;
  return (
    <group>
      {points.map(({ id, pos }, i) => {
        const t = i / Math.max(points.length - 1, 1);
        const opacity = t * 0.55;
        const scale = 0.025 + (1 - t) * 0.02;
        return (
          <mesh key={id} position={pos}>
            <sphereGeometry args={[scale, 4, 4]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

const ATMOSPHERE_VERT = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const ATMOSPHERE_FRAG = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform vec3 uCameraPos;
  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
    vec3 innerColor = vec3(0.15, 0.55, 1.0);
    vec3 outerColor = vec3(0.05, 0.25, 0.8);
    vec3 color = mix(innerColor, outerColor, fresnel);
    float intensity = fresnel * 0.85;
    gl_FragColor = vec4(color * intensity, intensity);
  }
`;

function AtmosphereShader({ radius }: { radius: number }) {
  const { camera } = useThree();

  const atmosphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ATMOSPHERE_VERT,
        fragmentShader: ATMOSPHERE_FRAG,
        uniforms: {
          uCameraPos: { value: new THREE.Vector3() },
        },
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      }),
    [],
  );

  useFrame(() => {
    atmosphereMat.uniforms.uCameraPos.value.copy(camera.position);
  });

  return (
    <mesh>
      <sphereGeometry args={[radius * 1.15, 128, 128]} />
      <primitive object={atmosphereMat} attach="material" />
    </mesh>
  );
}

function ThreatMeshInner({ threat }: { threat: Threat }) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const rotationRef = useRef(0);
  const trailRef = useRef<TrailPoint[]>([]);
  const trailIdCounter = useRef(0);
  const targetLockId = useGameStore((s) => s.targetLockId);
  const isLocked = targetLockId === threat.id;
  const enemyTexture = useLoader(THREE.TextureLoader, ASSETS.missileEnemy);

  useFrame(() => {
    if (!spriteRef.current) return;
    const [tx, ty, tz] = threat.position;
    spriteRef.current.position.set(tx, ty, tz);
    rotationRef.current += 0.04;

    // Enemy smoke trail — red/orange exhaust
    trailRef.current.push({
      id: trailIdCounter.current++,
      pos: new THREE.Vector3(tx, ty, tz),
    });
    if (trailRef.current.length > 24) trailRef.current.shift();
  });

  const isIcbm = threat.type === "icbm";
  const isAircraft = threat.type === "aircraft";

  const color =
    threat.type === "armored"
      ? "#ff8800"
      : threat.type === "icbm"
        ? "#ffcc00"
        : threat.type === "aircraft"
          ? "#00ff66"
          : threat.type === "missile"
            ? "#ff4400"
            : "#ff2200";

  const trailColor = isIcbm ? "#ff8800" : isAircraft ? "#00cc44" : "#ff5500";
  const spriteScale: [number, number, number] = isIcbm
    ? [0.35, 0.12, 1]
    : isAircraft
      ? [0.45, 0.18, 1]
      : [0.3, 0.15, 1];

  const BRACKET_KEYS = ["n", "e", "s", "w"] as const;

  return (
    <group>
      {isIcbm && (
        <pointLight
          position={[threat.position[0], threat.position[1], threat.position[2]]}
          color="#ff6600"
          intensity={1.5}
          distance={1.2}
          decay={2}
        />
      )}
      {isAircraft && (
        <pointLight
          position={[threat.position[0], threat.position[1], threat.position[2]]}
          color="#00ff44"
          intensity={1.2}
          distance={1.0}
          decay={2}
        />
      )}
      <SmokeTrail points={trailRef.current} color={trailColor} />
      <sprite ref={spriteRef} scale={spriteScale} renderOrder={10}>
        <spriteMaterial map={enemyTexture} color={color} depthTest />
      </sprite>
      {isLocked && (
        <mesh
          position={[
            threat.position[0],
            threat.position[1],
            threat.position[2],
          ]}
        >
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshBasicMaterial
            color="#00e5ff"
            wireframe
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
      {isLocked &&
        BRACKET_KEYS.map((corner, i) => (
          <mesh
            key={corner}
            position={[
              threat.position[0] +
                Math.cos(rotationRef.current + (i * Math.PI) / 2) * 0.26,
              threat.position[1] +
                Math.sin(rotationRef.current + (i * Math.PI) / 2) * 0.26,
              threat.position[2],
            ]}
          >
            <boxGeometry args={[0.035, 0.035, 0.035]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.9} />
          </mesh>
        ))}
    </group>
  );
}

function ThreatMesh({ threat }: { threat: Threat }) {
  return (
    <Suspense
      fallback={
        <mesh position={threat.position}>
          <icosahedronGeometry args={[0.12, 0]} />
          <meshPhongMaterial
            color="#ff4400"
            emissive="#ff4400"
            emissiveIntensity={0.4}
          />
        </mesh>
      }
    >
      <ThreatMeshInner threat={threat} />
    </Suspense>
  );
}

function MissileMeshInner({
  missile,
  onHit,
}: {
  missile: Missile;
  onHit: (id: string, pos: [number, number, number]) => void;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const progressRef = useRef(0);
  const velocityRef = useRef(new THREE.Vector3());
  const positionRef = useRef(new THREE.Vector3(...missile.startPos));
  const trailRef = useRef<TrailPoint[]>([]);
  const trailIdCounter = useRef(0);
  const removeMissile = useGameStore((s) => s.removeMissile);
  const threats = useGameStore((s) => s.threats);
  const timeScale = useGameStore((s) => s.timeScale);
  const missileUpgrades = useGameStore((s) => s.upgrades);
  const trailBlazerCount = missileUpgrades.filter((u) => u === "trail-blazer").length;
  const trackBoost = 1.1 ** trailBlazerCount;
  const missilePaused = useGameStore((s) => s.paused);
  const playerTexture = useLoader(THREE.TextureLoader, ASSETS.missilePlayer);

  const startPos = missile.startPos;
  const targetPos = missile.targetPos;

  const curve = useMemo(() => {
    const start = new THREE.Vector3(...startPos);
    const target = new THREE.Vector3(...targetPos);
    const mid = new THREE.Vector3(
      (start.x + target.x) / 2 + (Math.random() - 0.5) * 2,
      (start.y + target.y) / 2 + 1.5,
      (start.z + target.z) / 2 + (Math.random() - 0.5) * 2,
    );
    return new THREE.QuadraticBezierCurve3(start, mid, target);
  }, [startPos, targetPos]);

  const targetVec = useMemo(() => new THREE.Vector3(...targetPos), [targetPos]);
  const isHeatSeeker = missile.weaponType === "heat-seeker";
  const speed = (missile.weaponType === "kinetic" ? 0.025 : 0.018) * trackBoost;
  const velInitialized = useRef(false);

  useFrame((_state, delta) => {
    if (!spriteRef.current) return;
    if (missilePaused) return;
    const scaledDelta = delta * timeScale;

    let currentPos: THREE.Vector3;

    if (isHeatSeeker) {
      if (!velInitialized.current) {
        const dir = new THREE.Vector3(...targetPos)
          .sub(positionRef.current)
          .normalize();
        velocityRef.current.copy(dir.multiplyScalar(0.06 * trackBoost));
        velInitialized.current = true;
      }

      const currentThreat = threats.find((t) => t.id === missile.targetId);
      const liveTarget = currentThreat
        ? new THREE.Vector3(...currentThreat.position)
        : new THREE.Vector3(...targetPos);

      const missileSpeed = 0.06 * trackBoost;
      const desired = liveTarget
        .clone()
        .sub(positionRef.current)
        .normalize()
        .multiplyScalar(missileSpeed);
      velocityRef.current.lerp(desired, 0.04 * trackBoost);
      velocityRef.current.normalize().multiplyScalar(missileSpeed * scaledDelta * 60);
      positionRef.current.add(velocityRef.current);
      currentPos = positionRef.current.clone();
    } else {
      progressRef.current = Math.min(
        progressRef.current + speed * scaledDelta * 60,
        1,
      );
      currentPos = curve.getPoint(progressRef.current);
      positionRef.current.copy(currentPos);
    }

    spriteRef.current.position.copy(currentPos);

    // Player missile trail
    trailRef.current.push({
      id: trailIdCounter.current++,
      pos: currentPos.clone(),
    });
    if (trailRef.current.length > 32) trailRef.current.shift();

    const liveThreat = threats.find((t) => t.id === missile.targetId);
    const distToTarget = currentPos.distanceTo(
      liveThreat ? new THREE.Vector3(...liveThreat.position) : targetVec,
    );

    const doneByProgress = !isHeatSeeker && progressRef.current >= 0.95;
    const doneByDist = distToTarget < 0.3;

    if (doneByProgress || doneByDist) {
      onHit(missile.id, [currentPos.x, currentPos.y, currentPos.z]);
      removeMissile(missile.id);
    }
  });

  const missileColor =
    missile.weaponType === "cluster"
      ? "#ffaa00"
      : missile.weaponType === "prox-burst"
        ? "#aa44ff"
        : missile.weaponType === "kinetic"
          ? "#ffffff"
          : "#00e5ff";

  const trailColor = isHeatSeeker ? "#44aaff" : "#aaaaaa";

  return (
    <group>
      <SmokeTrail points={trailRef.current} color={trailColor} />
      <sprite ref={spriteRef} scale={[0.2, 0.08, 1]}>
        <spriteMaterial map={playerTexture} color={missileColor} />
      </sprite>
    </group>
  );
}

function MissileMesh({
  missile,
  onHit,
}: {
  missile: Missile;
  onHit: (id: string, pos: [number, number, number]) => void;
}) {
  return (
    <Suspense
      fallback={
        <mesh position={missile.startPos}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshBasicMaterial color="#00e5ff" />
        </mesh>
      }
    >
      <MissileMeshInner missile={missile} onHit={onHit} />
    </Suspense>
  );
}

function ExplosionFX({
  explosion,
}: {
  explosion: {
    id: string;
    position: [number, number, number];
    startTime: number;
    color: string;
  };
}) {
  const firebAllRef = useRef<THREE.Mesh>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const shockwave2Ref = useRef<THREE.Mesh>(null);
  const smokeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const debrisRef = useRef<THREE.Points>(null);
  const removeExplosion = useGameStore((s) => s.removeExplosion);
  const startTime = useRef(Date.now());

  const isCombo = explosion.color === "#ffaa00";
  const isNearMiss = explosion.color === "#aa44ff";

  const SMOKE_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"] as const;

  const smokeOffsets = useMemo(() => {
    const seed = explosion.id.length * 13;
    return Array.from({ length: 8 }, (_, i) => {
      const angle = ((i + seed) / 8) * Math.PI * 2;
      const dist = 0.15 + ((i * 7 + seed) % 10) * 0.03;
      return new THREE.Vector3(
        Math.cos(angle) * dist,
        Math.sin(angle) * dist * 0.6,
        ((i % 3) - 1) * 0.1,
      );
    });
  }, [explosion.id]);

  const debrisPositions = useMemo(() => {
    const arr = new Float32Array(12 * 3);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 0.05 + (i % 4) * 0.04;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = ((i % 3) - 1) * 0.05;
    }
    return arr;
  }, []);

  const maxFireballScale = isCombo ? 1.2 : isNearMiss ? 0.5 : 0.8;
  const maxShockwaveRadius = isCombo ? 2.5 : isNearMiss ? 1.2 : 1.8;

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;

    if (firebAllRef.current) {
      const p = Math.min(elapsed / 0.6, 1);
      const scale = 0.1 + p * maxFireballScale;
      firebAllRef.current.scale.setScalar(scale);
      const mat = firebAllRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - p * 1.2);
      if (isCombo) {
        const g = 0.6 + p * 0.2;
        mat.color.setRGB(1, g, 0);
      } else if (isNearMiss) {
        mat.color.setRGB(0.67, 0.27, 1.0);
      } else {
        const g = 0.4 + p * 0.27;
        mat.color.setRGB(1, g, 0);
      }
    }

    if (shockwaveRef.current) {
      const p = Math.min(elapsed / 0.8, 1);
      const radius = 0.2 + p * maxShockwaveRadius;
      shockwaveRef.current.scale.setScalar(radius);
      const mat = shockwaveRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - p * 1.1);
      if (isCombo) mat.color.setRGB(1, 0.8, 0);
      else if (isNearMiss) mat.color.setRGB(0.67, 0.27, 1.0);
    }

    if (shockwave2Ref.current && isCombo) {
      const p = Math.min(elapsed / 1.0, 1);
      const radius = 0.1 + p * 3.5;
      shockwave2Ref.current.scale.setScalar(radius);
      const mat = shockwave2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.6 * (1 - p));
    }

    for (let i = 0; i < smokeRefs.current.length; i++) {
      const m = smokeRefs.current[i];
      if (!m) continue;
      const p = Math.min(elapsed / 1.2, 1);
      const drift = p * 0.4;
      m.position.set(
        explosion.position[0] + smokeOffsets[i].x * (1 + drift),
        explosion.position[1] + smokeOffsets[i].y * (1 + drift),
        explosion.position[2] + smokeOffsets[i].z,
      );
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.6 * (1 - p));
    }

    if (debrisRef.current) {
      const p = Math.min(elapsed / 0.9, 1);
      debrisRef.current.scale.setScalar(1 + p * (isCombo ? 5 : 3));
      const mat = debrisRef.current.material as THREE.PointsMaterial;
      mat.opacity = Math.max(0, 1 - p * 1.1);
    }

    if (elapsed >= 1.2) removeExplosion(explosion.id);
  });

  const pos = explosion.position;
  const shockwaveColor = isCombo
    ? "#ffcc00"
    : isNearMiss
      ? "#aa44ff"
      : "#ff8800";
  const debrisColor = isCombo ? "#ffdd44" : isNearMiss ? "#cc88ff" : "#ffaa44";

  return (
    <group>
      <mesh ref={firebAllRef} position={pos}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshBasicMaterial color="#ff6600" transparent opacity={1} />
      </mesh>

      <mesh ref={shockwaveRef} position={pos}>
        <torusGeometry args={[0.3, 0.04, 8, 24]} />
        <meshBasicMaterial
          color={shockwaveColor}
          transparent
          opacity={1}
          depthWrite={false}
        />
      </mesh>

      {isCombo && (
        <mesh ref={shockwave2Ref} position={pos}>
          <torusGeometry args={[0.3, 0.025, 8, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      )}

      {!isNearMiss &&
        smokeOffsets.map((offset, i) => (
          <mesh
            key={SMOKE_KEYS[i]}
            ref={(el) => {
              smokeRefs.current[i] = el;
            }}
            position={[pos[0] + offset.x, pos[1] + offset.y, pos[2] + offset.z]}
          >
            <sphereGeometry args={[isCombo ? 0.09 : 0.06, 5, 5]} />
            <meshBasicMaterial
              color={isCombo ? "#886644" : "#666666"}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
        ))}

      <points ref={debrisRef} position={pos}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[debrisPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={debrisColor}
          size={isCombo ? 0.09 : 0.06}
          sizeAttenuation
          transparent
          opacity={1}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function EarthScene({
  onThreatClick: _onThreatClick,
}: { onThreatClick: (threatId: string) => void }) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cineTimeRef = useRef(0);
  const shakeVecRef = useRef(new THREE.Vector3());
  const { camera } = useThree();

  const threats = useGameStore((s) => s.threats);
  const missiles = useGameStore((s) => s.missiles);
  const explosions = useGameStore((s) => s.explosions);
  const cities = useGameStore((s) => s.cities);
  const addExplosion = useGameStore((s) => s.addExplosion);
  const removeThreat = useGameStore((s) => s.removeThreat);
  const takeDamage = useGameStore((s) => s.takeDamage);
  const addScore = useGameStore((s) => s.addScore);
  const incrementDestroyed = useGameStore((s) => s.incrementDestroyed);
  const cameraShake = useGameStore((s) => s.cameraShake);
  const setCameraShake = useGameStore((s) => s.setCameraShake);
  const destroyCity = useGameStore((s) => s.destroyCity);
  const damageCity = useGameStore((s) => s.damageCity);
  const timeScale = useGameStore((s) => s.timeScale);
  const slowMoActive = useGameStore((s) => s.slowMoActive);
  const setTimeScale = useGameStore((s) => s.setTimeScale);
  const setSlowMo = useGameStore((s) => s.setSlowMo);
  const combo = useGameStore((s) => s.combo);
  const lastKillTime = useGameStore((s) => s.lastKillTime);
  const incrementCombo = useGameStore((s) => s.incrementCombo);
  const resetCombo = useGameStore((s) => s.resetCombo);
  const addNearMiss = useGameStore((s) => s.addNearMiss);
  const upgrades = useGameStore((s) => s.upgrades);
  const paused = useGameStore((s) => s.paused);
  const damageThreat = useGameStore((s) => s.damageThreat);

  const earthTexture = useMemo(() => createEarthTexture(), []);
  const nightTexture = useMemo(() => createNightTexture(), []);
  const slowMoTriggeredThreats = useRef(new Set<string>());
  const slowMoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nearMissedThreats = useRef(new Set<string>());
  const aircraftStateRef = useRef(new Map<string, AircraftState>());
  const wave = useGameStore((s) => s.wave);
  const prevWaveRef = useRef(wave);

  const comboRef = useRef(combo);
  comboRef.current = combo;
  const lastKillTimeRef = useRef(lastKillTime);
  lastKillTimeRef.current = lastKillTime;

  // Clear per-wave tracking Sets whenever a new wave starts
  useEffect(() => {
    if (wave !== prevWaveRef.current) {
      prevWaveRef.current = wave;
      slowMoTriggeredThreats.current.clear();
      nearMissedThreats.current.clear();
    }
  }, [wave]);

  useFrame((_state, delta) => {
    // --- Cinematic camera (always runs, even when paused) ---
    cineTimeRef.current += delta;
    const t = cineTimeRef.current;
    const baseCamX = Math.sin(t * 0.1) * 0.5;
    const baseCamY = 2 + Math.sin(t * 0.07) * 0.2;
    const baseCamZ = 8 + Math.sin(t * 0.05) * 0.3;

    const currentHull = useGameStore.getState().hull;
    if (cameraShake > 0 && currentHull > 0) {
      const shakeAmount = cameraShake * 0.05;
      shakeVecRef.current.x = (Math.random() - 0.5) * shakeAmount;
      shakeVecRef.current.y = (Math.random() - 0.5) * shakeAmount;
      setCameraShake(Math.max(0, cameraShake - 0.15));
    } else {
      shakeVecRef.current.x *= 0.9;
      shakeVecRef.current.y *= 0.9;
    }
    camera.position.x = baseCamX + shakeVecRef.current.x;
    camera.position.y = baseCamY + shakeVecRef.current.y;
    camera.position.z = baseCamZ;
    camera.lookAt(0, 0, 0);

    if (paused) return;
    const scaledDelta = delta * timeScale;

    if (earthGroupRef.current)
      earthGroupRef.current.rotation.y += 0.0004 * scaledDelta * 60;
    if (cloudsRef.current)
      cloudsRef.current.rotation.y += 0.0007 * scaledDelta * 60;

    if (lastKillTimeRef.current > 0 && comboRef.current > 0) {
      if (Date.now() - lastKillTimeRef.current > 3000) {
        resetCombo();
      }
    }

    const earthRotY = earthGroupRef.current?.rotation.y ?? 0;
    const playerPos = new THREE.Vector3(0, 0, 4);

    for (const threat of threats) {
      const pos = new THREE.Vector3(...threat.position);

      // Aircraft: orbit Earth first, then dive
      if (threat.type === "aircraft") {
        let aState = aircraftStateRef.current.get(threat.id);
        if (!aState) {
          aState = {
            orbitAngle: Math.atan2(pos.z, pos.x),
            orbitHeight: pos.y,
            orbitSpeed: 0.4 + Math.random() * 0.3,
            orbitTimer: 4 + Math.random() * 4,
            divingToCity: false,
          };
          aircraftStateRef.current.set(threat.id, aState);
        }

        if (!aState.divingToCity) {
          aState.orbitTimer -= scaledDelta;
          aState.orbitAngle += aState.orbitSpeed * scaledDelta;
          const r = 3.2;
          pos.set(
            Math.cos(aState.orbitAngle) * r,
            aState.orbitHeight,
            Math.sin(aState.orbitAngle) * r,
          );
          if (aState.orbitTimer <= 0) aState.divingToCity = true;
        } else {
          // Dive toward target city using standard navigation
          let targetPoint = new THREE.Vector3(0, 0, 0);
          if (threat.targetCityId) {
            const tCity = cities.find((c) => c.id === threat.targetCityId);
            if (tCity && !tCity.isDestroyed) {
              targetPoint = cityWorldPos(tCity.lat, tCity.lon, earthRotY);
            } else {
              let nearest: City | undefined;
              let nearestDist = Number.POSITIVE_INFINITY;
              for (const c of cities) {
                if (c.isDestroyed) continue;
                const cwp = cityWorldPos(c.lat, c.lon, earthRotY);
                const d = pos.distanceTo(cwp);
                if (d < nearestDist) { nearestDist = d; nearest = c; }
              }
              if (nearest) targetPoint = cityWorldPos(nearest.lat, nearest.lon, earthRotY);
            }
          }
          const toTarget = targetPoint.clone().sub(pos).normalize();
          pos.addScaledVector(toTarget, threat.speed * scaledDelta);
        }

        threat.position[0] = pos.x;
        threat.position[1] = pos.y;
        threat.position[2] = pos.z;
      } else {
      // Find target: if the assigned city is destroyed, retarget nearest living city
      let targetPoint = new THREE.Vector3(0, 0, 0);
      if (threat.targetCityId) {
        const tCity = cities.find((c) => c.id === threat.targetCityId);
        if (tCity && !tCity.isDestroyed) {
          targetPoint = cityWorldPos(tCity.lat, tCity.lon, earthRotY);
        } else {
          // Assigned city destroyed — find nearest surviving city
          let nearest: City | undefined;
          let nearestDist = Number.POSITIVE_INFINITY;
          for (const c of cities) {
            if (c.isDestroyed) continue;
            const cwp = cityWorldPos(c.lat, c.lon, earthRotY);
            const d = pos.distanceTo(cwp);
            if (d < nearestDist) { nearestDist = d; nearest = c; }
          }
          if (nearest) targetPoint = cityWorldPos(nearest.lat, nearest.lon, earthRotY);
        }
      }
      const toTarget = targetPoint.clone().sub(pos).normalize();
      pos.addScaledVector(toTarget, threat.speed * scaledDelta);
      threat.position[0] = pos.x;
      threat.position[1] = pos.y;
      threat.position[2] = pos.z;
      }

      const distToPlayer = pos.distanceTo(playerPos);
      if (distToPlayer < 0.7 && !nearMissedThreats.current.has(threat.id)) {
        nearMissedThreats.current.add(threat.id);
        addNearMiss();
        addExplosion({
          id: `nm_${Date.now()}_${Math.random()}`,
          position: [pos.x, pos.y, pos.z],
          startTime: Date.now(),
          color: "#aa44ff",
        });
      }

      if (!slowMoActive && !slowMoTriggeredThreats.current.has(threat.id)) {
        for (const city of cities) {
          if (city.isDestroyed) continue;
          const cwp = cityWorldPos(city.lat, city.lon, earthRotY);
          if (pos.distanceTo(cwp) < 0.9) {
            slowMoTriggeredThreats.current.add(threat.id);
            setTimeScale(0.15);
            setSlowMo(true);
            if (slowMoTimeoutRef.current)
              clearTimeout(slowMoTimeoutRef.current);
            slowMoTimeoutRef.current = setTimeout(() => {
              setTimeScale(1.0);
              setSlowMo(false);
            }, 2200);
            break;
          }
        }
      }

      if (pos.length() < 2.3) {
        let hitCity = false;
        for (const city of cities) {
          if (city.isDestroyed) continue;
          const cwp = cityWorldPos(city.lat, city.lon, earthRotY);
          if (pos.distanceTo(cwp) < 0.6) {
            damageCity(city.id);
            setCameraShake(10);
            addExplosion({
              id: `city_exp_${Date.now()}_${Math.random()}`,
              position: [pos.x, pos.y, pos.z],
              startTime: Date.now(),
              color: "#ff4400",
            });
            hitCity = true;
            break;
          }
        }
        if (!hitCity) takeDamage(10, 5);
        aircraftStateRef.current.delete(threat.id);
        removeThreat(threat.id);
      }
    }
  });

  const handleMissileHit = (
    _missileId: string,
    pos: [number, number, number],
  ) => {
    const hitPos = new THREE.Vector3(...pos);
    let hit = false;
    const currentCombo = comboRef.current;
    const multiplier = Math.min(5, 1 + currentCombo * 0.5);

    const hitRadius = upgrades.includes("bigger-bang") ? 0.75 : 0.5;
    for (const t of threats) {
      const tp = new THREE.Vector3(...t.position);
      if (tp.distanceTo(hitPos) < hitRadius) {
        if (t.type === "aircraft" && t.hp > 1) {
          // Aircraft requires 2 hits — damage but don't remove yet
          damageThreat(t.id);
          addExplosion({
            id: `exp_${Date.now()}_${Math.random()}`,
            position: [tp.x, tp.y, tp.z],
            startTime: Date.now(),
            color: "#00ff44",
          });
          hit = true;
        } else {
          aircraftStateRef.current.delete(t.id);
          removeThreat(t.id);
          const scoreAward = t.type === "aircraft" ? 200 : 100;
          addScore(Math.round(scoreAward * multiplier));
          incrementDestroyed();
          incrementCombo();
          hit = true;
        }
      }
    }

    if (hit) setCameraShake(currentCombo >= 3 ? 8 : 5);

    const expColor =
      hit && currentCombo >= 3 ? "#ffaa00" : hit ? "#ff8800" : "#00e5ff";
    addExplosion({
      id: `exp_${Date.now()}_${Math.random()}`,
      position: pos,
      startTime: Date.now(),
      color: expColor,
    });
  };

  const starPositions = useMemo(() => {
    const arr = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const r = 38 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const brightStarPositions = useMemo(() => {
    const arr = new Float32Array(250 * 3);
    for (let i = 0; i < 250; i++) {
      const r = 40 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <>
      {/* Background starfield — dim layer */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#cce0ff"
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.75}
        />
      </points>

      {/* Bright accent stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[brightStarPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.13}
          sizeAttenuation
          transparent
          opacity={0.9}
        />
      </points>

      {/* Sun — primary directional light */}
      <directionalLight position={[5, 3, 5]} intensity={1.6} color="#ffffff" />
      {/* Ambient — deep space fill */}
      <ambientLight color="#404060" intensity={0.5} />
      {/* Rim light — cool back-scatter */}
      <directionalLight position={[-5, -2, -5]} intensity={0.6} color="#66ccff" />

      <group ref={earthGroupRef}>
        <mesh renderOrder={1}>
          <sphereGeometry args={[2, 128, 128]} />
          <meshStandardMaterial
            map={earthTexture}
            emissiveMap={nightTexture}
            emissive="#ffffff"
            emissiveIntensity={1.0}
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>
        {cities.map((city) => (
          <CityMesh key={city.id} city={city} missileCount={missiles.length} />
        ))}
      </group>

      {/* Cinematic Fresnel atmosphere */}
      <AtmosphereShader radius={2} />

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial
          color="white"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      {threats.map((threat) => (
        <ThreatMesh key={threat.id} threat={threat} />
      ))}

      {missiles.map((missile) => (
        <MissileMesh
          key={missile.id}
          missile={missile}
          onHit={handleMissileHit}
        />
      ))}

      {explosions.map((exp) => (
        <ExplosionFX key={exp.id} explosion={exp} />
      ))}
    </>
  );
}
