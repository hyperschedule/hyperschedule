import Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

import useStore from "@hooks/store";
import { useAllTerms } from "@hooks/term";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { prefetchDataForTerm } from "@hooks/api/prefetch";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";

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

    const textBoxRef = useRef<HTMLInputElement>(null);
    const filterGroupRef = useRef<HTMLDivElement>(null);

    function focusOnFilter(index: number, cursor: number) {
        if (index >= searchFilters.length) {
            textBoxRef.current?.focus();
            textBoxRef.current?.setSelectionRange(cursor, cursor);
        } else if (index >= 0) {
            const sel = filterGroupRef.current?.querySelectorAll("input");
            if (sel === undefined) return;
            const input = sel.item(index);

            input.focus();
            input.setSelectionRange(cursor, cursor);
        }
    }

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
                <div className={Css.filterGroup} ref={filterGroupRef}>
                    {searchFilters.map((filter, index) => (
                        <FilterBubble
                            key={index}
                            filter={filter}
                            index={index}
                            focusOnFilter={focusOnFilter}
                        />
                    ))}
                </div>
                <input
                    ref={textBoxRef}
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
                    onKeyDown={(ev) => {
                        if (ev.code === "ArrowLeft") {
                            const el = textBoxRef.current;
                            if (el !== null) {
                                if (
                                    el.selectionStart === 0 &&
                                    el.selectionEnd === 0 &&
                                    searchFilters.length >= 1
                                ) {
                                    // removeSearchFilter(
                                    //     searchFilters.length - 1,
                                    // );

                                    focusOnFilter(
                                        searchFilters.length - 1,
                                        Number.MAX_SAFE_INTEGER,
                                    );
                                }
                            }
                        } else if (ev.code === "Backspace") {
                            if (textBoxRef.current?.value.length === 0)
                                focusOnFilter(
                                    searchFilters.length - 1,
                                    Number.MAX_SAFE_INTEGER,
                                );
                        }
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
