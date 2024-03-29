import Css from "./SearchControls.module.css";
import * as Feather from "react-feather";

import useStore from "@hooks/store";
import { PopupOption } from "@lib/popup";
import { useAllTerms } from "@hooks/term";
import * as APIv4 from "hyperschedule-shared/api/v4";
import { prefetchDataForTerm } from "@hooks/api/prefetch";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useRef, useState } from "react";

import Dropdown from "@components/common/Dropdown";
import FilterBubble from "@components/course-search/filter-bubble/FilterBubble";
import * as Search from "@lib/search";
import { useUserStore } from "@hooks/store/user";
import AppCss from "@components/App.module.css";
import classNames from "classnames";
import { memo } from "react";

export default memo(function SearchControls() {
    const activeTerm = useUserStore((user) => user.activeTerm);
    const setActiveTerm = useUserStore((user) => user.setActiveTerm);
    const searchFilters = useStore((store) => store.searchFilters);
    const addSearchFilter = useStore((store) => store.addSearchFilter);
    const setSearchText = useStore((store) => store.setSearchText);
    const setPopup = useStore((store) => store.setPopup);

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
            <div className={Css.termSelect}>
                <Dropdown
                    selected={APIv4.stringifyTermIdentifier(activeTerm)}
                    choices={allTerms.map(APIv4.stringifyTermIdentifier)}
                    emptyPlaceholder="no term selected"
                    onSelect={(index) => {
                        const term = allTerms[index]!;
                        void prefetchDataForTerm(term, queryClient);
                        setActiveTerm(term);
                    }}
                />
            </div>
            <div className={Css.inputGroup}>
                <div className={Css.filterGroup} ref={filterGroupRef}>
                    {searchFilters.map((filter, index) => (
                        <FilterBubble
                            key={filter.key}
                            filter={filter.filter}
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
                        const el = ev.target;

                        if (
                            el.selectionStart === el.selectionEnd &&
                            el.selectionEnd !== null &&
                            el.selectionEnd > 0 &&
                            el.value.at(el.selectionEnd - 1) === ":"
                        ) {
                            const stringBefore = el.value.slice(
                                0,
                                el.selectionEnd - 1,
                            );
                            const match = stringBefore.match(
                                Search.filterKeyRegexp,
                            );
                            if (match !== null) {
                                const newSearch =
                                    stringBefore.slice(0, match.index) +
                                    el.value.slice(el.selectionEnd);

                                const key =
                                    match[1]!.toLocaleLowerCase() as Search.FilterKey;
                                addSearchFilter({
                                    key: key,
                                    data: null,
                                });

                                setSearchState(newSearch);
                                setSearchText(newSearch);
                                window.requestAnimationFrame(() => {
                                    // we can't use focusOnFilter here because the searchFilters haven't been updated yet
                                    const selection =
                                        filterGroupRef.current?.querySelectorAll(
                                            "input",
                                        );
                                    if (selection === undefined) return;
                                    const input = selection.item(
                                        selection.length - 1,
                                    );

                                    input.focus();
                                    input.setSelectionRange(0, 0);
                                });
                                return;
                            }
                        }

                        setSearchState(el.value);

                        // we do this extremely complicated callback tree because
                        // updating search text is probably the slowest synchronous
                        // operation we have, and we need to run it as few times
                        // as possible, especially when the user is typing

                        clearTimeout(timer);
                        setTimer(
                            setTimeout(
                                () =>
                                    startTransition(() =>
                                        setSearchText(el.value),
                                    ),
                                200,
                            ),
                        );
                    }}
                    onKeyDown={(ev) => {
                        const el = ev.currentTarget;
                        if (ev.code === "ArrowLeft") {
                            if (
                                el.selectionStart === 0 &&
                                el.selectionEnd === 0 &&
                                searchFilters.length >= 1
                            ) {
                                focusOnFilter(
                                    searchFilters.length - 1,
                                    Number.MAX_SAFE_INTEGER,
                                );
                            }
                        } else if (ev.code === "Backspace") {
                            if (el.value.length === 0)
                                focusOnFilter(
                                    searchFilters.length - 1,
                                    Number.MAX_SAFE_INTEGER,
                                );
                        }
                    }}
                    placeholder={
                        searchFilters.length === 0
                            ? "Search for codes, areas, titles, instructors, locations..."
                            : ""
                    }
                />
            </div>
            <button
                className={classNames(AppCss.defaultButton, Css.filterButton)}
                onClick={() => setPopup({ option: PopupOption.Filter })}
            >
                <Feather.Filter className={AppCss.defaultButtonIcon} />
                Filters
            </button>
        </div>
    );
});
