/** Shared geographic types — extend here for bookmarks, history, 3D Tiles, etc. */

export interface LatLngLiteral {
	lat: number;
	lng: number;
}

export interface StreetViewMetadata {
	latitude: number;
	longitude: number;
	description: string | null;
	imageDate: string | null;
	panoId: string | null;
}

export interface PlaceSearchResult {
	displayName: string;
	formattedAddress: string | null;
	location: LatLngLiteral;
}

export type StreetViewLoadState =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'ready' }
	| { status: 'no-coverage'; message: string }
	| { status: 'error'; message: string };
