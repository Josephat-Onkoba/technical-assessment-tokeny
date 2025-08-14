import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.scrollTo used in dashboards (override unconditionally)
// eslint-disable-next-line @typescript-eslint/no-empty-function
window.scrollTo = vi.fn();

// Mock canvas for Chart.js in jsdom
if (typeof HTMLCanvasElement !== 'undefined') {
	HTMLCanvasElement.prototype.getContext = HTMLCanvasElement.prototype.getContext || (() => ({
		// minimal stub
		fillRect: () => {},
		clearRect: () => {},
		getImageData: () => ({ data: [] }),
		putImageData: () => {},
		createImageData: () => [],
		setTransform: () => {},
		drawImage: () => {},
		save: () => {},
		fillText: () => {},
		restore: () => {},
		beginPath: () => {},
		moveTo: () => {},
		lineTo: () => {},
		closePath: () => {},
		stroke: () => {},
		translate: () => {},
		scale: () => {},
		rotate: () => {},
		arc: () => {},
		fill: () => {},
		measureText: () => ({ width: 0 }),
		transform: () => {},
		rect: () => {},
		clip: () => {},
	}));
}

// Mock react-chartjs-2 to avoid rendering charts in tests
vi.mock('react-chartjs-2', () => {
	const Mock = () => null;
	return { Bar: Mock, Line: Mock, Pie: Mock, Doughnut: Mock, Radar: Mock, PolarArea: Mock, Bubble: Mock, Scatter: Mock };
});
