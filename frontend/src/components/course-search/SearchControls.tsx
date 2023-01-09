import * as Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

import useStore from "@hooks/store";

export default function SearchControls() {
    const searchText = useStore((store) => store.searchText);
    const setSearchText = useStore((store) => store.setSearchText);
    return (
        <div className={Css.searchControls}>
            <input
                value={searchText}
                onChange={(ev) => setSearchText(ev.currentTarget.value)}
                placeholder="Search for courses..."
            />
            <button className={Css.filterButton}>
                <Feather.Sliders size={16} />
                Filters
            </button>
        </div>
    );
}
