/**
 * Toon Uma in 3D: one figure, shared by the hero and the kick buddy.
 *
 * Built in code from shaped parts in a joint hierarchy: a lathed torso with a
 * chest and waist, a dobok with a wrapped black collar, creases and wide
 * sleeves, a double-wrapped belt with a square knot, fists with fingers, and a
 * head with a jaw, rimmed ears, lidded eyes, brows, nose, lips, a stubble
 * beard and swept locks of hair with silver strands. Toon-shaded with three
 * flat tones, an ink outline (the back faces of a slightly bigger copy) and a
 * cool rim light, so it matches the site's drawings.
 *
 * The body faces +x; +z is his left (the viewer's left when he faces you);
 * limbs swing about z. Hips at y = 0, head centre at y = 0.74.
 */
import type * as T from 'three';

type Three = typeof import('three');

export type Toon = {
	/** The whole figure. Turn it with rotation.y; roll it with rotation.z. */
	body: T.Group;
	head: T.Group;
	torso: T.Group;
	front: { hip?: T.Group; knee?: T.Group; arm: T.Group };
	back: { hip?: T.Group; knee?: T.Group; arm: T.Group };
	/** Faces and extras the scenes switch on and off. */
	eyesOpen: T.Group;
	eyesClosed: T.Group;
	mouthSmile: T.Group;
	mouthSleep: T.Group;
	shades: T.Group;
	sweat: T.Group;
	/** For livelier motion: irises that look around, brows that lift, belt tails and hair that sway. */
	irises: T.Group;
	brows: T.Group;
	tails: T.Group[];
	hair: T.Group;
};

