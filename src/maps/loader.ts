import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let configured = false;

export function getMapsApiKey(): string {
	return import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

export function ensureMapsConfigured(): void {
	if (configured) {
		return;
	}

	const key = getMapsApiKey();
	if (!key) {
		throw new Error(
			'Missing VITE_GOOGLE_MAPS_API_KEY. Add it to a .env.local file.',
		);
	}

	setOptions({
		key,
		v: 'weekly',
	});

	configured = true;
}

export async function loadStreetViewLibrary(): Promise<google.maps.StreetViewLibrary> {
	ensureMapsConfigured();
	return importLibrary('streetView');
}

export async function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
	ensureMapsConfigured();
	return importLibrary('places');
}
