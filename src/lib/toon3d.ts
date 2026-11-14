/**
 * Uma in 3D: one figure, shared by the hero and the kick buddy.
 *
 * Built in code, so there is nothing extra to download, but aiming for a
 * believable figure rather than a cartoon:
 *
 * - Real proportions: about 7.5 heads tall, a sculpted skull (brow ridge,
 *   eye sockets, cheekbones, jaw and chin), shoulders wider than the head.
 * - Physically based materials: fabric with sheen and a woven bump, skin with
 *   a warm sheen and pores, wet eyes with a painted iris and a clear coat,
 *   hair and stubble as alpha-tested shells with strand detail.
 * - Joints where a body has them: shoulders, elbows, hips, knees, and hands
 *   with jointed fingers that relax or close into a fist.
 * - Image-based lighting, a soft key light with self-shadowing, and a cool rim.
 *
 * The body faces +x; +z is his left (the viewer's left when he faces you);
 * limbs swing about z. Hips at y = 0, head centre at y = HEAD_Y.
 */
import type * as T from 'three';

type Three = typeof import('three');

export type Limb = { hip?: T.Group; knee?: T.Group; arm: T.Group; elbow: T.Group; hand: (curl: number) => void };

export type Toon = {
	/** The whole figure. Turn it with rotation.y; roll it with rotation.z. */
	body: T.Group;
	head: T.Group;
	torso: T.Group;
	front: Limb;
	back: Limb;
	/** Eyeballs (pivot at the centre: rotate y to look sideways, z to look up/down). */
	eyes: T.Group[];
	/** 0 = open, 1 = shut. */
	blink: (v: number) => void;
	brows: T.Group;
	mouth: T.Group;
	mouthSleep: T.Group;
	shades: T.Group;
	sweat: T.Group;
	tails: T.Group[];
	hair: T.Group;
};

/** Height of the head's centre above the hips. */
export const HEAD_Y = 0.725;

