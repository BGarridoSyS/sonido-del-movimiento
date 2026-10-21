/* Portada: la sección 13 del relator (recuerdo del 16-05-2026) gira y viaja hasta completar el relator. three.js, guiado por el scroll. */
import * as THREE from './three/three.module.min.js';
import { GLTFLoader } from './three/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/jsm/loaders/DRACOLoader.js';

const stage = document.getElementById('hero-stage'), cv = document.getElementById('hero-cv'), hero = document.getElementById('top');
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const ACC = () => getComputedStyle(document.documentElement).getPropertyValue('--l-acc').trim() || '#C2311C';
const META = { u: [0.11995503679701149, 0, -0.9927793255034211], v: [0.055188662530058115, 0.9984536770427761, 0.006668307724089645], n: [0.9912441680409377, -0.05559006026044399, 0.11976954756977762], W: 42.255, H: 16.959, hipo: [0.3071, 0.476], center: [6.1526, 70.9902, -43.7903] };
const CTR = new THREE.Vector3(9.6, 48, -40);                                   // centro del relator (cm)
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) };
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

let renderer, scene, camera, piece, pieceMesh, cara, relator, relMats = [], ready = false, raf = 0, vis = true, lastT = 0, prog = 0, idle = 0, fail = false;
const q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(), p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), pc = new THREE.Vector3();

function init() {
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }) }
  catch (e) { return bail() }
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); bail() });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(20, 1, 5, 6000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9389, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-180, 320, 260); scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff4e6, 0.9); fill.position.set(260, 120, -80); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.8); rim.position.set(40, 60, -420); scene.add(rim);
  const pla = () => new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.92, metalness: 0 });
  const dl = new DRACOLoader().setDecoderPath('g/three/draco/');
  const gl = new GLTFLoader().setDRACOLoader(dl);
  piece = new THREE.Group(); scene.add(piece);
  Promise.all([gl.loadAsync('g/relator_d.glb'), gl.loadAsync('g/sec13_cara_d.glb')]).then(([r, s]) => {
    relator = r.scene; relator.traverse(o => { if (o.isMesh) { if (o.name === 'S13') { o.visible = false; return } o.material = pla(); o.material.transparent = true; relMats.push(o.material) } }); scene.add(relator);
    const c = new THREE.Vector3(...META.center);
    s.scene.traverse(o => { if (!o.isMesh) return; o.position.sub(c); if (o.name === 'cara') { cara = o; o.material = caraMat(); o.renderOrder = 2 } else { pieceMesh = o; o.material = pla() } });
    piece.add(s.scene); p1.copy(c);
    poses(); ready = true; window.__heroOK = true; stage.classList.add('on'); kick();
  }).catch(e => { console.warn('hero3d', e); bail() });
  new ResizeObserver(size).observe(stage); size();
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) { lastT = 0; kick() } }).observe(stage);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}
function bail() { fail = true; window.__heroOK = false; stage.classList.add('fallback'); hero.classList.add('static') }

function caraMat() {
  const clef = clefTexture();
  return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    uniforms: { uHipo: { value: new THREE.Vector2(...META.hipo) }, uDim: { value: new THREE.Vector2(META.W, META.H) }, uPhase: { value: 0 }, uPulse: { value: 0 }, uInk: { value: new THREE.Color(ACC()) }, uClef: { value: clef }, uClefSize: { value: 6.2 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `precision highp float; varying vec2 vUv; uniform vec2 uHipo,uDim; uniform float uPhase,uPulse,uClefSize; uniform vec3 uInk; uniform sampler2D uClef;
      void main(){
        vec2 d=(vUv-uHipo)*uDim; float r=length(d);
        float sp=2.4; float k=r/sp-uPhase; float f=abs(fract(k)-0.5)*sp;        /* distancia a la onda más cercana, en cm */
        float w=fwidth(r)*1.2+0.09; float line=1.0-smoothstep(0.10,0.10+w,f);
        float fade=1.0-smoothstep(10.0,44.0,r); float ring=line*fade*(0.55+0.45*uPulse);
        float groove=ring*0.42;                                                    /* surco: oscurece */
        vec3 ink=uInk; float inkA=ring*0.75;
        vec2 cuv=(d/uClefSize)*vec2(1.0,1.0)+0.5; cuv.y=1.0-cuv.y; float clef=0.0;
        if(cuv.x>0.0&&cuv.x<1.0&&cuv.y>0.0&&cuv.y<1.0) clef=texture2D(uClef,cuv).a;
        float hole=smoothstep(uClefSize*0.55,uClefSize*0.75,r);                    /* sin ondas bajo la clave */
        vec3 col=mix(vec3(0.0),ink,0.85); float a=max(inkA*hole, clef*0.95);
        col=mix(vec3(0.12,0.1,0.1),ink,clamp(clef*2.0+0.3,0.0,1.0));
        gl_FragColor=vec4(col,a*0.92);
      }`});
}
function clefTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  const draw = () => { x.clearRect(0, 0, 512, 512); x.fillStyle = '#000'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '430px "Noto Music","Segoe UI Symbol","Apple Symbols",serif'; x.fillText('\u{1D11E}', 256, 266); if (cara && cara.material.uniforms) cara.material.uniforms.uClef.value.needsUpdate = true; kick() };
  draw(); const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  if (document.fonts) document.fonts.load('430px "Noto Music"').then(draw).catch(() => {});
  return t;
}

