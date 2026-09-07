import { useEffect } from 'react';
import {
	FORWARD_LINK_MAX_ANGLE_DEGREES,
	KEYBOARD_ROTATE_STEP_DEGREES,
} from '../config/defaults';
import { findBestForwardLink } from '../maps/streetView';

interface UseKeyboardControlsOptions {
	panorama: google.maps.StreetViewPanorama | null;
	enabled: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) {
		return false;
	}

	const tag = target.tagName;
	return (
		tag === 'INPUT' ||
		tag === 'TEXTAREA' ||
		tag === 'SELECT' ||
		target.isContentEditable
	);
}

export function useKeyboardControls({
	panorama,
	enabled,
}: UseKeyboardControlsOptions): void {
	useEffect(() => {
		if (!enabled || !panorama) {
			return;
		}

		const onKeyDown = (event: KeyboardEvent) => {
			if (isEditableTarget(event.target)) {
				return;
			}

			const key = event.key.toLowerCase();

			if (key === 'a' || key === 'arrowleft') {
				event.preventDefault();
				const pov = panorama.getPov();
				panorama.setPov({
					heading: pov.heading - KEYBOARD_ROTATE_STEP_DEGREES,
					pitch: pov.pitch,
				});
				return;
			}

			if (key === 'd' || key === 'arrowright') {
				event.preventDefault();
				const pov = panorama.getPov();
				panorama.setPov({
					heading: pov.heading + KEYBOARD_ROTATE_STEP_DEGREES,
					pitch: pov.pitch,
				});
				return;
			}

			if (key === 'w' || key === 'arrowup') {
				event.preventDefault();
				const links = (panorama.getLinks() ?? []).filter(
					(link): link is google.maps.StreetViewLink => link !== null,
				);
				const forwardLink = findBestForwardLink(
					links,
					panorama.getPov().heading,
					FORWARD_LINK_MAX_ANGLE_DEGREES,
				);

				if (!forwardLink?.pano || forwardLink.heading === null) {
					return;
				}

				panorama.setPano(forwardLink.pano);
				panorama.setPov({
					heading: forwardLink.heading,
					pitch: panorama.getPov().pitch,
				});
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [enabled, panorama]);
}
