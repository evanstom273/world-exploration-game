import type { LatLngLiteral } from '../maps/types';

/** Default spawn: Times Square, New York — reliable outdoor Street View coverage. */
export const DEFAULT_LOCATION: LatLngLiteral = {
	lat: 40.758,
	lng: -73.9855,
};

export const DEFAULT_LOCATION_LABEL = 'Times Square, New York';

export const STREET_VIEW_SEARCH_RADIUS_METERS = 100;

export const KEYBOARD_ROTATE_STEP_DEGREES = 15;

export const FORWARD_LINK_MAX_ANGLE_DEGREES = 75;
