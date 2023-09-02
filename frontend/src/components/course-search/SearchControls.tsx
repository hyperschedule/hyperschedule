import Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

import useStore from "@hooks/store";
import { useAllTerms } from "@hooks/term";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { prefetchDataForTerm } from "@hooks/api/prefetch";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Dropdown from "@components/common/Dropdown";
import FilterBubble from "./FilterBubble";

export default function SearchControls() {
    const searchFilters = useStore((store) => store.searchFilters);
    const setSearchText = useStore((store) => store.setSearchText);
    const activeTerm = useStore((store) => store.activeTerm);
    const setActiveTerm = useStore((store) => store.setActiveTerm);

    const allTerms = useAllTerms();
    const queryClient = useQueryClient();

    const [searchState, setSearchState] = useState("");

    const [timer, setTimer] = useState<number | undefined>(undefined);

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
            <div className={Css.inputGroup}>
                {searchFilters.map((filter, i) => (
                    <FilterBubble key={i} filter={filter} />
                ))}
                <input
                    className={Css.input}
                    value={searchState}
                    onChange={(ev) => {
                        //ev.target.value.endsWith(':')

                        setSearchState(ev.target.value);
                        clearTimeout(timer);
                        setTimer(
                            setTimeout(
                                () => setSearchText(ev.target.value),
                                150,
                            ),
                        );
                    }}
                    placeholder="Search for courses..."
                />
            </div>
            <button className={Css.filterButton}>
                <Feather.Sliders size={16} />
                Filters
            </button>
        </div>
    );
}
