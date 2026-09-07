import { type FormEvent, useState } from 'react';

interface LocationSearchProps {
	onSearch: (query: string) => Promise<void>;
	disabled?: boolean;
}

export function LocationSearch({ onSearch, disabled = false }: LocationSearchProps) {
	const [query, setQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = query.trim();
		if (!trimmed || disabled || isSearching) {
			return;
		}

		setIsSearching(true);
		try {
			await onSearch(trimmed);
		} finally {
			setIsSearching(false);
		}
	};

	return (
		<form className="location-search" onSubmit={handleSubmit}>
			<label className="location-search__label" htmlFor="location-search-input">
				Go somewhere
			</label>
			<div className="location-search__row">
				<input
					id="location-search-input"
					className="location-search__input"
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Times Square, New York"
					autoComplete="off"
					enterKeyHint="search"
					disabled={disabled || isSearching}
				/>
				<button
					className="location-search__button"
					type="submit"
					disabled={disabled || isSearching || query.trim().length === 0}
				>
					{isSearching ? 'Searching…' : 'Go'}
				</button>
			</div>
		</form>
	);
}