export function buildToon(THREE: Three, opts: { legs?: boolean; detail?: boolean } = {}): Toon {
	const { legs = true, detail = false } = opts;
	const seg = detail ? 40 : 24;
	const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
	const N = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
	const smooth = (a: number, b: number, x: number) => {
		const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
		return t * t * (3 - 2 * t);
	};
	// A repeatable random, so the figure looks the same on every visit.
	let seed = 7;
	const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

	// ── Textures, painted on small canvases ──
	const canvasTex = (w: number, h: number, paint: (g: CanvasRenderingContext2D) => void, color = false, repeat?: [number, number]) => {
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		const g = c.getContext('2d');
		if (g) paint(g);
		const tex = new THREE.CanvasTexture(c);
		if (color) tex.colorSpace = THREE.SRGBColorSpace;
		if (repeat) {
			tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
			tex.repeat.set(...repeat);
		}
		tex.anisotropy = 4;
		return tex;
	};
	const texSize = detail ? 256 : 128;
	// Fabric: a plain weave with a little irregularity.
	const weave = canvasTex(
		texSize,
		texSize,
		(g) => {
			g.fillStyle = '#808080';
			g.fillRect(0, 0, texSize, texSize);
			const step = texSize / 32;
			for (let i = 0; i < 32; i++) {
				for (let j = 0; j < 32; j++) {
					const v = 110 + ((i + j) % 2) * 60 + rnd() * 30;
					g.fillStyle = `rgb(${v},${v},${v})`;
					if ((i + j) % 2) g.fillRect(i * step, j * step + step * 0.15, step, step * 0.7);
					else g.fillRect(i * step + step * 0.15, j * step, step * 0.7, step);
				}
			}
		},
		false,
		[10, 10],
	);
	// Skin: fine pores.
	const pores = canvasTex(
		texSize,
		texSize,
		(g) => {
			g.fillStyle = '#9a9a9a';
			g.fillRect(0, 0, texSize, texSize);
			for (let i = 0; i < texSize * texSize * 0.18; i++) {
				const v = 60 + rnd() * 120;
				g.fillStyle = `rgb(${v},${v},${v})`;
				g.fillRect(rnd() * texSize, rnd() * texSize, 1, 1);
			}
		},
		false,
		[6, 6],
	);
	// Hair: strands that run along the sphere's meridians (front to back), with
	// silver strands on his left side (u between 0 and 0.5).
	const hairW = detail ? 512 : 256;
	const hairColor = canvasTex(
		hairW,
		hairW / 2,
		(g) => {
			g.fillStyle = '#ffffff';
			g.fillRect(0, 0, hairW, hairW / 2);
			for (let i = 0; i < hairW * 3; i++) {
				const u = rnd();
				const silver = u > 0.12 && u < 0.42 && rnd() < 0.22;
				const v = silver ? 150 + rnd() * 90 : 40 + rnd() * 90;
				g.strokeStyle = silver ? `rgba(${v},${v},${v + 8},0.9)` : `rgba(${v},${v},${v},0.5)`;
				g.lineWidth = silver ? 0.8 : 1;
				g.beginPath();
				const x = u * hairW;
				const y = rnd() * hairW * 0.5;
				g.moveTo(x, y);
				g.lineTo(x + (rnd() - 0.5) * 4, y + 12 + rnd() * 30);
				g.stroke();
			}
		},
		true,
	);
	const hairBump = canvasTex(hairW, hairW / 2, (g) => {
		g.fillStyle = '#808080';
		g.fillRect(0, 0, hairW, hairW / 2);
		for (let i = 0; i < hairW * 4; i++) {
			const v = rnd() * 255;
			g.strokeStyle = `rgba(${v},${v},${v},0.6)`;
			g.beginPath();
			const x = rnd() * hairW;
			const y = rnd() * hairW * 0.5;
			g.moveTo(x, y);
			g.lineTo(x + (rnd() - 0.5) * 3, y + 10 + rnd() * 30);
			g.stroke();
		}
	});
	// Speckle for alpha-tested shells: stubble and the ragged edge of the hairline.
	const speckle = (density: number) =>
		canvasTex(texSize * 2, texSize, (g) => {
			g.fillStyle = '#000';
			g.fillRect(0, 0, texSize * 2, texSize);
			for (let i = 0; i < texSize * texSize * 2 * density; i++) {
				const v = 140 + rnd() * 115;
				g.fillStyle = `rgb(${v},${v},${v})`;
				g.fillRect(rnd() * texSize * 2, rnd() * texSize, 1 + rnd(), 1 + rnd() * 2);
			}
		});
	// Noise that covers everything, for shells that should be solid with a ragged edge.
	const fillNoise = (min: number) =>
		canvasTex(texSize * 2, texSize, (g) => {
			for (let i = 0; i < texSize * texSize * 2; i++) {
				const v = Math.round(min * 255 + rnd() * (1 - min) * 255);
				g.fillStyle = `rgb(${v},${v},${v})`;
				g.fillRect(i % (texSize * 2), Math.floor(i / (texSize * 2)), 1, 1);
			}
		});
	// The eye: white with faint veins, a brown iris with fibres and a dark limbal
	// ring, and the pupil. Mapped so the iris sits at the eyeball's front (+x).
	const eyeTex = canvasTex(
		512,
		256,
		(g) => {
			g.fillStyle = '#f1ebe4';
			g.fillRect(0, 0, 512, 256);
			// Veins and a pinkish edge, away from the front.
			const edge = g.createRadialGradient(256, 128, 60, 256, 128, 240);
			edge.addColorStop(0, 'rgba(240,215,205,0)');
			edge.addColorStop(1, 'rgba(215,160,150,0.6)');
			g.fillStyle = edge;
			g.fillRect(0, 0, 512, 256);
			g.strokeStyle = 'rgba(190,90,90,0.25)';
			for (let i = 0; i < 18; i++) {
				const a = rnd() * Math.PI * 2;
				g.beginPath();
				g.moveTo(256 + Math.cos(a) * 200, 128 + Math.sin(a) * 120);
				g.quadraticCurveTo(256 + Math.cos(a + 0.2) * 120, 128 + Math.sin(a + 0.2) * 90, 256 + Math.cos(a) * 70, 128 + Math.sin(a) * 60);
				g.stroke();
			}
			// Iris: 0.52 rad across the radius, 81.5 px per radian.
			const R = 42;
			const iris = g.createRadialGradient(256, 128, 6, 256, 128, R);
			iris.addColorStop(0, '#2a160a');
			iris.addColorStop(0.35, '#5a3218');
			iris.addColorStop(0.8, '#3e2210');
			iris.addColorStop(0.93, '#1d0f07');
			iris.addColorStop(1, 'rgba(30,15,8,0)');
			g.fillStyle = iris;
			g.beginPath();
			g.arc(256, 128, R, 0, Math.PI * 2);
			g.fill();
			for (let i = 0; i < 120; i++) {
				const a = rnd() * Math.PI * 2;
				const r0 = 14 + rnd() * 6;
				g.strokeStyle = rnd() < 0.5 ? 'rgba(140,90,45,0.35)' : 'rgba(20,10,5,0.35)';
				g.beginPath();
				g.moveTo(256 + Math.cos(a) * r0, 128 + Math.sin(a) * r0);
				g.lineTo(256 + Math.cos(a) * (R - 4), 128 + Math.sin(a) * (R - 4));
				g.stroke();
			}
			g.fillStyle = '#050302';
			g.beginPath();
			g.arc(256, 128, 15, 0, Math.PI * 2);
			g.fill();
		},
		true,
	);

	// ── Materials ──
	const fabric = (color: number, sheen = 0.6) =>
		new THREE.MeshPhysicalMaterial({
			color,
			roughness: 0.9,
			sheen,
			sheenRoughness: 0.7,
			sheenColor: new THREE.Color(0xffffff),
			bumpMap: weave,
			bumpScale: 0.6,
			side: THREE.DoubleSide,
		});
	const M = {
		gi: fabric(0xe4e1d8),
		collar: fabric(0x111214, 0.4),
		belt: fabric(0x0d0e10, 0.5),
		skin: new THREE.MeshPhysicalMaterial({
			color: 0x8e5a3d,
			roughness: 0.55,
			sheen: 0.35,
			sheenRoughness: 0.55,
			sheenColor: new THREE.Color(0x9a4c38),
			emissive: new THREE.Color(0x140603),
			bumpMap: pores,
			bumpScale: 0.15,
		}),
		lip: new THREE.MeshPhysicalMaterial({ color: 0x6a3a30, roughness: 0.4, sheen: 0.3, sheenColor: new THREE.Color(0xa05848) }),
		mouthDark: new THREE.MeshStandardMaterial({ color: 0x2a100c, roughness: 0.8 }),
		nostril: new THREE.MeshStandardMaterial({ color: 0x3a1d12, roughness: 0.9 }),
		eye: new THREE.MeshPhysicalMaterial({ map: eyeTex, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03 }),
		hair: new THREE.MeshPhysicalMaterial({
			color: 0x1a1512,
			map: hairColor,
			bumpMap: hairBump,
			bumpScale: 1,
			roughness: 0.5,
			sheen: 1,
			sheenRoughness: 0.35,
			sheenColor: new THREE.Color(0x6e6258),
			alphaMap: fillNoise(0.5),
			alphaTest: 0.45,
			vertexColors: true,
			side: THREE.DoubleSide,
		}),
		lock: new THREE.MeshPhysicalMaterial({ color: 0x15110e, roughness: 0.45, sheen: 1, sheenRoughness: 0.3, sheenColor: new THREE.Color(0x7a6c60), bumpMap: hairBump, bumpScale: 0.5 }),
		silver: new THREE.MeshPhysicalMaterial({ color: 0x7d8086, roughness: 0.45, sheen: 0.6, sheenColor: new THREE.Color(0xc8ccd2) }),
		stubble: new THREE.MeshStandardMaterial({ color: 0x1f1712, roughness: 0.85, alphaMap: speckle(0.8), alphaTest: 0.5, vertexColors: true }),
		lens: new THREE.MeshPhysicalMaterial({ color: 0x0b0e13, roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0 }),
		frame: new THREE.MeshStandardMaterial({ color: 0x18191c, roughness: 0.35, metalness: 0.6 }),
		sweat: new THREE.MeshPhysicalMaterial({ color: 0xd6ecff, roughness: 0, transparent: true, opacity: 0.55, clearcoat: 1 }),
		gold: new THREE.MeshStandardMaterial({ color: 0xc9a14a, roughness: 0.35, metalness: 0.9 }),
	};
	M.stubble.alphaMap!.repeat.set(6, 1);
	M.stubble.alphaMap!.wrapS = M.stubble.alphaMap!.wrapT = THREE.RepeatWrapping;

	const mesh = (geo: T.BufferGeometry, mat: T.Material) => new THREE.Mesh(geo, mat);
	const at = <O extends T.Object3D>(o: O, x: number, y: number, z: number) => (o.position.set(x, y, z), o);
	const sphere = (r: number, ws = seg, hs = Math.round(seg * 0.75)) => new THREE.SphereGeometry(r, ws, hs);
	const capsule = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 4, Math.max(8, seg / 2));
	// Displace each vertex: fn gets the original position, returns the new one.
	const sculpt = (geo: T.BufferGeometry, fn: (p: T.Vector3) => T.Vector3) => {
		const pos = geo.attributes.position;
		const p = new THREE.Vector3();
		for (let i = 0; i < pos.count; i++) {
			p.fromBufferAttribute(pos, i);
			const q = fn(p.clone());
			pos.setXYZ(i, q.x, q.y, q.z);
		}
		geo.computeVertexNormals();
		return geo;
	};
	// Cloth folds: low-frequency ripples along the normal. Periodic around y so
	// lathe seams stay closed.
	const folds = (geo: T.BufferGeometry, amp: number, phase = 0) => {
		geo.computeVertexNormals();
		const pos = geo.attributes.position;
		const nor = geo.attributes.normal;
		for (let i = 0; i < pos.count; i++) {
			const x = pos.getX(i);
			const y = pos.getY(i);
			const z = pos.getZ(i);
			const a = Math.atan2(z, x);
			const d =
				amp *
				(Math.sin(a * 3 + y * 9 + phase) * 0.5 + Math.sin(a * 5 - y * 17 + phase * 2) * 0.3 + Math.sin(a * 2 + y * 31 + phase * 3) * 0.2);
			pos.setXYZ(i, x + nor.getX(i) * d, y + nor.getY(i) * d, z + nor.getZ(i) * d);
		}
		geo.computeVertexNormals();
		return geo;
	};
	const lathe = (profile: [number, number][], segs = seg) => new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segs);
	// A strand along a curve that tapers to a point at the end.
	const strand = (pts: T.Vector3[], r: number, mat: T.Material, taper = true) => {
		const curve = new THREE.CatmullRomCurve3(pts);
		const tSeg = detail ? 28 : 14;
		const rSeg = detail ? 8 : 5;
		const geo = new THREE.TubeGeometry(curve, tSeg, r, rSeg, false);
		if (taper) {
			const pos = geo.attributes.position;
			const p = new THREE.Vector3();
			for (let i = 0; i <= tSeg; i++) {
				const t = i / tSeg;
				const c = curve.getPointAt(t);
				const k = t < 0.12 ? 0.55 + (t / 0.12) * 0.45 : 1 - 0.85 * ((t - 0.12) / 0.88) ** 1.6;
				for (let j = 0; j <= rSeg; j++) {
					const idx = i * (rSeg + 1) + j;
					p.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(k).add(c);
					pos.setXYZ(idx, p.x, p.y, p.z);
				}
			}
			geo.computeVertexNormals();
		}
		return mesh(geo, mat);
	};

	const body = new THREE.Group();

	// ── Torso: a lathed jacket with a chest and waist, flattened front to back ──
	const PROFILE: [number, number][] = [
		[0.148, -0.21],
		[0.146, -0.12],
		[0.144, 0.0],
		[0.138, 0.12],
		[0.148, 0.26],
		[0.156, 0.36],
		[0.154, 0.44],
		[0.136, 0.5],
		[0.112, 0.535],
		[0.07, 0.575],
		[0.046, 0.59],
	];
	const DEPTH = 0.78;
	// How far the jacket's front surface is from the spine at height y.
	const frontX = (y: number) => {
		for (let i = 0; i < PROFILE.length - 1; i++) {
			const [r0, y0] = PROFILE[i];
			const [r1, y1] = PROFILE[i + 1];
			if (y >= y0 && y <= y1) return (r0 + ((y - y0) / (y1 - y0)) * (r1 - r0)) * DEPTH;
		}
		return PROFILE[0][0] * DEPTH;
	};
	const torso = new THREE.Group();
	body.add(torso);
	const jacket = mesh(folds(lathe(PROFILE, detail ? 72 : seg), 0.005), M.gi);
	jacket.scale.set(DEPTH, 1, 1);
	torso.add(jacket);

	// The black collar: a flat band from behind the neck, over each shoulder,
	// down the chest to the V, the left lapel crossing over the right.
	const band = (pts: T.Vector3[], w: number, t: number, mat: T.Material) => {
		const curve = new THREE.CatmullRomCurve3(pts);
		const geo = new THREE.TubeGeometry(curve, detail ? 40 : 20, 1, 8, false);
		// Flatten the tube into a band: squash along the direction away from the spine.
		const pos = geo.attributes.position;
		const p = new THREE.Vector3();
		const segs = detail ? 40 : 20;
		for (let i = 0; i <= segs; i++) {
			const c = curve.getPointAt(i / segs);
			const out = new THREE.Vector3(c.x, 0, c.z).normalize();
			for (let j = 0; j <= 8; j++) {
				const idx = i * 9 + j;
				p.fromBufferAttribute(pos, idx).sub(c);
				const n = p.dot(out);
				p.addScaledVector(out, -n).multiplyScalar(w).addScaledVector(out, n * t);
				p.add(c);
				pos.setXYZ(idx, p.x, p.y, p.z);
			}
		}
		geo.computeVertexNormals();
		return mesh(geo, mat);
	};
	for (const side of [1, -1]) {
		const pts = [
			V(-0.036, 0.585, side * 0.034),
			V(0.0, 0.582, side * 0.058),
			V(frontX(0.52) - 0.004, 0.53, side * 0.058),
			V(frontX(0.45) + 0.004, 0.45, side * 0.036),
			V(frontX(0.38) + 0.006, 0.38, side * 0.012),
			V(frontX(0.32) + 0.007, 0.32, side * -0.014),
		];
		torso.add(band(pts, 0.018, 0.006, M.collar));
	}
	torso.add(band([V(-0.036, 0.585, 0.034), V(-0.052, 0.588, 0), V(-0.036, 0.585, -0.034)], 0.018, 0.006, M.collar));
	// The wrap's overlap edge, running from the V down to the belt.
	const overlap = band([V(frontX(0.32) + 0.004, 0.32, -0.012), V(frontX(0.2) + 0.004, 0.2, -0.04), V(frontX(0.1) + 0.004, 0.1, -0.07)], 0.006, 0.003, M.gi);
	torso.add(overlap);

	// The flag patch on the chest, drawn on a little canvas.
	if (detail) {
		const tex = canvasTex(
			128,
			128,
			(g) => {
				g.fillStyle = '#f4f2ec';
				g.beginPath();
				g.arc(64, 64, 63, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = '#0047a0';
				g.beginPath();
				g.arc(64, 64, 48, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = '#cd2e3a';
				g.beginPath();
				g.arc(64, 64, 48, Math.PI, 0);
				g.arc(88, 64, 24, 0, Math.PI, false);
				g.arc(40, 64, 24, 0, Math.PI, true);
				g.fill();
			},
			true,
		);
		const patch = at(
			mesh(new THREE.CircleGeometry(0.026, 32), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.8, bumpMap: weave, bumpScale: 0.3 })),
			frontX(0.38) - 0.006,
			0.38,
			-0.082,
		);
		patch.rotation.y = Math.PI / 2 - 0.6;
		torso.add(patch);
	}

	// ── Belt: two wraps, a square knot, and tails ──
	const belt = new THREE.Group();
	belt.scale.set(DEPTH, 1, 1);
	torso.add(belt);
	belt.add(at(mesh(new THREE.CylinderGeometry(0.147, 0.146, 0.038, seg, 1, true), M.belt), 0, 0.08, 0));
	belt.add(at(mesh(new THREE.CylinderGeometry(0.149, 0.148, 0.038, seg, 1, true), M.belt), 0, 0.042, 0));
	const knotX = frontX(0.06) + 0.012;
	const knot = at(new THREE.Group(), knotX, 0.062, 0);
	torso.add(knot);
	const knotCore = mesh(sphere(0.026, 16, 12), M.belt);
	knotCore.scale.set(0.7, 1.15, 1.25);
	knot.add(knotCore);
	const cross = at(mesh(capsule(0.014, 0.06), M.belt), 0.012, 0, 0);
	cross.rotation.x = 0.75;
	cross.scale.set(0.7, 1, 1.4);
	knot.add(cross);
	const tails: T.Group[] = [];
	for (const side of [1, -1]) {
		const tail = at(new THREE.Group(), knotX + 0.004, 0.035, side * 0.014);
		const strip = at(mesh(new THREE.BoxGeometry(0.012, 0.18, 0.038, 1, 6, 1), M.belt), 0, -0.09, 0);
		tail.add(strip);
		if (detail) tail.add(at(mesh(new THREE.BoxGeometry(0.0125, 0.006, 0.039), M.gold), 0.001, -0.155, 0));
		tail.rotation.x = side * 0.18;
		torso.add(tail);
		tails.push(tail);
	}

	// ── Neck ──
	const neck = at(mesh(new THREE.CylinderGeometry(0.041, 0.048, 0.14, seg), M.skin), -0.008, 0.625, 0);
	neck.rotation.z = -0.12;
	torso.add(neck);

	// ── Head: a sphere sculpted into a skull ──
	const head = at(new THREE.Group(), 0, HEAD_Y, 0);
	head.scale.setScalar(1.08);
	body.add(head);
	type Bump = { c: T.Vector3; s: number; amt: number };
	const bump = (x: number, y: number, z: number, s: number, amt: number): Bump => ({ c: N(x, y, z), s, amt });
	const BUMPS: Bump[] = [
		bump(0.92, 0.3, 0, 0.015, 0.004), // brow ridge
		bump(0.85, 0.3, 0.38, 0.01, 0.005),
		bump(0.85, 0.3, -0.38, 0.01, 0.005),
		bump(0.88, 0.1, 0.42, 0.006, -0.008), // eye sockets
		bump(0.88, 0.1, -0.42, 0.006, -0.008),
		bump(0.95, 0.15, 0, 0.004, -0.003), // root of the nose
		bump(0.6, -0.1, 0.76, 0.02, 0.006), // cheekbones
		bump(0.6, -0.1, -0.76, 0.02, 0.006),
		bump(0.85, -0.45, 0, 0.03, 0.007), // muzzle
		bump(0.72, -0.7, 0, 0.012, 0.01), // chin
		bump(0.05, -0.6, 0.78, 0.02, 0.004), // jaw angles
		bump(0.05, -0.6, -0.78, 0.02, 0.004),
		bump(0.6, -0.4, 0.68, 0.012, -0.003), // hollows under the cheekbones
		bump(0.6, -0.4, -0.68, 0.012, -0.003),
		bump(0.35, 0.35, 0.85, 0.02, -0.003), // temples
		bump(0.35, 0.35, -0.85, 0.02, -0.003),
		bump(-0.9, 0.15, 0, 0.05, 0.006), // back of the skull
	];
	// The surface point of the head in direction n (a unit vector).
	const headAt = (n: T.Vector3) => {
		let x = n.x * 0.094;
		const y = n.y * 0.108;
		let z = n.z * 0.074;
		if (n.y < 0) {
			const k = (-n.y) ** 1.5;
			z *= 1 - 0.3 * k;
			x *= 1 - (n.x < 0 ? 0.4 : 0.06) * k;
		}
		let d = 0;
		for (const b of BUMPS) d += b.amt * Math.exp(-(1 - n.dot(b.c)) / b.s);
		return V(x + n.x * d, y + n.y * d, z + n.z * d);
	};
	const headSeg = detail ? 72 : 36;
	const skullGeo = sphere(1, headSeg, Math.round(headSeg * 0.75));
	// Skin isn't one colour: warmer cheeks, nose and ears, darker around the
	// eyes and where the beard shadows the jaw, lighter on the forehead.
	{
		const pos = skullGeo.attributes.position;
		const col = new Float32Array(pos.count * 3);
		const n = new THREE.Vector3();
		const near = (x: number, y: number, z: number, s: number) => Math.exp(-(1 - n.dot(N(x, y, z))) / s);
		for (let i = 0; i < pos.count; i++) {
			n.fromBufferAttribute(pos, i).normalize();
			const blush = near(0.7, -0.15, 0.6, 0.03) + near(0.7, -0.15, -0.6, 0.03) + near(0.98, -0.1, 0, 0.01);
			const shade = near(0.88, 0.05, 0.42, 0.006) + near(0.88, 0.05, -0.42, 0.006) + 0.5 * smooth(-0.1, -0.5, n.y) * smooth(-0.2, 0.3, n.x);
			const lift = near(0.85, 0.5, 0, 0.04);
			col.set([1 + blush * 0.08 - shade * 0.14 + lift * 0.06, 1 - blush * 0.06 - shade * 0.16 + lift * 0.05, 1 - blush * 0.06 - shade * 0.14 + lift * 0.04], i * 3);
		}
		skullGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
	}
	sculpt(skullGeo, (p) => headAt(p.normalize()));
	const face = M.skin.clone();
	face.vertexColors = true;
	head.add(mesh(skullGeo, face));
	// A shell over the head (or part of it): thickness and coverage by direction.
	const shell = (thick: (n: T.Vector3) => number, cover: (n: T.Vector3) => number, mat: T.Material, segs = headSeg) => {
		const geo = sphere(1, segs, Math.round(segs * 0.75));
		const pos = geo.attributes.position;
		const col = new Float32Array(pos.count * 4);
		const n = new THREE.Vector3();
		for (let i = 0; i < pos.count; i++) {
			n.fromBufferAttribute(pos, i).normalize();
			const p = headAt(n).addScaledVector(n, thick(n));
			pos.setXYZ(i, p.x, p.y, p.z);
			col.set([1, 1, 1, cover(n)], i * 4);
		}
		geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
		geo.computeVertexNormals();
		return mesh(geo, mat);
	};

	// Ears, with a rim (the helix) and a hollow.
	for (const side of [1, -1]) {
		const ear = at(new THREE.Group(), -0.008, -0.004, side * 0.074);
		// A flattened disc, narrower at the lobe, with a hollow (the concha) on the outside.
		const earGeo = sculpt(sphere(1, 24, 16), (p) => {
			const out = p.z * side > 0;
			const dish = out ? Math.exp(-(p.x * p.x + (p.y + 0.1) ** 2) / 0.25) * 0.0075 : 0;
			const w = p.y < 0 ? 1 - 0.35 * -p.y : 1;
			return V(p.x * 0.016 * w, p.y * 0.028, p.z * 0.0075 - side * dish);
		});
		ear.add(mesh(earGeo, M.skin));
		ear.rotation.y = side * -0.25;
		ear.rotation.z = 0.12;
		head.add(ear);
	}

	// Nose: a wedge, narrow at the bridge, a rounded tip and the wings of the nostrils.
	const noseGeo = sculpt(sphere(1, 28, 20), (p) => {
		const n = p.clone().normalize();
		const lower = Math.max(0, -n.y);
		const x = n.x * 0.011 + (1 - n.y) * 0.0075 + Math.exp(-(1 - n.dot(N(1, -0.55, 0))) / 0.08) * 0.007;
		const y = n.y * 0.024;
		const z = n.z * (0.0068 + 0.0105 * lower ** 1.1) + Math.sign(n.z) * Math.exp(-(1 - Math.abs(n.dot(N(0.15, -0.7, 0.7)))) / 0.05) * 0.0035;
		return V(x, y, z);
	});
	const nose = at(mesh(noseGeo, M.skin), headAt(N(1, 0.02, 0)).x - 0.013, -0.006, 0);
	head.add(nose);
	for (const s of [1, -1]) {
		const nostril = at(mesh(sphere(1, 10, 8), M.nostril), nose.position.x + 0.012, -0.03, s * 0.0065);
		nostril.scale.set(0.006, 0.0022, 0.0035);
		head.add(nostril);
	}

	// Eyes: wet eyeballs that can look around, under lids that blink.
	const eyes: T.Group[] = [];
	const lids: T.Mesh[] = [];
	const EYE_R = 0.0118;
	const LID_OPEN = -0.18;
	const LID_SHUT = 0.85;
	for (const side of [1, -1]) {
		const socket = headAt(N(0.88, 0.1, side * 0.42));
		const centre = V(socket.x - EYE_R * 0.8, 0.011, side * 0.031);
		const eye = at(new THREE.Group(), centre.x, centre.y, centre.z);
		// The texture's centre (the iris) maps to the sphere's +x.
		eye.add(mesh(sphere(EYE_R, 32, 20), M.eye));
		head.add(eye);
		eyes.push(eye);
		// Upper lid: a cap of skin a hair bigger than the eye, tilted down to blink.
		const lidPivot = at(new THREE.Group(), centre.x, centre.y, centre.z);
		const lid = mesh(new THREE.SphereGeometry(EYE_R * 1.12, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), M.skin);
		lid.rotation.z = -LID_OPEN;
		lidPivot.add(lid);
		lids.push(lid);
		// Lower lid, fixed.
		const lower = mesh(new THREE.SphereGeometry(EYE_R * 1.1, 28, 10, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28), M.skin);
		lower.rotation.z = -0.35;
		lidPivot.add(lower);
		// The crease above the lid.
		const crease = mesh(new THREE.TorusGeometry(EYE_R * 1.15, 0.0012, 4, 16, Math.PI * 0.7), M.nostril);
		crease.rotation.set(Math.PI / 2, 0, 0);
		crease.rotation.order = 'YXZ';
		crease.rotation.y = Math.PI / 2;
		crease.rotation.x = 0;
		crease.position.set(0.001, EYE_R * 0.35, 0);
		if (detail) lidPivot.add(crease);
		head.add(lidPivot);
	}
	const blink = (v: number) => lids.forEach((l) => (l.rotation.z = -(LID_OPEN + (LID_SHUT - LID_OPEN) * v)));

	// Brows: thick and slightly arched, as short-haired strips over the brow ridge.
	const brows = new THREE.Group();
	head.add(brows);
	// Short hairs, laid along the arch and angled outwards, denser at the inner end.
	for (const side of [1, -1]) {
		const hairs = detail ? 46 : 14;
		for (let i = 0; i < hairs; i++) {
			const f = (i / hairs) ** 0.85;
			const z = 0.13 + f * 0.53;
			const y = 0.3 + Math.sin(f * Math.PI) * 0.045 - f * 0.02 + (rnd() - 0.5) * (0.05 - f * 0.03);
			const n0 = N(0.86, y - 0.012, side * z);
			const n1 = N(0.86, y + 0.008, side * (z + 0.05 + rnd() * 0.02));
			const nm = n0.clone().add(n1).normalize();
			const pts = [n0, nm, n1].map((n, k) => headAt(n).addScaledVector(n, 0.0012 + (k === 1 ? 0.0012 : 0)));
			brows.add(strand(pts, 0.0011 + (1 - f) * 0.0005, M.lock));
		}
	}

	// Lips: a fuller lower lip, the line between them, and the corners.
	const mouth = new THREE.Group();
	head.add(mouth);
	const onFace = (y: number, z: number, out = 0.001) => headAt(N(0.87, y, z)).addScaledVector(N(0.87, y, z), out);
	mouth.add(strand([onFace(-0.47, -0.3), onFace(-0.46, -0.12), onFace(-0.455, 0), onFace(-0.46, 0.12), onFace(-0.47, 0.3)], 0.0026, M.lip, false));
	mouth.add(strand([onFace(-0.51, -0.27, 0.0015), onFace(-0.52, -0.14, 0.0025), onFace(-0.523, 0, 0.003), onFace(-0.52, 0.14, 0.0025), onFace(-0.51, 0.27, 0.0015)], 0.0034, M.lip, false));
	mouth.add(strand([onFace(-0.478, -0.31), onFace(-0.488, -0.1), onFace(-0.49, 0), onFace(-0.488, 0.1), onFace(-0.478, 0.31)], 0.0012, M.mouthDark, false));
	const mouthSleep = at(new THREE.Group(), 0, 0, 0);
	const opening = at(mesh(sphere(1, 12, 8), M.mouthDark), onFace(-0.49, 0).x - 0.001, onFace(-0.49, 0).y, 0);
	opening.scale.set(0.003, 0.0045, 0.008);
	mouthSleep.add(opening);
	mouthSleep.visible = false;
	head.add(mouthSleep);

	// Stubble: a short beard over the jaw, chin and upper lip, clear of the lips.
	const beardCover = (n: T.Vector3) => {
		const line = 0.12 - 0.62 * Math.max(0, n.x);
		let c = smooth(line + 0.05, line - 0.05, n.y) * smooth(-0.3, 0.0, n.x);
		const tache = n.x > 0.6 && Math.abs(n.z) < 0.36 && n.y > -0.462 && n.y < -0.32 ? smooth(-0.32, -0.36, n.y) * smooth(0.36, 0.26, Math.abs(n.z)) : 0;
		c = Math.max(c, tache);
		const dy = (n.y + 0.5) / 0.045;
		const dz = n.z / 0.36;
		if (n.x > 0.6 && dy * dy + dz * dz < 1) c = 0;
		return c * 0.95;
	};
	head.add(shell(() => 0.0024, beardCover, M.stubble));

	// ── Hair: a shell cut to a hairline, then swept locks on top ──
	const hair = new THREE.Group();
	head.add(hair);
	const hairline = (n: T.Vector3) => {
		let t = n.x >= 0 ? 0.18 + 0.34 * smooth(0.1, 0.85, n.x) : 0.18 - 0.62 * smooth(0, 0.8, -n.x);
		if (n.x > 0.02 && n.x < 0.3 && Math.abs(n.z) > 0.82) t = -0.08; // sideburns
		if (n.dot(N(-0.05, 0.0, Math.sign(n.z))) > 0.96) t = 0.4; // clear of the ears
		return t;
	};
	const hairThick = (n: T.Vector3) => 0.004 + 0.011 * Math.max(0, n.y) ** 0.8 + Math.exp(-(1 - n.dot(N(0.6, 0.75, -0.15))) / 0.06) * 0.008;
	hair.add(shell(hairThick, (n) => smooth(hairline(n) - 0.02, hairline(n) + 0.07, n.y), M.hair));
	// Locks sweep from the crown, forward and over to his left, lifting at the front.
	const lockCount = detail ? 60 : 16;
	for (let i = 0; i < lockCount; i++) {
		const f = i / (lockCount - 1);
		const z0 = -0.62 + f * 1.0 + (rnd() - 0.5) * 0.05;
		const path = [
			N(-0.55, 0.82, z0 * 0.8),
			N(-0.1, 1.0, z0 * 0.92),
			N(0.4, 0.92, z0 + 0.12),
			N(0.72, 0.66, z0 + 0.26),
			N(0.82, 0.54, z0 + 0.36 + (rnd() - 0.5) * 0.06),
		];
		const pts = path.map((n, k) => headAt(n).addScaledVector(n, hairThick(n) - 0.001 + (k === 3 ? 0.004 : 0) + rnd() * 0.0015));
		const silver = detail && f > 0.55 && rnd() < 0.25;
		hair.add(strand(pts, silver ? 0.0028 : 0.0045 + rnd() * 0.0025, silver ? M.silver : M.lock));
	}

	// ── Sunglasses (sunny) and a bead of sweat (hot) ──
	const shades = new THREE.Group();
	const lensShape = new THREE.Shape();
	const lw = 0.024;
	const lh = 0.017;
	const lr = 0.008;
	lensShape.moveTo(-lw + lr, -lh);
	lensShape.lineTo(lw - lr, -lh);
	lensShape.quadraticCurveTo(lw, -lh, lw, -lh + lr);
	lensShape.lineTo(lw, lh - lr * 0.5);
	lensShape.quadraticCurveTo(lw, lh, lw - lr, lh);
	lensShape.lineTo(-lw + lr, lh);
	lensShape.quadraticCurveTo(-lw, lh, -lw, lh - lr);
	lensShape.lineTo(-lw, -lh + lr);
	lensShape.quadraticCurveTo(-lw, -lh, -lw + lr, -lh);
	const lensGeo = new THREE.ExtrudeGeometry(lensShape, { depth: 0.002, bevelEnabled: true, bevelThickness: 0.0012, bevelSize: 0.0012, bevelSegments: 2 });
	for (const side of [1, -1]) {
		const lens = at(mesh(lensGeo, M.lens), eyes[side > 0 ? 0 : 1].position.x + 0.017, 0.012, side * 0.032);
		lens.rotation.y = Math.PI / 2 + side * 0.12;
		shades.add(lens);
		const arm = at(mesh(new THREE.BoxGeometry(0.1, 0.004, 0.003), M.frame), 0.045, 0.02, side * 0.078);
		arm.rotation.y = side * 0.04;
		shades.add(arm);
	}
	shades.add(at(mesh(new THREE.BoxGeometry(0.004, 0.004, 0.018), M.frame), eyes[0].position.x + 0.02, 0.022, 0));
	shades.visible = false;
	head.add(shades);
	const sweat = new THREE.Group();
	const dropAt = headAt(N(0.55, 0.42, -0.72)).addScaledVector(N(0.55, 0.42, -0.72), 0.003);
	sweat.position.copy(dropAt);
	const drop = mesh(sphere(0.006, 14, 10), M.sweat);
	drop.scale.set(0.8, 1.35, 0.8);
	sweat.add(drop);
	sweat.visible = false;
	head.add(sweat);

	// ── Limbs: a pivot group per joint, so a rotation swings everything below ──
	// A hand hanging from the wrist, thumb forward (+x), palm towards the body.
	// curl: 0 = relaxed, 1 = a fist.
	const hand = (side: number) => {
		const g = new THREE.Group();
		const palm = mesh(sculpt(sphere(1, 20, 14), (p) => V(p.x * 0.034, p.y * 0.042 * (p.y < 0 ? 1.1 : 1), p.z * 0.014 * (1 - 0.3 * Math.abs(p.x)))), M.skin);
		palm.position.y = -0.04;
		g.add(palm);
		const fingers: { a: T.Group; b: T.Group }[] = [];
		const LEN = [0.026, 0.03, 0.028, 0.022];
		for (let i = 0; i < 4; i++) {
			const x = 0.0235 - i * 0.0157;
			const a = at(new THREE.Group(), x, -0.076, -side * 0.002);
			const r = i === 3 ? 0.0074 : 0.0084;
			a.add(at(mesh(capsule(r, LEN[i]), M.skin), 0, -LEN[i] / 2, 0));
			const b = at(new THREE.Group(), 0, -LEN[i], 0);
			b.add(at(mesh(capsule(r * 0.92, LEN[i] * 0.8), M.skin), 0, -LEN[i] * 0.4, 0));
			a.add(b);
			g.add(a);
			fingers.push({ a, b });
		}
		const thumb = at(new THREE.Group(), 0.03, -0.035, -side * 0.006);
		thumb.add(at(mesh(capsule(0.0085, 0.03), M.skin), 0, -0.018, 0));
		g.add(thumb);
		return {
			g,
			curl(c: number) {
				for (const [i, f] of fingers.entries()) {
					f.a.rotation.x = side * (0.15 + c * 1.4 + i * 0.04);
					f.b.rotation.x = side * (0.22 + c * 1.6);
				}
				thumb.rotation.set(side * (0.15 + c * 1.3), 0, 0.3 - c * 1.0);
			},
		};
	};
	const arm = (z: number, side: number) => {
		const shoulder = at(new THREE.Group(), 0, 0.472, z);
		// The shoulder cap (deltoid under the jacket) closes the top of the sleeve.
		const cap = mesh(sphere(0.052), M.gi);
		cap.scale.set(0.95, 0.7, 1);
		cap.position.set(0, 0.0, -side * 0.012);
		shoulder.add(cap);
		// Wide dobok sleeves, upper arm then forearm, flaring a little to the cuff.
		shoulder.add(mesh(folds(lathe([[0.056, -0.29], [0.053, -0.2], [0.049, -0.08], [0.051, 0.02]], seg), 0.0055, side), M.gi));
		const elbow = at(new THREE.Group(), 0, -0.275, 0);
		shoulder.add(elbow);
		elbow.add(mesh(sphere(0.052), M.gi));
		elbow.add(mesh(folds(lathe([[0.062, -0.215], [0.063, -0.2], [0.058, -0.1], [0.055, 0.0]], seg), 0.005, side * 2), M.gi));
		// Cuff hem.
		const hem = at(mesh(new THREE.TorusGeometry(0.061, 0.0035, 6, seg), M.gi), 0, -0.214, 0);
		hem.rotation.x = Math.PI / 2;
		elbow.add(hem);
		elbow.add(at(mesh(new THREE.CylinderGeometry(0.021, 0.026, 0.07, 14), M.skin), 0, -0.215, 0));
		const h = hand(side);
		h.g.position.y = -0.235;
		elbow.add(h.g);
		elbow.rotation.z = 0.12;
		h.curl(0);
		body.add(shoulder);
		return { arm: shoulder, elbow, hand: h.curl };
	};
	const leg = (z: number, side: number) => {
		const hip = at(new THREE.Group(), 0, 0.02, z);
		hip.add(mesh(folds(lathe([[0.072, -0.4], [0.076, -0.3], [0.082, -0.12], [0.086, 0.04]], seg), 0.004, side), M.gi));
		hip.add(at(mesh(sphere(0.086), M.gi), 0, 0.03, 0));
		const knee = at(new THREE.Group(), 0, -0.39, 0);
		hip.add(knee);
		knee.add(mesh(sphere(0.067), M.gi));
		knee.add(mesh(folds(lathe([[0.07, -0.35], [0.068, -0.25], [0.068, -0.1], [0.072, 0.02]], seg), 0.004, side * 3), M.gi));
		const cuff = at(mesh(new THREE.TorusGeometry(0.069, 0.004, 6, seg), M.gi), 0, -0.35, 0);
		cuff.rotation.x = Math.PI / 2;
		knee.add(cuff);
		knee.add(at(mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.06, 14), M.skin), 0, -0.36, 0));
		// A bare foot: heel to ball, the arch, and five toes.
		const foot = at(new THREE.Group(), 0.035, -0.4, 0);
		const sole = mesh(
			sculpt(sphere(1, 24, 14), (p) => V(p.x * 0.11, p.y * (p.y > 0 ? 0.036 - 0.018 * Math.max(0, p.x) : 0.018), p.z * (0.03 + 0.012 * Math.max(0, p.x)))),
			M.skin,
		);
		foot.add(sole);
		const TOES = [0.011, 0.0085, 0.008, 0.0075, 0.007];
		for (let i = 0; i < 5; i++) {
			const toe = at(mesh(sphere(TOES[i], 10, 8), M.skin), 0.104 - i * 0.008, -0.006, side * (0.026 - i * 0.012));
			toe.scale.set(1.4, 0.9, 1);
			foot.add(toe);
		}
		knee.add(foot);
		body.add(hip);
		return { hip, knee };
	};
	// Front limbs sit nearer the camera (+z), back limbs further.
	const front: Limb = { ...(legs ? leg(0.082, 1) : {}), ...arm(0.176, 1) };
	const back: Limb = { ...(legs ? leg(-0.082, -1) : {}), ...arm(-0.176, -1) };

	// Everything casts and catches shadows, except the thin shells.
	body.traverse((o) => {
		if ((o as T.Mesh).isMesh) {
			const m = o as T.Mesh;
			const mat = m.material as T.Material;
			m.castShadow = !mat.alphaTest && mat !== M.lens;
			m.receiveShadow = true;
		}
	});

	return { body, head, torso, front, back, eyes, blink, brows, mouth, mouthSleep, shades, sweat, tails, hair };
}