export function buildToon(THREE: Three, opts: { legs?: boolean; detail?: boolean } = {}): Toon {
	const { legs = true, detail = false } = opts;
	const seg = detail ? 32 : 20;
	const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

	// ── Materials: cel shading with three flat tones ──
	const ramp = new Uint8Array([90, 168, 255]);
	const gradient = new THREE.DataTexture(ramp, ramp.length, 1, THREE.RedFormat);
	gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
	gradient.needsUpdate = true;
	const toon = (color: number, extra: Partial<T.MeshToonMaterialParameters> = {}) =>
		new THREE.MeshToonMaterial({ color, gradientMap: gradient, ...extra });
	const flat = (color: number) => new THREE.MeshBasicMaterial({ color });
	const M = {
		gi: toon(0xf4f4ef, { side: THREE.DoubleSide }),
		giShade: toon(0xdedcd5, { side: THREE.DoubleSide }),
		crease: flat(0xc4c4bc),
		skin: toon(0xc27c4c),
		skinDark: toon(0xa8653a),
		lip: toon(0x9a5a4c),
		lipDark: flat(0x5e2e26),
		hair: toon(0x1c1a1d),
		hairHi: toon(0x34313a),
		silver: toon(0xa7acb4),
		belt: toon(0x141518),
		beltHi: toon(0x24262b),
		stubble: toon(0x4a3528, { transparent: true, opacity: 0.55 }),
		ink: flat(0x140c08),
		white: flat(0xf6efe6),
		iris: toon(0x4a2a18),
		shade: toon(0x11161d),
		lens: flat(0x2a4a6a),
		sweat: toon(0x7cc4ff),
		gold: toon(0xd8b45e),
	};
	// Ink outline: the back faces of a slightly bigger copy, in near-black.
	const inkHull = new THREE.MeshBasicMaterial({ color: 0x1a1210, side: THREE.BackSide });
	const part = (geo: T.BufferGeometry, mat: T.Material, outline = 0.028) => {
		const g = new THREE.Group();
		g.add(new THREE.Mesh(geo, mat));
		if (outline) {
			const hull = new THREE.Mesh(geo, inkHull);
			geo.computeBoundingSphere();
			const r = geo.boundingSphere?.radius || 1;
			hull.scale.setScalar(1 + outline / r);
			g.add(hull);
		}
		return g;
	};
	const mesh = (geo: T.BufferGeometry, mat: T.Material) => new THREE.Mesh(geo, mat);
	const sphere = (r: number, ws = seg, hs = Math.round(seg * 0.75)) => new THREE.SphereGeometry(r, ws, hs);
	const capsule = (r: number, len: number, mat: T.Material, outline = 0.028) =>
		part(new THREE.CapsuleGeometry(r, len, 6, seg), mat, outline);
	const at = <O extends T.Object3D>(o: O, x: number, y: number, z: number) => (o.position.set(x, y, z), o);
	// A rounded strand along a curve: collars, creases, brows, locks of hair.
	const tube = (pts: T.Vector3[], r: number, mat: T.Material, outline = 0) =>
		part(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), detail ? 36 : 20, r, detail ? 10 : 7, false), mat, outline);

	const body = new THREE.Group();

	// ── Torso: a lathed shape with a chest and waist, flattened front to back ──
	const PROFILE: [number, number][] = [
		[0.158, -0.17],
		[0.16, -0.06],
		[0.152, 0.06],
		[0.16, 0.2],
		[0.172, 0.33],
		[0.176, 0.43],
		[0.162, 0.51],
		[0.12, 0.565],
		[0.066, 0.59],
	];
	const DEPTH = 0.86;
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
	const jacket = part(new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r, y)), seg), M.gi);
	jacket.scale.set(DEPTH, 1, 1);
	torso.add(jacket);
	// Rounded shoulders.
	for (const z of [0.155, -0.155]) torso.add(at(part(sphere(0.088), M.gi, 0.02), -0.005, 0.5, z));

	// Skin in the V of the collar: a flat triangle on the chest.
	const vShape = new THREE.Shape();
	vShape.moveTo(-0.052, 0);
	vShape.lineTo(0.052, 0);
	vShape.lineTo(0, -0.15);
	vShape.closePath();
	const vee = at(mesh(new THREE.ShapeGeometry(vShape), M.skinDark), frontX(0.53) + 0.004, 0.565, 0);
	vee.rotation.y = Math.PI / 2;
	vee.rotation.z = -0.12;
	torso.add(vee);

	// The black collar: a rounded band from behind the neck, over each shoulder,
	// down the chest to the V, the left lapel crossing over the right.
	for (const side of [1, -1]) {
		const pts = [
			V(-0.05, 0.585, side * 0.035),
			V(0.0, 0.592, side * 0.072),
			V(frontX(0.54) - 0.01, 0.55, side * 0.07),
			V(frontX(0.47) + 0.006, 0.47, side * 0.045),
			V(frontX(0.4) + 0.008, 0.4, side * 0.018),
			V(frontX(0.34) + 0.01, 0.34, side * -0.012),
		];
		torso.add(tube(pts, 0.019, M.belt, 0.006));
	}
	// Behind the neck, the collar joins.
	torso.add(tube([V(-0.05, 0.585, 0.035), V(-0.068, 0.588, 0), V(-0.05, 0.585, -0.035)], 0.019, M.belt, 0.006));

	// The wrap's overlap, running from the V down to the belt, and a few creases.
	torso.add(tube([V(frontX(0.34) + 0.003, 0.34, -0.01), V(frontX(0.22) + 0.004, 0.22, -0.045), V(frontX(0.1) + 0.004, 0.1, -0.08)], 0.0035, M.ink));
	if (detail) {
		const creases: [number, number, number][][] = [
			[[0.4, 0.13, 0], [0.37, 0.1, 0], [0.35, 0.07, 0]],
			[[0.4, -0.13, 0], [0.37, -0.1, 0], [0.35, -0.07, 0]],
			[[0.24, 0.12, 0], [0.22, 0.08, 0], [0.21, 0.04, 0]],
			[[0.2, -0.12, 0], [0.18, -0.09, 0], [0.17, -0.05, 0]],
		];
		for (const c of creases) torso.add(tube(c.map(([y, z]) => V(frontX(y) + 0.003, y, z)), 0.0028, M.crease));
	}

	// The flag patch on the chest, drawn on a little canvas.
	if (detail) {
		const c = document.createElement('canvas');
		c.width = c.height = 128;
		const g = c.getContext('2d');
		if (g) {
			g.fillStyle = '#1a1210';
			g.beginPath();
			g.arc(64, 64, 63, 0, Math.PI * 2);
			g.fill();
			g.fillStyle = '#fff';
			g.beginPath();
			g.arc(64, 64, 58, 0, Math.PI * 2);
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
		}
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		const patch = at(mesh(new THREE.CircleGeometry(0.034, 32), new THREE.MeshBasicMaterial({ map: tex, transparent: true })), frontX(0.4) - 0.012, 0.4, -0.098);
		patch.rotation.y = Math.PI / 2 - 0.62;
		torso.add(patch);
	}

	// ── Belt: two wraps, a square knot, and tails cut square at the ends ──
	const belt = new THREE.Group();
	belt.scale.set(DEPTH, 1, 1);
	torso.add(belt);
	belt.add(at(part(new THREE.CylinderGeometry(0.166, 0.163, 0.04, seg, 1, true), M.belt, 0.008), 0, 0.08, 0));
	belt.add(at(part(new THREE.CylinderGeometry(0.167, 0.165, 0.04, seg, 1, true), M.beltHi, 0.008), 0, 0.04, 0));
	const knotX = frontX(0.06) + 0.012;
	const knot = at(new THREE.Group(), knotX, 0.06, 0);
	torso.add(knot);
	knot.add(part(new THREE.BoxGeometry(0.04, 0.075, 0.06), M.belt, 0.008));
	const cross = at(part(new THREE.BoxGeometry(0.03, 0.09, 0.03), M.beltHi, 0.006), 0.018, 0, 0);
	cross.rotation.x = 0.7;
	knot.add(cross);
	const tails: T.Group[] = [];
	for (const side of [1, -1]) {
		const tail = at(new THREE.Group(), knotX + 0.004, 0.03, side * 0.016);
		const strip = at(part(new THREE.BoxGeometry(0.018, 0.17, 0.034), M.belt, 0.006), 0, -0.085, 0);
		tail.add(strip);
		if (detail) tail.add(at(mesh(new THREE.BoxGeometry(0.02, 0.008, 0.036), M.gold), 0.001, -0.15, 0));
		tail.rotation.x = side * 0.24;
		torso.add(tail);
		tails.push(tail);
	}
	if (detail) {
		// Gold embroidery on the band.
		const stitch = at(mesh(new THREE.BoxGeometry(0.01, 0.008, 0.07), M.gold), frontX(0.07) - 0.004, 0.075, -0.1);
		stitch.rotation.y = -0.5;
		torso.add(stitch);
	}

	// ── Neck and head ──
	torso.add(at(part(new THREE.CylinderGeometry(0.056, 0.066, 0.1, 16), M.skinDark, 0), 0, 0.58, 0));
	const head = at(new THREE.Group(), 0, 0.74, 0);
	body.add(head);
	const skull = part(sphere(0.152), M.skin);
	skull.scale.set(0.98, 1.04, 0.93);
	head.add(skull);
	// The jaw and chin, narrower than the skull.
	const jaw = at(part(sphere(0.118), M.skin, 0.022), 0.03, -0.062, 0);
	jaw.scale.set(0.98, 0.86, 0.98);
	head.add(jaw);
	// Ears, with a rim.
	for (const side of [1, -1]) {
		const ear = at(new THREE.Group(), -0.008, -0.005, side * 0.143);
		ear.add(part(sphere(0.03, 14, 10), M.skin, 0.01));
		ear.children[0].scale.set(0.7, 1.15, 0.45);
		const rim = mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 14, Math.PI * 1.5), M.skinDark);
		rim.rotation.set(0, 0, Math.PI * 0.3);
		rim.position.z = side * 0.008;
		ear.add(rim);
		head.add(ear);
	}

	// Stubble along the jaw and chin.
	const beard = mesh(new THREE.SphereGeometry(0.123, seg, 16, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.5), M.stubble);
	beard.position.set(0.03, -0.06, 0);
	beard.scale.set(1.0, 0.88, 1.0);
	beard.rotation.z = -0.3;
	head.add(beard);
	head.add(at(mesh(sphere(0.03, 14, 10), M.stubble), 0.128, -0.128, 0));

	// Nose: a bridge, a round tip and the nostrils.
	const nose = at(new THREE.Group(), 0.148, 0, 0);
	head.add(nose);
	const bridge = at(mesh(new THREE.CapsuleGeometry(0.011, 0.04, 4, 8), M.skin), 0.004, 0.012, 0);
	bridge.rotation.z = 0.25;
	nose.add(bridge);
	nose.add(at(mesh(sphere(0.02, 14, 10), M.skinDark), 0.014, -0.018, 0));
	for (const z of [0.016, -0.016]) nose.add(at(mesh(sphere(0.011, 10, 8), M.skinDark), 0.006, -0.026, z));

	// Moustache: a curve that dips at the ends.
	head.add(tube([V(0.142, -0.06, -0.042), V(0.152, -0.05, -0.016), V(0.155, -0.048, 0), V(0.152, -0.05, 0.016), V(0.142, -0.06, 0.042)], 0.009, M.hair));

	// Brows: thick, slightly arched.
	const brows = new THREE.Group();
	head.add(brows);
	for (const side of [1, -1]) {
		brows.add(tube([V(0.138, 0.05, side * 0.022), V(0.146, 0.06, side * 0.05), V(0.138, 0.054, side * 0.078)], 0.0085, M.hair));
	}

	// Eyes, open: white, brown iris, pupil, highlight, and a heavy upper lid.
	const eyesOpen = new THREE.Group();
	const irises = new THREE.Group();
	head.add(eyesOpen);
	for (const side of [1, -1]) {
		const z = side * 0.052;
		const white = at(mesh(sphere(0.022, 16, 12), M.white), 0.128, 0.02, z);
		white.scale.set(0.62, 0.78, 1.12);
		eyesOpen.add(white);
		const iris = at(new THREE.Group(), 0.14, 0.019, z);
		iris.add(mesh(sphere(0.0125, 14, 10), M.iris));
		iris.add(at(mesh(sphere(0.0065, 10, 8), M.ink), 0.005, 0, 0));
		iris.add(at(mesh(sphere(0.0032, 8, 6), M.white), 0.0085, 0.004, 0.003));
		irises.add(iris);
		const lid = at(mesh(new THREE.SphereGeometry(0.0235, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), M.skin), 0.129, 0.02, z);
		lid.scale.set(0.66, 0.85, 1.16);
		lid.rotation.z = -0.5;
		eyesOpen.add(lid);
		eyesOpen.add(tube([V(0.142, 0.026, z - 0.02), V(0.148, 0.03, z), V(0.142, 0.026, z + 0.02)], 0.0028, M.ink));
	}
	eyesOpen.add(irises);
	// Eyes, closed: a curved line each.
	const eyesClosed = new THREE.Group();
	for (const side of [1, -1]) {
		const z = side * 0.052;
		eyesClosed.add(tube([V(0.142, 0.022, z - 0.02), V(0.148, 0.014, z), V(0.142, 0.022, z + 0.02)], 0.0035, M.ink));
	}
	eyesClosed.visible = false;
	head.add(eyesClosed);

	// Lips: a gentle closed smile, or a sleepy little "o".
	const mouthSmile = at(new THREE.Group(), 0, 0, 0);
	mouthSmile.add(tube([V(0.143, -0.076, -0.03), V(0.152, -0.082, -0.012), V(0.153, -0.083, 0), V(0.152, -0.082, 0.012), V(0.143, -0.076, 0.03)], 0.0042, M.lipDark));
	mouthSmile.add(tube([V(0.145, -0.088, -0.02), V(0.151, -0.093, 0), V(0.145, -0.088, 0.02)], 0.0075, M.lip));
	head.add(mouthSmile);
	const mouthSleep = at(new THREE.Group(), 0.15, -0.085, 0);
	mouthSleep.add(mesh(sphere(0.012, 10, 8), M.lipDark));
	mouthSleep.visible = false;
	head.add(mouthSleep);

	// ── Hair: a base, then locks that sweep from the crown to his left, with a
	//    fringe over the forehead and silver strands on that side ──
	const hair = new THREE.Group();
	head.add(hair);
	const base = part(new THREE.SphereGeometry(0.168, seg, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), M.hair, 0.02);
	base.position.set(-0.02, 0.02, 0);
	base.rotation.z = 0.18;
	base.scale.set(1.02, 1.0, 1.04);
	hair.add(base);
	const sideBurn = (side: number) =>
		hair.add(tube([V(-0.02, 0.07, side * 0.15), V(0.0, 0.02, side * 0.152), V(0.02, -0.03, side * 0.145)], 0.016, M.hair));
	sideBurn(1);
	sideBurn(-1);
	const lockCount = detail ? 26 : 14;
	for (let i = 0; i < lockCount; i++) {
		const f = i / (lockCount - 1); // 0 = his right, 1 = his left
		const z0 = -0.12 + f * 0.22;
		const lift = 0.18 + Math.sin(f * Math.PI) * 0.035;
		const curl = 0.02 + (i % 3) * 0.012;
		const silver = detail && f > 0.55 && i % 4 === 1;
		// Ends stay above the brows, so the fringe never covers his eyes.
		const pts = [
			V(-0.1, 0.12, z0 * 0.8),
			V(-0.02, lift, z0 * 0.95),
			V(0.07, lift - 0.025, z0 + 0.03),
			V(0.128, 0.135 - curl * 0.5, z0 + 0.065),
			V(0.148, 0.1 - curl * 0.35, z0 + 0.095 + (i % 2) * 0.015),
		];
		hair.add(tube(pts, silver ? 0.011 : 0.019 + (i % 3) * 0.003, silver ? M.silver : i % 5 === 0 ? M.hairHi : M.hair, silver ? 0 : 0.007));
	}
	// A few strands at the back and crown, for volume.
	for (let i = 0; i < (detail ? 8 : 4); i++) {
		const z = -0.11 + i * (0.22 / (detail ? 7 : 3));
		hair.add(tube([V(-0.14, 0.02, z), V(-0.13, 0.12, z * 0.9), V(-0.06, 0.18, z * 0.8)], 0.028, M.hair, 0.008));
	}

	// ── Sunglasses (sunny) and a bead of sweat (hot) ──
	const shades = new THREE.Group();
	for (const side of [1, -1]) {
		const lens = at(part(new THREE.BoxGeometry(0.014, 0.042, 0.058), M.shade, 0.006), 0.156, 0.02, side * 0.052);
		shades.add(lens);
		const glint = at(mesh(new THREE.BoxGeometry(0.002, 0.006, 0.02), M.lens), 0.164, 0.03, side * 0.052 - 0.008);
		shades.add(glint);
		shades.add(at(mesh(new THREE.BoxGeometry(0.15, 0.007, 0.007), M.shade), 0.08, 0.034, side * 0.142));
	}
	shades.add(at(mesh(new THREE.BoxGeometry(0.01, 0.008, 0.05), M.shade), 0.158, 0.036, 0));
	shades.visible = false;
	head.add(shades);
	const sweat = at(new THREE.Group(), 0.1, 0.085, -0.13);
	const drop = mesh(new THREE.SphereGeometry(0.02, 14, 10), M.sweat);
	drop.scale.set(0.8, 1.3, 0.8);
	sweat.add(drop);
	sweat.visible = false;
	head.add(sweat);

	// ── Limbs: a pivot group per joint, so a rotation swings everything below ──
	const fist = (mat: T.Material) => {
		const g = new THREE.Group();
		const palm = part(sphere(0.046, 16, 12), mat, 0.012);
		palm.scale.set(0.9, 1.1, 0.95);
		g.add(palm);
		// Four curled fingers across the front, and a thumb.
		for (let i = 0; i < 4; i++) {
			const knuckle = at(part(new THREE.CapsuleGeometry(0.0125, 0.024, 4, 8), mat, 0.006), 0.034, -0.012, -0.024 + i * 0.016);
			knuckle.rotation.x = Math.PI / 2;
			g.add(knuckle);
		}
		const thumb = at(part(new THREE.CapsuleGeometry(0.012, 0.03, 4, 8), mat, 0.006), 0.026, 0.012, 0.036);
		thumb.rotation.set(0.4, 0, -0.9);
		g.add(thumb);
		return g;
	};
	const arm = (z: number, mat: T.Material) => {
		const shoulder = at(new THREE.Group(), 0, 0.49, z);
		// A wide dobok sleeve, flaring a little to the cuff.
		const sleeve = part(
			new THREE.LatheGeometry(
				[
					// Bottom to top, so the faces point outwards.
					[0.074, -0.29],
					[0.076, -0.27],
					[0.068, -0.18],
					[0.062, -0.08],
					[0.06, 0.02],
				].map(([r, y]) => new THREE.Vector2(r, y)),
				seg,
			),
			mat,
		);
		shoulder.add(sleeve);
		if (detail) shoulder.add(tube([V(0.05, -0.12, -0.03), V(0.06, -0.14, 0), V(0.05, -0.16, 0.03)], 0.0025, M.crease));
		shoulder.add(at(part(new THREE.TorusGeometry(0.072, 0.008, 6, seg), M.gi, 0.004), 0, -0.285, 0)).children.at(-1)!.rotation.set(Math.PI / 2, 0, 0);
		shoulder.add(at(part(new THREE.CylinderGeometry(0.03, 0.034, 0.05, 12), M.skin, 0), 0, -0.3, 0));
		shoulder.add(at(fist(M.skin), 0, -0.35, 0));
		body.add(shoulder);
		return shoulder;
	};
	const leg = (z: number, mat: T.Material) => {
		const hip = at(new THREE.Group(), 0, 0.02, z);
		hip.add(at(capsule(0.076, 0.24, mat), 0, -0.19, 0));
		const knee = at(new THREE.Group(), 0, -0.38, 0);
		hip.add(knee);
		knee.add(at(capsule(0.068, 0.22, mat), 0, -0.17, 0));
		// A bare foot: sole, then toes.
		const foot = at(new THREE.Group(), 0.04, -0.36, 0);
		const sole = part(sphere(0.05, 14, 10), M.skin, 0.012);
		sole.scale.set(1.8, 0.62, 0.9);
		foot.add(sole);
		for (let i = 0; i < 3; i++) foot.add(at(mesh(sphere(0.014, 8, 6), M.skin), 0.082, -0.004, -0.022 + i * 0.022));
		knee.add(foot);
		body.add(hip);
		return { hip, knee };
	};
	// Front limbs sit nearer the camera (+z), back limbs further.
	const front = { ...(legs ? leg(0.085, M.gi) : {}), arm: arm(0.218, M.gi) };
	const back = { ...(legs ? leg(-0.085, M.giShade) : {}), arm: arm(-0.218, M.giShade) };

	return { body, head, torso, front, back, eyesOpen, eyesClosed, mouthSmile, mouthSleep, shades, sweat, irises, brows, tails, hair };
}

/** Lights that suit the toon shading: sky, a warm key, and a cool rim from behind. */
export function addToonLights(THREE: Three, scene: T.Scene) {
	scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.5));
	const key = new THREE.DirectionalLight(0xfff4e6, 2.1);
	key.position.set(2, 3, 2.5);
	scene.add(key);
	const rim = new THREE.DirectionalLight(0x9fb8ff, 1.3);
	rim.position.set(-2.5, 1.5, -2);
	scene.add(rim);
}
