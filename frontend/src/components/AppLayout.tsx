import TopNavBar from './TopNavBar/TopNavBar';
import { Outlet } from "react-router-dom";
import { useState } from 'react';

function AppLayout() {
    const [searchRadius, setSearchRadius] = useState(10);

    function handleSearch(query: string, radius: number) {
        console.log(query, radius);

        // Eventually call your backend here
        // and get the nearby routes.
    }

    return (
        <>
            <TopNavBar
                searchRadius={searchRadius}
                setSearchRadius={setSearchRadius}
                onSearch={handleSearch}
            />

            <Outlet />
        </>
    );
}

export default AppLayout;