/**
 * Lighting and renderer settings for a believable look: soft image-based
 * light from a studio room, a warm key that casts soft shadows, a cool rim
 * from behind, and neutral tone mapping so the colours stay true.
 */
export async function setupStage(THREE: Three, renderer: T.WebGLRenderer, scene: T.Scene, opts: { shadowSize?: number } = {}) {
	const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = 1.0;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	const pmrem = new THREE.PMREMGenerator(renderer);
	const room = new RoomEnvironment();
	scene.environment = pmrem.fromScene(room, 0.04).texture;
	scene.environmentIntensity = 0.4;
	room.dispose();
	pmrem.dispose();

	scene.add(new THREE.HemisphereLight(0xfff6ee, 0x5a4d45, 0.25));
	// The key comes from high on the right, so the face and folds model.
	const key = new THREE.DirectionalLight(0xfff1e2, 2.8);
	key.position.set(2.4, 2.5, 1.5);
	key.castShadow = true;
	const size = opts.shadowSize ?? 1024;
	key.shadow.mapSize.set(size, size);
	const cam = key.shadow.camera;
	cam.left = cam.bottom = -1.1;
	cam.right = cam.top = 1.1;
	cam.near = 0.5;
	cam.far = 7;
	key.shadow.bias = -0.0004;
	key.shadow.normalBias = 0.012;
	key.shadow.radius = 3;
	scene.add(key);
	const rim = new THREE.DirectionalLight(0xb9ccff, 1.6);
	rim.position.set(-2.2, 1.8, -2.4);
	scene.add(rim);
	const fill = new THREE.DirectionalLight(0xffe2cc, 0.3);
	fill.position.set(-2, 0.2, 2);
	scene.add(fill);
}
