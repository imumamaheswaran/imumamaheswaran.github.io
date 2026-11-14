/**
 * The hero's toon, in 3D. Swaps in over the SVG drawing once Three.js has
 * loaded, in the same box, so the callouts still point at the head and belt.
 *
 * Alive: he breathes, blinks, turns a little to follow the pointer, leans in
 * when you hover, and hops when clicked. The scene classes on the figure
 * (s-sleep, s-sunny, s-hot) close his eyes, put on shades or add a bead of
 * sweat. With reduced motion he stays still and only redraws on change.
 */
import { addToonLights, buildToon } from './toon3d';

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
	// Framed from just above the hair to below the belt, like the drawing.
	const camera = new THREE.PerspectiveCamera(26, 320 / 410, 0.1, 20);
	const LOOK = new THREE.Vector3(0, 0.44, 0);
	camera.position.set(0, 0.6, 2.7);
	camera.lookAt(LOOK);
	addToonLights(THREE, scene);

	const t = buildToon(THREE, { legs: false, detail: true });
	scene.add(t.body);
	// Arms hang at the sides, a touch out from the body.
	t.front.arm.rotation.set(-0.12, 0, 0.04);
	t.back.arm.rotation.set(0.12, 0, 0.04);
	// The model faces +x; turn it to face the camera.
	const FACE = -Math.PI / 2;

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
		t.eyesOpen.visible = !flags.sleep && !flags.shades;
		t.eyesClosed.visible = flags.sleep;
		t.mouthSmile.visible = !flags.sleep;
		t.mouthSleep.visible = flags.sleep;
		t.shades.visible = flags.shades && !flags.sleep;
		t.sweat.visible = flags.sweat && !flags.sleep;
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
	const IRIS_HOME = t.irises.children.map((c) => c.position.clone());
	const BROWS_Y = t.brows.position.y;
	const HAIR_Y = t.hair.position.y;

	// ── Animate ──
	let yaw = 0;
	let pitch = 0;
	let fov = 26;
	let blinkAt = performance.now() + 2500;
	function draw(now: number) {
		const s = now / 1000;
		const idle = now - lastMove > 2500;
		const followYaw = flags.sleep ? 0 : idle ? Math.sin(s * 0.5) * 0.22 : aimYaw;
		const followPitch = flags.sleep ? 0 : idle ? 0 : aimPitch;
		const k = still ? 1 : 0.08;
		yaw += (followYaw - yaw) * k;
		pitch += (followPitch - pitch) * k;
		t.body.rotation.y = FACE + yaw * 0.6;
		t.head.rotation.y = yaw * 0.5;
		// Head nods about the model's z: down when asleep, after the pointer otherwise.
		t.head.rotation.z = flags.sleep ? -0.28 + Math.sin(s * 0.8) * 0.03 : -pitch;

		// Breathing: slow and deep when asleep.
		const breath = still ? 0 : Math.sin(s * (flags.sleep ? 1.1 : 2)) * (flags.sleep ? 0.02 : 0.012);
		t.torso.scale.set(1 + breath * 0.6, 1 + breath, 1 + breath * 0.6);
		t.head.position.y = 0.74 + breath * 0.5;

		// Blink every few seconds.
		if (!still && !flags.sleep && now > blinkAt) {
			t.eyesOpen.scale.y = 0.1;
			if (now > blinkAt + 120) {
				t.eyesOpen.scale.y = 1;
				blinkAt = now + 2500 + Math.random() * 3500;
			}
		}

		// Click: a little hop, a wider smile, and the hair bounces after.
		const hop = (now - hopAt) / 450;
		const hopping = hop >= 0 && hop < 1 && !still;
		t.body.position.y = hopping ? Math.sin(hop * Math.PI) * 0.08 : 0;
		t.hair.position.y = HAIR_Y + (hopping ? -Math.sin(hop * Math.PI * 2) * 0.008 : 0);
		const grin = (now - hopAt) / 1400;
		const smile = grin >= 0 && grin < 1 ? 1 + Math.sin(grin * Math.PI) * 0.35 : 1;
		t.mouthSmile.scale.set(1, 1, smile);

		// Eyes look towards the pointer; brows lift a touch when you hover.
		for (const [i, iris] of t.irises.children.entries()) {
			const home = IRIS_HOME[i];
			iris.position.set(home.x, home.y - pitch * 0.02, home.z - yaw * 0.012);
		}
		t.brows.position.y = BROWS_Y + (hovering && !flags.sleep ? 0.006 : 0);

		// Arms and belt tails sway with the breath.
		if (!still) {
			const sway = Math.sin(s * 1.3);
			t.front.arm.rotation.z = 0.04 + sway * 0.025;
			t.back.arm.rotation.z = 0.04 - sway * 0.025;
			t.tails.forEach((tail, i) => (tail.rotation.z = Math.sin(s * 1.7 + i) * 0.06));
		}

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
