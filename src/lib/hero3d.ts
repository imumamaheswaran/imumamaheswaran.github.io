/**
 * The hero figure, in 3D. Swaps in over the SVG drawing once Three.js and the
 * model have loaded, in the same box, so the callouts still point at the head
 * and belt.
 *
 * Alive: he breathes (chest and shoulders), shifts his weight, blinks, darts
 * his eyes about, turns a little to follow the pointer, leans in when you
 * hover, and hops when clicked. The scene classes on the figure (s-sleep,
 * s-sunny, s-hot) close his eyes, put on shades or add a bead of sweat. With
 * reduced motion he stays still and only redraws on change.
 */
import { loadAvatar, setupStage } from './avatar3d';

export async function startHero3D(toon: HTMLElement, fig: HTMLElement) {
	if (toon.dataset.three) return;
	toon.dataset.three = '1';
	const holder = toon.querySelector<HTMLElement>('.toon-body');
	if (!holder) return;

	const THREE = await import('three');
	const canvas = document.createElement('canvas');
	canvas.className = 'toon-3d';
	canvas.setAttribute('aria-hidden', 'true');
	let renderer: import('three').WebGLRenderer;
	try {
		renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
	} catch {
		return;
	}
	renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
	const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

	const scene = new THREE.Scene();
	// Framed from just above the hair to below the belt, like the drawing:
	// the head sits a fifth of the way down and the belt four fifths.
	const camera = new THREE.PerspectiveCamera(26, 320 / 410, 0.1, 20);
	const LOOK = new THREE.Vector3(0, 0.44, 0);
	camera.position.set(0, 0.56, 2.35);
	camera.lookAt(LOOK);
	await setupStage(THREE, renderer, scene, { shadowSize: 1024 });

	let a: Awaited<ReturnType<typeof loadAvatar>>;
	try {
		a = await loadAvatar(THREE);
	} catch {
		delete toon.dataset.three;
		renderer.dispose();
		return;
	}
	scene.add(a.root);
	const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
	// Arms hang at the sides, clear of the jacket, elbows soft, hands relaxed.
	const hang = (sway: number) => {
		a.aim('arm', 'L', V(0.21 + sway, -1, 0.02));
		a.aim('forearm', 'L', V(0.13 + sway, -1, 0.12));
		a.aim('arm', 'R', V(-0.21 + sway, -1, 0.02));
		a.aim('forearm', 'R', V(-0.13 + sway, -1, 0.12));
	};
	hang(0);
	a.hand('L', 0.25);
	a.hand('R', 0.25);
	const neck = a.bone('neck02');
	const head = a.bone('head');
	const chest = a.bone('spine02');
	const clavL = a.bone('clavicle.L');
	const clavR = a.bone('clavicle.R');

	const size = () => {
		const r = holder.getBoundingClientRect();
		if (!r.width || !r.height) return;
		renderer.setSize(r.width, r.height, false);
		camera.aspect = r.width / r.height;
		camera.updateProjectionMatrix();
	};
	size();
	holder.append(canvas);

	// ── What the scene asks for ──
	const flags = { sleep: false, shades: false, sweat: false };
	const readScene = () => {
		flags.sleep = fig.classList.contains('s-sleep');
		flags.shades = fig.classList.contains('s-sunny') || fig.classList.contains('s-hot');
		flags.sweat = fig.classList.contains('s-hot');
		a.shades.visible = flags.shades && !flags.sleep;
		a.sweat.visible = flags.sweat && !flags.sleep;
		if (still) draw(performance.now());
	};

	// ── Pointer: turn towards it, a little ──
	let aimYaw = 0;
	let aimPitch = 0;
	let lastMove = 0;
	const onMove = (e: PointerEvent) => {
		const r = fig.getBoundingClientRect();
		const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(400, window.innerWidth / 2);
		const dy = (e.clientY - (r.top + r.height * 0.3)) / Math.max(400, window.innerHeight / 2);
		aimYaw = Math.max(-1, Math.min(1, dx)) * 0.45;
		aimPitch = Math.max(-1, Math.min(1, dy)) * 0.18;
		lastMove = performance.now();
	};
	let hovering = false;
	toon.addEventListener('pointerenter', () => (hovering = true));
	toon.addEventListener('pointerleave', () => (hovering = false));
	let hopAt = -1e9;
	toon.addEventListener('click', () => (hopAt = performance.now()));

	// ── Animate ──
	let yaw = 0;
	let pitch = 0;
	let fov = 26;
	let blinkAt = performance.now() + 2500;
	let lid = 0;
	// Eyes dart to a new spot every so often, then hold, like real eyes do.
	let saccadeAt = 0;
	const glance = { y: 0, z: 0 };
	const gaze = { y: 0, z: 0 };
	function draw(now: number) {
		const s = now / 1000;
		const idle = now - lastMove > 2500;
		const followYaw = flags.sleep ? 0 : idle ? Math.sin(s * 0.5) * 0.22 : aimYaw;
		const followPitch = flags.sleep ? 0 : idle ? 0 : aimPitch;
		const k = still ? 1 : 0.06;
		yaw += (followYaw - yaw) * k;
		pitch += (followPitch - pitch) * k;
		// Small, slow drift so he never holds perfectly still.
		const drift = still ? 0 : Math.sin(s * 0.37) * 0.02 + Math.sin(s * 0.91 + 1) * 0.01;
		a.root.rotation.y = yaw * 0.4;
		neck.rotation.set(pitch * 0.3, yaw * 0.25, 0);
		// Head nods down when asleep, after the pointer otherwise.
		const nod = flags.sleep ? 0.32 + Math.sin(s * 0.8) * 0.025 : pitch * 0.7 + drift * 0.5;
		head.rotation.set(nod, yaw * 0.35 + drift, still ? 0 : Math.sin(s * 0.29) * 0.025, 'YXZ');
		// Weight shifts from foot to foot: a slow sideways lean.
		a.root.rotation.z = still ? 0 : Math.sin(s * 0.33) * 0.012;

		// Breathing: the chest lifts and the shoulders rise. Slow and deep when asleep.
		const breath = still ? 0 : Math.sin(s * (flags.sleep ? 1.1 : 1.7)) * (flags.sleep ? 1 : 0.6);
		chest.rotation.x = -breath * 0.012;
		clavL.rotation.z = breath * 0.025;
		clavR.rotation.z = -breath * 0.025;

		// Blink every few seconds: a quick close and a slower open.
		if (flags.sleep) lid = 1;
		else if (still) lid = 0;
		else {
			const b = now - blinkAt;
			lid = b < 0 ? 0 : b < 70 ? b / 70 : b < 180 ? 1 - (b - 70) / 110 : 0;
			if (b >= 180) blinkAt = now + 2200 + Math.random() * 4000;
		}
		a.blink(lid);

		// Eyes lead the head towards the pointer, with little saccades on top.
		if (!still && now > saccadeAt) {
			glance.y = (Math.random() - 0.5) * 0.25;
			glance.z = (Math.random() - 0.5) * 0.12;
			saccadeAt = now + 600 + Math.random() * 1800;
		}
		const gy = yaw * 0.6 + glance.y;
		const gz = pitch * 1.2 + glance.z;
		gaze.y += (gy - gaze.y) * (still ? 1 : 0.35);
		gaze.z += (gz - gaze.z) * (still ? 1 : 0.35);
		a.gaze(gaze.y, gaze.z);

		// Click: a little hop and a wider smile. Otherwise a relaxed one, like the photo.
		const hop = (now - hopAt) / 450;
		const hopping = hop >= 0 && hop < 1 && !still;
		a.root.position.y = hopping ? Math.sin(hop * Math.PI) * 0.06 : 0;
		const grin = (now - hopAt) / 1400;
		a.smile(flags.sleep ? 0 : 0.5 + (grin >= 0 && grin < 1 ? Math.sin(grin * Math.PI) * 0.35 : 0));

		// Arms sway with the breath.
		if (!still) hang(Math.sin(s * 1.1) * 0.02);

		// Hover: lean in (a gentle zoom).
		const fovTarget = hovering && !still ? 23 : 26;
		fov += (fovTarget - fov) * (still ? 1 : 0.1);
		if (Math.abs(camera.fov - fov) > 0.01) {
			camera.fov = fov;
			camera.updateProjectionMatrix();
		}
		renderer.render(scene, camera);
	}

	// Only draw while he's on screen and the tab is visible.
	let visible = true;
	let frame = 0;
	const loop = (now: number) => {
		if (!canvas.isConnected) return stop();
		draw(now);
		frame = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
	};
	const start = () => {
		if (!still && !frame) frame = requestAnimationFrame(loop);
	};
	const io = new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		if (visible) start();
	});
	io.observe(holder);
	const onVis = () => !document.hidden && start();
	document.addEventListener('visibilitychange', onVis);
	const ro = new ResizeObserver(() => {
		size();
		if (still) draw(performance.now());
	});
	ro.observe(holder);
	const mo = new MutationObserver(readScene);
	mo.observe(fig, { attributes: true, attributeFilter: ['class'] });
	if (!still) window.addEventListener('pointermove', onMove, { passive: true });

	function stop() {
		cancelAnimationFrame(frame);
		io.disconnect();
		ro.disconnect();
		mo.disconnect();
		window.removeEventListener('pointermove', onMove);
		document.removeEventListener('visibilitychange', onVis);
		renderer.dispose();
	}

	readScene();
	draw(performance.now());
	// Swap the drawing for the model once the first frame is ready.
	requestAnimationFrame(() => toon.classList.add('is-3d'));
	start();
}
