import type { StreetViewMetadata } from '../maps/types';

interface HudProps {
	metadata: StreetViewMetadata;
	locationLabel: string | null;
}

function formatCoordinate(value: number): string {
	return value.toFixed(6);
}

function formatImageDate(imageDate: string | null): string | null {
	if (!imageDate) {
		return null;
	}

	const year = Number.parseInt(imageDate.slice(0, 4), 10);
	const month = Number.parseInt(imageDate.slice(4, 6), 10) - 1;
	const day = Number.parseInt(imageDate.slice(6, 8), 10);

	if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
		return imageDate;
	}

	return new Date(year, month, day).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

export function Hud({ metadata, locationLabel }: HudProps) {
	const captureDate = formatImageDate(metadata.imageDate);

	return (
		<aside className="hud" aria-live="polite">
			<div className="hud__section">
				<p className="hud__label">Location</p>
				<p className="hud__value">
					{locationLabel ?? metadata.description ?? 'Exploring'}
				</p>
			</div>
			<div className="hud__section">
				<p className="hud__label">Coordinates</p>
				<p className="hud__value hud__mono">
					{formatCoordinate(metadata.latitude)},{' '}
					{formatCoordinate(metadata.longitude)}
				</p>
			</div>
			{captureDate && (
				<div className="hud__section">
					<p className="hud__label">Street View capture</p>
					<p className="hud__value">{captureDate}</p>
				</div>
			)}
			<div className="hud__hint">
				<span>Drag to look around</span>
				<span className="hud__hint-desktop"> · W move · A/D turn</span>
			</div>
		</aside>
	);
}
