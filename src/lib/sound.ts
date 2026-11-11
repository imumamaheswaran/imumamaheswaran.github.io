// Tiny synthesised sound effects (no audio files). Sounds only ever play in
// response to a click or key press, and the header toggle turns them off.

const KEY = 'sound';
let ctx: AudioContext | undefined;

export function soundOn(): boolean {
	try {
		return localStorage.getItem(KEY) !== 'off';
	} catch {
		return true;
	}
}

export function setSound(on: boolean) {
	try {
		localStorage.setItem(KEY, on ? 'on' : 'off');
	} catch {}
}

function audio(): AudioContext | undefined {
	if (!soundOn()) return undefined;
	try {
		ctx ??= new AudioContext();
		if (ctx.state === 'suspended') void ctx.resume();
		return ctx;
	} catch {
		return undefined;
	}
}

function noise(a: AudioContext, seconds: number) {
	const buf = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
	const src = a.createBufferSource();
	src.buffer = buf;
	return src;
}

function env(a: AudioContext, peak: number, attack: number, decay: number) {
	const g = a.createGain();
	const t = a.currentTime;
	g.gain.setValueAtTime(0.0001, t);
	g.gain.exponentialRampToValueAtTime(peak, t + attack);
	g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
	g.connect(a.destination);
	return g;
}

/** A board cracking: a woody snap over a low thump. */
export function thwack() {
	const a = audio();
	if (!a) return;
	const t = a.currentTime;
	const snap = noise(a, 0.18);
	const bp = a.createBiquadFilter();
	bp.type = 'bandpass';
	bp.frequency.value = 1400;
	bp.Q.value = 0.9;
	snap.connect(bp).connect(env(a, 0.5, 0.002, 0.16));
	snap.start(t);

	const thump = a.createOscillator();
	thump.frequency.setValueAtTime(140, t);
	thump.frequency.exponentialRampToValueAtTime(45, t + 0.18);
	thump.connect(env(a, 0.6, 0.004, 0.2));
	thump.start(t);
	thump.stop(t + 0.25);
}

/** A belt swishing through the air. */
export function whoosh() {
	const a = audio();
	if (!a) return;
	const t = a.currentTime;
	const n = noise(a, 0.3);
	const bp = a.createBiquadFilter();
	bp.type = 'bandpass';
	bp.Q.value = 1.4;
	bp.frequency.setValueAtTime(400, t);
	bp.frequency.exponentialRampToValueAtTime(2200, t + 0.22);
	n.connect(bp).connect(env(a, 0.18, 0.06, 0.2));
	n.start(t);
}

/** A soft tick for small UI moments. */
export function tick() {
	const a = audio();
	if (!a) return;
	const t = a.currentTime;
	const o = a.createOscillator();
	o.type = 'triangle';
	o.frequency.setValueAtTime(1800, t);
	o.connect(env(a, 0.08, 0.002, 0.04));
	o.start(t);
	o.stop(t + 0.06);
}
