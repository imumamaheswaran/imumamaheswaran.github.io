/**
 * Uma in 3D: a rigged human model, shared by the hero and the kick buddy.
 *
 * The model (public/models/uma.glb, about 3 MB) is a MakeHuman 1.1 base mesh
 * (CC0) shaped and dressed to look like Uma: a round, full face, broad nose,
 * thick black hair swept up, a trimmed beard and moustache, medium-brown skin
 * and a stocky build, in a white dobok with a black collar and a black belt.
 * See public/models/CREDITS.md for where every part comes from.
 *
 * The skeleton is MakeHuman's default rig. Every bone's rest rotation is the
 * identity, so a bone's local axes are the model's axes: +y up, +z forward
 * (he faces +z) and +x his left. Hips sit near y = 0, feet at y ≈ -0.82 and
 * the top of the hair at y ≈ 0.88 (metres).
 *
 * Limbs are posed by aiming them: give a bone the direction (in model space)
 * its segment should point, and it turns the shortest way there.
 */
import type * as T from 'three';

type Three = typeof import('three');

export const MODEL_URL = '/models/uma.glb';

export type Side = 'L' | 'R';

export type Avatar = {
	/** The whole figure. Turn it, move it or scale it. */
	root: T.Group;
	bone: (name: string) => T.Bone;
	/**
	 * Point a limb segment along `dir` (model space, needn't be unit length).
	 * Segments: 'arm', 'forearm', 'thigh', 'shin'. Pose parents first.
	 */
	aim: (seg: 'arm' | 'forearm' | 'thigh' | 'shin', side: Side, dir: T.Vector3) => void;
	/** 0 = open hand, 1 = fist. */
	hand: (side: Side, curl: number) => void;
	/** 0 = open, 1 = shut. */
	blink: (v: number) => void;
	/** 0 = relaxed mouth, 1 = a closed-mouth smile. */
	smile: (v: number) => void;
	/** Look about: yaw (left/right) and pitch (up/down), radians. */
	gaze: (yaw: number, pitch: number) => void;
	/** Sunglasses and a bead of sweat, for the hero's scenes. */
	shades: T.Group;
	sweat: T.Mesh;
	/** Put every bone back to its rest pose. */
	reset: () => void;
};

let gltfPromise: Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF> | null = null;
let used = false;

/** Load the model once; each caller gets its own copy with its own skeleton. */
export async function loadAvatar(THREE: Three): Promise<Avatar> {
	gltfPromise ??= import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader().loadAsync(MODEL_URL));
	const gltf = await gltfPromise;
	let scene = gltf.scene;
	if (used) {
		const { clone } = await import('three/examples/jsm/utils/SkeletonUtils.js');
		scene = clone(gltf.scene) as T.Group;
	}
	used = true;
	return rig(THREE, scene);
}

