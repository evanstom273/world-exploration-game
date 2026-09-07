import { useEffect, useRef, useState } from 'react';
import {
	DEFAULT_LOCATION,
	DEFAULT_LOCATION_LABEL,
} from '../config/defaults';
import { getMapsApiKey } from '../maps/loader';
import { searchPlace } from '../maps/places';
import {
	createStreetViewPanorama,
	findPanoramaNear,
	getPanoramaMetadata,
	metadataFromPanorama,
} from '../maps/streetView';
import type { LatLngLiteral, StreetViewMetadata, StreetViewLoadState } from '../maps/types';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { Hud } from './Hud';
import { LocationSearch } from './LocationSearch';

async function goToPanorama(
	panorama: google.maps.StreetViewPanorama,
	lookup: { panoId: string; heading: number },
): Promise<void> {
	panorama.setPano(lookup.panoId);
	panorama.setPov({ heading: lookup.heading, pitch: 0 });
	panorama.setVisible(true);
}

async function goToLocation(
	panorama: google.maps.StreetViewPanorama,
	location: LatLngLiteral,
): Promise<StreetViewLoadState> {
	const lookup = await findPanoramaNear(location);
	if (!lookup) {
		return {
			status: 'no-coverage',
			message: 'No Street View coverage found near that location. Try another place or a nearby landmark.',
		};
	}

	await goToPanorama(panorama, lookup);
	return { status: 'ready' };
}

async function refreshMetadataFor(
	panorama: google.maps.StreetViewPanorama,
	setMetadata: (metadata: StreetViewMetadata) => void,
): Promise<void> {
	const panoId = panorama.getPano();
	if (panoId) {
		const detailed = await getPanoramaMetadata(panoId);
		if (detailed) {
			setMetadata(detailed);
			return;
		}
	}

	setMetadata(metadataFromPanorama(panorama));
}

export function StreetViewExplorer() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama | null>(
		null,
	);
	const [loadState, setLoadState] = useState<StreetViewLoadState>({ status: 'idle' });
	const [metadata, setMetadata] = useState<StreetViewMetadata | null>(null);
	const [locationLabel, setLocationLabel] = useState<string | null>(
		DEFAULT_LOCATION_LABEL,
	);
	const apiKey = getMapsApiKey();

	useEffect(() => {
		if (!apiKey || !containerRef.current) {
			if (!apiKey) {
				setLoadState({
					status: 'error',
					message:
						'Missing API key. Add VITE_GOOGLE_MAPS_API_KEY to .env.local (local) or GitHub Actions secrets (Pages).',
				});
			}
			return;
		}

		let cancelled = false;
		const listeners: google.maps.MapsEventListener[] = [];

		const init = async () => {
			setLoadState({ status: 'loading' });

			try {
				const panorama = await createStreetViewPanorama(containerRef.current!, {
					position: DEFAULT_LOCATION,
					pov: { heading: 0, pitch: 0 },
					visible: true,
				});

				if (cancelled) {
					return;
				}

				setPanorama(panorama);

				const onPanoChange = () => {
					void refreshMetadataFor(panorama, setMetadata);
				};

				listeners.push(panorama.addListener('pano_changed', onPanoChange));
				listeners.push(panorama.addListener('position_changed', onPanoChange));

				const initial = await findPanoramaNear(DEFAULT_LOCATION);
				if (!initial) {
					setLoadState({
						status: 'no-coverage',
						message: 'No Street View coverage at the default location.',
					});
					return;
				}

				await goToPanorama(panorama, initial);
				await refreshMetadataFor(panorama, setMetadata);
				setLoadState({ status: 'ready' });
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: 'Failed to initialize Street View.';
				setLoadState({ status: 'error', message });
			}
		};

		void init();

		return () => {
			cancelled = true;
			for (const listener of listeners) {
				listener.remove();
			}
			setPanorama(null);
		};
	}, [apiKey]);

	useKeyboardControls({
		panorama,
		enabled: loadState.status === 'ready',
	});

	const handleSearch = async (query: string) => {
		if (!panorama) {
			return;
		}

		setLoadState({ status: 'loading' });

		try {
			const place = await searchPlace(query);
			if (!place) {
				setLoadState({
					status: 'error',
					message: `No results found for "${query}". Try a more specific place name.`,
				});
				return;
			}

			setLocationLabel(place.displayName);
			const result = await goToLocation(panorama, place.location);
			setLoadState(result);

			if (result.status === 'ready') {
				await refreshMetadataFor(panorama, setMetadata);
			}
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Search failed. Check that Places API is enabled for your key.';
			setLoadState({ status: 'error', message });
		}
	};

	const showOverlay =
		loadState.status === 'loading' ||
		loadState.status === 'error' ||
		loadState.status === 'no-coverage';

	return (
		<div className="explorer">
			<div
				ref={containerRef}
				className="explorer__pano"
				role="application"
				aria-label="Street View explorer"
			/>

			<div className="explorer__ui">
				<header className="explorer__header">
					<h1 className="explorer__title">World Exploration</h1>
					<LocationSearch
						onSearch={handleSearch}
						disabled={!apiKey || loadState.status === 'loading'}
					/>
				</header>

				{metadata && loadState.status === 'ready' && (
					<Hud metadata={metadata} locationLabel={locationLabel} />
				)}
			</div>

			{showOverlay && (
				<div className="explorer__overlay" role="status">
					{loadState.status === 'loading' && <p>Loading Street View…</p>}
					{loadState.status === 'error' && <p>{loadState.message}</p>}
					{loadState.status === 'no-coverage' && <p>{loadState.message}</p>}
				</div>
			)}
		</div>
	);
}
