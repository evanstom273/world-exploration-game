import { STREET_VIEW_SEARCH_RADIUS_METERS } from '../config/defaults';
import type { LatLngLiteral, StreetViewMetadata } from './types';
import { loadStreetViewLibrary } from './loader';

export interface PanoramaLookupResult {
	panoId: string;
	position: LatLngLiteral;
	heading: number;
}

function toLatLngLiteral(
	latLng: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined,
): LatLngLiteral | null {
	if (!latLng) {
		return null;
	}

	if (typeof (latLng as google.maps.LatLng).lat === 'function') {
		const point = latLng as google.maps.LatLng;
		return { lat: point.lat(), lng: point.lng() };
	}

	return latLng as LatLngLiteral;
}

async function createStreetViewService(): Promise<google.maps.StreetViewService> {
	const { StreetViewService } = await loadStreetViewLibrary();
	return new StreetViewService();
}

async function getStreetViewSource(): Promise<typeof google.maps.StreetViewSource> {
	const { StreetViewSource } = await loadStreetViewLibrary();
	return StreetViewSource;
}

export async function findPanoramaNear(
	location: LatLngLiteral,
	radiusMeters = STREET_VIEW_SEARCH_RADIUS_METERS,
): Promise<PanoramaLookupResult | null> {
	const service = await createStreetViewService();
	const StreetViewSource = await getStreetViewSource();

	const outdoorRequest: google.maps.StreetViewLocationRequest = {
		location,
		radius: radiusMeters,
		source: StreetViewSource.OUTDOOR,
	};

	try {
		const outdoor = await service.getPanorama(outdoorRequest);
		if (outdoor.data.location?.pano) {
			return panoramaDataToResult(outdoor.data);
		}
	} catch {
		// Fall through to default source.
	}

	const defaultRequest: google.maps.StreetViewLocationRequest = {
		location,
		radius: radiusMeters,
		source: StreetViewSource.DEFAULT,
	};

	try {
		const fallback = await service.getPanorama(defaultRequest);
		if (fallback.data.location?.pano) {
			return panoramaDataToResult(fallback.data);
		}
	} catch {
		return null;
	}

	return null;
}

function panoramaDataToResult(
	data: google.maps.StreetViewPanoramaData,
): PanoramaLookupResult | null {
	const panoId = data.location?.pano;
	const position = toLatLngLiteral(data.location?.latLng);

	if (!panoId || !position) {
		return null;
	}

	return {
		panoId,
		position,
		heading: data.tiles?.centerHeading ?? 0,
	};
}

export async function getPanoramaMetadata(
	panoId: string,
): Promise<StreetViewMetadata | null> {
	const service = await createStreetViewService();

	try {
		const { data } = await service.getPanorama({ pano: panoId });
		const position = toLatLngLiteral(data.location?.latLng);

		if (!position) {
			return null;
		}

		return {
			latitude: position.lat,
			longitude: position.lng,
			description: data.location?.description ?? null,
			imageDate: data.imageDate ?? null,
			panoId: data.location?.pano ?? panoId,
		};
	} catch {
		return null;
	}
}

export function metadataFromPanorama(
	panorama: google.maps.StreetViewPanorama,
): StreetViewMetadata {
	const position = toLatLngLiteral(panorama.getPosition());
	const location = panorama.getLocation();

	return {
		latitude: position?.lat ?? 0,
		longitude: position?.lng ?? 0,
		description: location?.description ?? null,
		imageDate: null,
		panoId: panorama.getPano() ?? null,
	};
}

export function normalizeHeading(degrees: number): number {
	return ((degrees % 360) + 360) % 360;
}

export function headingDifference(a: number, b: number): number {
	const diff = Math.abs(normalizeHeading(a) - normalizeHeading(b));
	return diff > 180 ? 360 - diff : diff;
}

export function findBestForwardLink(
	links: google.maps.StreetViewLink[],
	viewHeading: number,
	maxAngleDegrees: number,
): google.maps.StreetViewLink | null {
	const validLinks = links.filter(
		(link): link is google.maps.StreetViewLink & {
			pano: string;
			heading: number;
		} => link.pano !== null && link.heading !== null,
	);

	if (validLinks.length === 0) {
		return null;
	}

	let bestLink = validLinks[0];
	let bestDiff = headingDifference(bestLink.heading, viewHeading);

	for (const link of validLinks.slice(1)) {
		const diff = headingDifference(link.heading, viewHeading);
		if (diff < bestDiff) {
			bestDiff = diff;
			bestLink = link;
		}
	}

	return bestDiff <= maxAngleDegrees ? bestLink : null;
}

export async function createStreetViewPanorama(
	container: HTMLElement,
	options: google.maps.StreetViewPanoramaOptions,
): Promise<google.maps.StreetViewPanorama> {
	const { StreetViewPanorama } = await loadStreetViewLibrary();

	return new StreetViewPanorama(container, {
		...options,
		// Keep Google's attribution and navigation controls for Maps Platform compliance.
		addressControl: true,
		fullscreenControl: true,
		linksControl: true,
		panControl: true,
		zoomControl: true,
		clickToGo: true,
		enableCloseButton: false,
		motionTracking: true,
		motionTrackingControl: true,
	});
}