function rig(THREE: Three, model: T.Group): Avatar {
	const root = new THREE.Group();
	root.add(model);
	const bones = new Map<string, T.Bone>();
	model.traverse((o) => {
		if ((o as T.Bone).isBone) bones.set(o.name, o as T.Bone);
		const m = o as T.SkinnedMesh;
		if (m.isMesh) {
			m.castShadow = true;
			m.receiveShadow = true;
			// Poses swing limbs far outside the rest-pose bounds.
			m.frustumCulled = false;
			const mat = m.material as T.MeshStandardMaterial;
			if (mat.map) mat.map.anisotropy = 4;
			if (m.name === 'hair' || m.name === 'brows' || m.name === 'lashes') mat.alphaToCoverage = false;
		}
	});
	const bone = (name: string) => {
		const b = bones.get(name.replace(/\./g, '_'));
		if (!b) throw new Error(`no bone ${name}`);
		return b;
	};

	// Rest positions, in model space (bones have no rest rotation, so a
	// segment's rest direction is simply child minus parent).
	model.updateWorldMatrix(true, true);
	const toModel = new THREE.Matrix4().copy(model.matrixWorld).invert();
	const restPos = (b: T.Bone) => b.getWorldPosition(new THREE.Vector3()).applyMatrix4(toModel);
	const SEG = {
		arm: ['upperarm01', 'lowerarm01'],
		forearm: ['lowerarm01', 'wrist'],
		thigh: ['upperleg01', 'lowerleg01'],
		shin: ['lowerleg01', 'foot'],
	} as const;
	const rest = new Map<string, T.Vector3>();
	for (const side of ['L', 'R'] as Side[])
		for (const [seg, [a, b]] of Object.entries(SEG)) rest.set(`${seg}.${side}`, restPos(bone(`${b}.${side}`)).sub(restPos(bone(`${a}.${side}`))).normalize());

	// Model-space rotation of a bone's parent, from the current pose.
	const parentQ = (b: T.Bone) => {
		const q = new THREE.Quaternion();
		let p = b.parent;
		const chain: T.Object3D[] = [];
		while (p && p !== model) {
			chain.unshift(p);
			p = p.parent;
		}
		for (const o of chain) q.multiply(o.quaternion);
		return q;
	};
	const tmpQ = new THREE.Quaternion();
	const tmpV = new THREE.Vector3();
	const aim: Avatar['aim'] = (seg, side, dir) => {
		const b = bone(`${SEG[seg][0]}.${side}`);
		tmpQ.setFromUnitVectors(rest.get(`${seg}.${side}`)!, tmpV.copy(dir).normalize());
		b.quaternion.copy(parentQ(b).invert().multiply(tmpQ));
	};

	// Fingers curl about the axis across the knuckles.
	const across = new Map<Side, T.Vector3>();
	for (const side of ['L', 'R'] as Side[]) across.set(side, restPos(bone(`finger2-1.${side}`)).sub(restPos(bone(`finger5-1.${side}`))).normalize());
	const FINGERS = [2, 3, 4, 5].flatMap((f) => [1, 2, 3].map((j) => `finger${f}-${j}`));
	const curlAxis = new Map<string, T.Vector3>();
	for (const side of ['L', 'R'] as Side[])
		for (const f of [2, 3, 4, 5]) {
			const dir = restPos(bone(`finger${f}-2.${side}`)).sub(restPos(bone(`finger${f}-1.${side}`))).normalize();
			// Curl is towards the palm; on his right hand the knuckle axis runs the other way.
			const ax = new THREE.Vector3().crossVectors(across.get(side)!, dir).normalize();
			if (side === 'R') ax.negate();
			for (const j of [1, 2, 3]) curlAxis.set(`finger${f}-${j}.${side}`, ax);
		}
	// The thumb sits at a different angle, so it folds about the other way on the right.
	const thumbAxis = new Map<Side, T.Vector3>();
	for (const side of ['L', 'R'] as Side[]) thumbAxis.set(side, curlAxis.get(`finger2-1.${side}`)!.clone().multiplyScalar(side === 'R' ? -1 : 1));
	const hand: Avatar['hand'] = (side, curl) => {
		for (const f of FINGERS) {
			const n = `${f}.${side}`;
			const j = Number(f.at(-1));
			bone(n).quaternion.setFromAxisAngle(curlAxis.get(n)!, curl * (j === 1 ? 1.35 : j === 2 ? 1.6 : 1.1));
		}
		// The thumb tucks in over the fingers.
		const ax = thumbAxis.get(side)!;
		bone(`finger1-1.${side}`).quaternion.setFromAxisAngle(ax, curl * 0.5);
		bone(`finger1-2.${side}`).quaternion.setFromAxisAngle(ax, curl * 0.6);
		bone(`finger1-3.${side}`).quaternion.setFromAxisAngle(ax, curl * 0.5);
	};

	// Upper lids close over the eye; the lower lids rise a little to meet them.
	const blink: Avatar['blink'] = (v) => {
		for (const side of ['L', 'R'] as Side[]) {
			bone(`orbicularis03.${side}`).rotation.x = v * 0.55;
			bone(`orbicularis04.${side}`).rotation.x = -v * 0.12;
		}
	};
	// Smile: the mouth corners go up, out and back, and the cheeks lift.
	const SMILE: [string, number, number, number][] = [
		['oris03', 0.006, 0.008, -0.005],
		['levator05', 0.004, 0.006, -0.004],
		['risorius03', 0.0015, 0.004, 0.002],
	];
	const smileRest = new Map<string, T.Vector3>();
	for (const [n] of SMILE) for (const side of ['L', 'R'] as Side[]) smileRest.set(`${n}.${side}`, bone(`${n}.${side}`).position.clone());
	const smile: Avatar['smile'] = (v) => {
		for (const [n, x, y, z] of SMILE)
			for (const side of ['L', 'R'] as Side[]) {
				const k = `${n}.${side}`;
				bone(k).position.copy(smileRest.get(k)!).add(tmpV.set((side === 'L' ? x : -x) * v, y * v, z * v));
			}
	};
	const gaze: Avatar['gaze'] = (yaw, pitch) => {
		for (const side of ['L', 'R'] as Side[]) bone(`eye.${side}`).rotation.set(pitch, yaw, 0, 'YXZ');
	};

	// ── Props on the head ──
	const head = bone('head');
	const headPos = restPos(head);
	const fabric = (color: number, roughness: number) => new THREE.MeshStandardMaterial({ color, roughness });
	const shades = new THREE.Group();
	const lensMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0c10, roughness: 0.08, metalness: 0.3, clearcoat: 1 });
	const frameMat = fabric(0x111111, 0.4);
	for (const x of [-1, 1]) {
		const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.003, 28), lensMat);
		lens.scale.set(1.2, 1, 0.82);
		lens.rotation.set(Math.PI / 2, x * 0.12, 0);
		lens.position.set(x * 0.032, 0.752 - headPos.y, 0.152 - headPos.z);
		shades.add(lens);
		const arm = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.004, 0.11), frameMat);
		arm.position.set(x * 0.074, 0.758 - headPos.y, 0.1 - headPos.z);
		arm.rotation.y = x * 0.06;
		shades.add(arm);
	}
	const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.004, 0.004), frameMat);
	bridge.position.set(0, 0.758 - headPos.y, 0.158 - headPos.z);
	shades.add(bridge);
	shades.visible = false;
	head.add(shades);
	const sweat = new THREE.Mesh(
		new THREE.SphereGeometry(0.006, 12, 10),
		new THREE.MeshPhysicalMaterial({ color: 0xbfe3ff, roughness: 0.05, transmission: 0.6, thickness: 0.01, clearcoat: 1 }),
	);
	sweat.scale.set(1, 1.5, 0.7);
	sweat.position.set(-0.074, 0.79 - headPos.y, 0.1 - headPos.z);
	sweat.visible = false;
	head.add(sweat);

	const reset = () => bones.forEach((b) => b.quaternion.identity());

	return { root, bone, aim, hand, blink, smile, gaze, shades, sweat, reset };
}

/** Lights and environment, the same for the hero and the kick buddy. */
export async function setupStage(THREE: Three, renderer: T.WebGLRenderer, scene: T.Scene, opts: { shadowSize?: number } = {}) {
	const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
	renderer.toneMapping = THREE.NeutralToneMapping;
	renderer.toneMappingExposure = 1.1;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	const pmrem = new THREE.PMREMGenerator(renderer);
	const room = new RoomEnvironment();
	scene.environment = pmrem.fromScene(room, 0.04).texture;
	scene.environmentIntensity = 0.45;
	room.dispose();
	pmrem.dispose();

	scene.add(new THREE.HemisphereLight(0xfff6ee, 0x5a4d45, 0.3));
	// The key comes from high on the right, so the face and folds model.
	const key = new THREE.DirectionalLight(0xfff1e2, 2.6);
	key.position.set(1.6, 2.6, 2.4);
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
	const rim = new THREE.DirectionalLight(0xb9ccff, 1.4);
	rim.position.set(-2.2, 1.8, -2.4);
	scene.add(rim);
	const fill = new THREE.DirectionalLight(0xffe2cc, 0.35);
	fill.position.set(-2, 0.4, 2);
	scene.add(fill);
}
