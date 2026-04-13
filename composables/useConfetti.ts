import type { Options } from 'canvas-confetti';

function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Fires a fireworks confetti effect for a given duration (ms).
 * Only runs client-side.
 */
export async function fireConfettiFireworks(durationMs: number = 5000): Promise<void> {
    if (typeof window === 'undefined') 
        return;

    const confetti = (await import('canvas-confetti')).default;
    const animationEnd = Date.now() + durationMs;

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        const particleCount = Math.floor(50 * (timeLeft / durationMs));
        const sharedOptions: Options = {
            particleCount,
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999,
            disableForReducedMotion: true,
        };

        confetti({ ...sharedOptions, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...sharedOptions, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
}
