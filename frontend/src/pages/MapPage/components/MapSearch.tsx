interface MapSearchProps {
    searchRadius: number;
    setSearchRadius: (radius: number) => void;
    onSearch: (query: string, radius: number) => void;
}

function MapSearch({
                       searchRadius,
                       setSearchRadius,
                       onSearch,
                   }: MapSearchProps) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const query = formData.get("location") as string;

        onSearch(query, searchRadius);
    }

    return (
        <form
            className="map-search"
            onSubmit={handleSubmit}
        >
            <input
                name="location"
                type="text"
                placeholder="Search location..."
                className="map-search-input"
            />

            <select
                value={searchRadius}
                onChange={(e) =>
                    setSearchRadius(Number(e.target.value))
                }
            >
                <option value={1}>1 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
            </select>

            <button
                type="submit"
                className="map-search-button"
            >
                Search
            </button>
        </form>
    );
}

export default MapSearch;
