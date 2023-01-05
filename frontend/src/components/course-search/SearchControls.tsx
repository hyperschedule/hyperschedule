import * as Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

export default function SearchControls() {
    return (
        <div className={Css.searchControls}>
            <input placeholder="Search for courses..." />
            <button className={Css.filterButton}>
                <Feather.Sliders size={16} />
                Filters
            </button>
        </div>
    );
}
