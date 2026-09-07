import type { PlaceSearchResult } from './types';
import { loadPlacesLibrary } from './loader';

export async function searchPlace(
	query: string,
): Promise<PlaceSearchResult | null> {
	const trimmed = query.trim();
	if (!trimmed) {
		return null;
	}

	const { Place } = await loadPlacesLibrary();

	const { places } = await Place.searchByText({
		textQuery: trimmed,
		fields: ['displayName', 'formattedAddress', 'location'],
		maxResultCount: 1,
	});

	const place = places?.[0];
	if (!place?.location) {
		return null;
	}

	return {
		displayName: place.displayName ?? trimmed,
		formattedAddress: place.formattedAddress ?? null,
		location: {
			lat: place.location.lat(),
			lng: place.location.lng(),
		},
	};
}
