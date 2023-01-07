import * as Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

import useStore from "@hooks/store";

export default function SearchControls() {
    const search = useStore((store) => store.search);
    return (
        <div className={Css.searchControls}>
            <input
                value={search.text}
                onChange={(ev) => search.setText(ev.currentTarget.value)}
                placeholder="Search for courses..."
            />
            <button className={Css.filterButton}>
                <Feather.Sliders size={16} />
                Filters
            </button>
        </div>
    );
}