function size() {
  const r = stage.getBoundingClientRect(); const W = Math.max(1, r.width), H = Math.max(1, r.height);
  renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); poses(); kick();
}
/* poses: cámara fija al poniente y arriba; la pieza parte frente a la cámara y termina en su ranura */
function poses() {
  if (!camera) return;
  const asp = camera.aspect, vt = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const D = Math.max(325 / (2 * vt * Math.min(asp, 2.2)) * 1.08, 70 / (2 * vt) * 1.25);
  const dir = new THREE.Vector3(-0.17, 0.72, 0.92).normalize(), tgt = CTR.clone().add(new THREE.Vector3(0, D * vt * (asp < 0.9 ? 0.12 : 0.24), 0));
  camera.position.copy(tgt).addScaledVector(dir, D); camera.lookAt(tgt); camera.updateMatrixWorld();
  const f = new THREE.Vector3(); camera.getWorldDirection(f); const up = camera.up.clone(); const rt = new THREE.Vector3().crossVectors(f, up).normalize();
  const dist0 = Math.max(54 / (2 * vt), 48 / (2 * vt * asp)) * 1.04;                   // la pieza llena ~60 % de la altura
  p0.copy(camera.position).addScaledVector(f, dist0).addScaledVector(up, -dist0 * vt * (asp < 0.9 ? 0.05 : 0.16));
  const A = new THREE.Matrix4().makeBasis(new THREE.Vector3(...META.u), new THREE.Vector3(...META.v), new THREE.Vector3(...META.n));
  const B = new THREE.Matrix4().makeBasis(rt, up, f.clone().negate());
  const R = new THREE.Matrix4().multiplyMatrices(B, A.clone().transpose());
  q0.setFromRotationMatrix(R);
  const tilt = new THREE.Quaternion().setFromAxisAngle(up, THREE.MathUtils.degToRad(-28)).multiply(new THREE.Quaternion().setFromAxisAngle(rt, THREE.MathUtils.degToRad(8)));
  q0.premultiply(tilt); q1.identity();
  pc.lerpVectors(p0, p1, 0.45).addScaledVector(up, -16).addScaledVector(rt, 24);                                      // control del arco
}
function onScroll() {
  const r = hero.getBoundingClientRect(); const len = r.height - innerHeight;
  prog = len > 0 ? cl(-r.top / len) : 1; hero.style.setProperty('--p', prog.toFixed(4));
  hero.classList.toggle('p-end', prog > 0.82); hero.classList.toggle('p-mid', prog > 0.3 && prog <= 0.82);
  kick();
}
function kick() { if (!raf && ready && vis && !fail) raf = requestAnimationFrame(tick) }
function tick(ts) {
  raf = 0; const t = ts / 1000, dt = lastT ? Math.min(0.1, t - lastT) : 0.016; lastT = t;
  const p = RM.matches ? 1 : prog, e = sm(0.12, 0.86, p);
  // trayectoria: bezier cuadrática con arco, slerp de orientación
  const a = new THREE.Vector3().lerpVectors(p0, pc, e), b = new THREE.Vector3().lerpVectors(pc, p1, e);
  piece.position.lerpVectors(a, b, e);
  piece.quaternion.slerpQuaternions(q0, q1, sm(0.1, 0.8, p));
  if (p < 0.12 && !RM.matches) { idle += dt; const w = Math.sin(idle * 0.6) * 0.09; piece.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), w)) }
  const rel = sm(0.22, 0.6, p); relMats.forEach(m => { m.opacity = rel; m.visible = rel > 0.01 }); if (relator) relator.visible = rel > 0.01;
  if (cara) { const u = cara.material.uniforms; if (!RM.matches) u.uPhase.value = (u.uPhase.value + dt * 0.55) % 1; u.uPulse.value = 1 - sm(0.3, 0.85, p) * 0.8 }
  renderer.render(scene, camera);
  if (!RM.matches && p < 0.12 && vis) raf = requestAnimationFrame(tick);
}
if (!cv || !stage) { /* sin escenario */ } else if (!window.WebGLRenderingContext) bail(); else init();
