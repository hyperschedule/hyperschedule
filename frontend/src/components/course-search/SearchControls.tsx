import Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

import useStore from "@hooks/store";
import { useAllTerms } from "@hooks/term";
import * as APIv4 from "hyperschedule-shared/api/v4";
import Dropdown from "@components/common/Dropdown";
import { prefetchDataForTerm } from "@hooks/api/prefetch";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

let timer: number;

export default function SearchControls() {
    const setSearchText = useStore((store) => store.setSearchText);
    const activeTerm = useStore((store) => store.activeTerm);
    const setActiveTerm = useStore((store) => store.setActiveTerm);

    const allTerms = useAllTerms();
    const queryClient = useQueryClient();

    const [searchState, setSearchState] = useState("");

    if (allTerms === undefined) return <></>;

    return (
        <div className={Css.searchControls}>
            <Dropdown
                selected={APIv4.stringifyTermIdentifier(activeTerm)}
                choices={allTerms.map(APIv4.stringifyTermIdentifier)}
                onSelect={(s) => {
                    const term = APIv4.parseTermIdentifier(s);
                    void prefetchDataForTerm(term, queryClient);
                    setActiveTerm(term);
                }}
            />

            <input
                value={searchState}
                onChange={(ev) => {
                    setSearchState(ev.target.value);
                    clearTimeout(timer);
                    timer = setTimeout(
                        () => setSearchText(ev.target.value),
                        150,
                    );
                }}
                placeholder="Search for courses..."
            />
            <button className={Css.filterButton}>
                <Feather.Sliders size={16} />
                Filters
            </button>
        </div>
    );
}
