import * as React from "react";

import { useMeasure } from "@react-hookz/web";

import * as APIv4 from "hyperschedule-shared/api/v4";

import Slider from "@components/common/Slider";
import Dropdown from "@components/common/Dropdown";

import {
    useCourseAreaDescription,
    useSectionsForTermsQuery,
} from "@hooks/api/query";
import { useAllTerms } from "@hooks/term";
import useStore from "@hooks/store";
import { useActiveSchedule } from "@hooks/schedule";
import {
    useActiveSectionsLookup,
    useActiveSectionsQuery,
} from "@hooks/section";
import * as Search from "@lib/search";
import { PopupOption } from "@lib/popup";

import SearchControls from "@components/course-search/SearchControls";
import CourseRow from "@components/course-search/CourseRow";

import Css from "./CourseSearch.module.css";
import { memo, useCallback } from "react";
import { useUserStore } from "@hooks/store/user";

export default memo(function CourseSearch() {
    const sections: APIv4.Section[] | undefined = useActiveSectionsQuery();
    const searchText = useStore((store) => store.searchText);
    const searchFilters = useStore((store) => store.searchFilters);
    const areas = useCourseAreaDescription().data;
    const activeSchedule = useActiveSchedule();
    const sectionsLookup = useActiveSectionsLookup();
    const selectedSections = activeSchedule
        ? (activeSchedule.sections
              .filter((us) => us.attrs.selected)
              .map((us) =>
                  sectionsLookup.get(
                      APIv4.stringifySectionCodeLong(us.section),
                  ),
              )
              .filter((s) => s !== undefined) as APIv4.Section[])
        : undefined;
    const hideConflictingSections = useStore(
        (store) => store.hideConflictingSections,
    );
    const conflictingSectionsOptions = useStore(
        (store) => store.conflictingSectionsOptions,
    );

    const filteredSections: APIv4.Section[] | undefined = React.useMemo(() => {
        if (sections === undefined) return undefined;

        return searchFilters.length === 0
            ? sections
            : sections.filter((s) =>
                  Search.filterSection(
                      s,
                      searchFilters.map((s) => s.filter),
                  ),
              );
    }, [searchFilters, sections]);

    const sectionsToShow: APIv4.Section[] | undefined = React.useMemo(() => {
        if (searchText === "" && !hideConflictingSections)
            return filteredSections;
        if (filteredSections === undefined) return undefined;

        let res: [number, APIv4.Section][] = [];
        for (const s of filteredSections) {
            const score = Search.matchesText(searchText, s, areas);
            if (score !== null) {
                res.push([score, s]);
            }
        }
        const sorted = res.sort((a, b) => b[0] - a[0]);
        const sortedSections = sorted.map((a) => a[1]);

        return hideConflictingSections
            ? Search.getNonConflictingSections(
                  sortedSections,
                  selectedSections,
                  conflictingSectionsOptions,
              )
            : sortedSections;
    }, [
        sections,
        searchText,
        searchFilters,
        selectedSections,
        hideConflictingSections,
        conflictingSectionsOptions,
    ]);

    const { enable, range } = useStore(
        (store) => store.historicalSearchOptions,
    );
    const allTerms = useAllTerms() ?? [];
    const historicalSections = useSectionsForTermsQuery(
        enable,
        allTerms.slice(0, range),
    ).data;

    const matchingHistoricalSections: APIv4.Section[] | undefined =
        React.useMemo(() => {
            if (!enable || !historicalSections) {
                return undefined;
            }

            const filteredHistoricalSections =
                searchFilters.length === 0
                    ? historicalSections
                    : historicalSections.filter((s) =>
                          Search.filterSection(
                              s,
                              searchFilters.map((s) => s.filter),
                          ),
                      );

            if (searchText === "") return filteredHistoricalSections;

            let res: [number, APIv4.Section][] = [];
            for (const s of filteredHistoricalSections) {
                const score = Search.matchesText(searchText, s, areas);
                if (score !== null) {
                    res.push([score, s]);
                }
            }
            const sorted = res.sort((a, b) => b[0] - a[0]);
            return sorted.map((a) => a[1]);
        }, [historicalSections, searchText, searchFilters, enable, range]);

    return (
        <div className={Css.container}>
            <SearchControls />
            {sectionsToShow !== undefined ? (
                <CourseSearchResults
                    sections={sectionsToShow}
                    HistoricalSearchEnabled={enable}
                    historicalSections={matchingHistoricalSections}
                />
            ) : (
                <CourseSearchEnd text="loading courses..." />
            )}
        </div>
    );
});

function computeIndices(state: {
    rowHeight: number;
    expandHeight: number;
    scroll: number;
    viewportHeight: number;
}): readonly [number, number] {
    // number of extra viewport heights above and below actual visible region to render; reduces "ghost" effect wherein elements scroll into visible region, but take a slight delay to actually render.
    const padFactor = 0.5;
    return [
        Math.max(
            Math.floor(
                (state.scroll -
                    padFactor * state.viewportHeight -
                    2 * state.expandHeight) /
                    state.rowHeight,
            ),
            0,
        ),
        Math.ceil(
            (state.scroll + (1 + padFactor) * state.viewportHeight) /
                state.rowHeight,
        ),
    ];
}

const CourseSearchResults = memo(function CourseSearchResults(props: {
    sections: APIv4.Section[];
    HistoricalSearchEnabled: boolean;
    historicalSections: APIv4.Section[] | undefined;
}) {
    // https://github.com/streamich/react-use/issues/1264#issuecomment-721645100
    const [rowBounds, rowMeasureRef] = useMeasure<HTMLDivElement>();
    const [viewportBounds, viewportRef] = useMeasure<HTMLDivElement>();

    const [scroll, setScroll] = React.useState(0);

    const expandKey = useStore((store) => store.expandKey);
    const expandHeight = useStore((store) => store.expandHeight);

    const [expandIndex, setExpandIndex] = React.useState<number | null>(null);

    const [indexStart, indexEnd] = React.useMemo(
        () =>
            computeIndices({
                scroll,
                rowHeight: rowBounds?.height ?? 1,
                viewportHeight: viewportBounds?.height ?? 0,
                expandHeight,
            }),
        [rowBounds, viewportBounds, scroll, expandHeight],
    );

    // recompute expand index when section list or expand key changes. potential optimization:
    // pre-compute (and memoize) a key↦index mapping of all sections in the data;
    // when updates happen due to search query changes, binary search to find
    // the new expand index.
    React.useEffect(() => {
        if (expandKey === null) {
            setExpandIndex(null);
            return;
        }

        const key = APIv4.stringifySectionCodeLong(expandKey);
        const index = props.sections.findIndex(
            (section) =>
                APIv4.stringifySectionCodeLong(section.identifier) === key,
        );
        setExpandIndex(index === -1 ? null : index);
    }, [expandKey, props.sections]);

    const sections = props.sections
        .slice(indexStart, indexEnd)
        .map((section, i) => ({ index: i + indexStart, section }));

    // always render expanded entry even if it's outside the viewport bounds, to
    // ensure height measurements/calculations are up-to-date
    //if (
    //    expandIndex !== null &&
    //    !(indexStart <= expandIndex && expandIndex < indexEnd)
    //)
    //    sections.push({
    //        index: expandIndex,
    //        section: props.sections[expandIndex]!,
    //    });

    if (props.sections.length === 0)
        return (
            <div>
                <CourseSearchEnd text="no courses in active term found" />
                <HistoricalSearchMenu />

                {props.HistoricalSearchEnabled ? (
                    <HistoricalSearchResults
                        historicalSections={props.historicalSections}
                    />
                ) : (
                    <></>
                )}
            </div>
        );

    return (
        <>
            <div
                className={Css.resultsContainer}
                ref={viewportRef}
                onScroll={(ev) => setScroll(ev.currentTarget.scrollTop)}
            >
                {viewportBounds && rowBounds && (
                    <>
                        <div
                            style={{
                                height: `${
                                    props.sections.length * rowBounds.height +
                                    expandHeight
                                }px`,
                            }}
                            className={Css.spacer}
                        >
                            {sections.map(({ index, section }) => (
                                <CourseSearchRow
                                    key={APIv4.stringifySectionCodeLong(
                                        section.identifier,
                                    )}
                                    expandIndex={expandIndex}
                                    index={index}
                                    section={section}
                                    scroll={scroll}
                                    rowHeight={rowBounds.height}
                                    viewportHeight={viewportBounds.height}
                                />
                            ))}
                        </div>
                        <CourseSearchEnd text="end of search results" />
                        <HistoricalSearchMenu />
                    </>
                )}

                {props.HistoricalSearchEnabled ? (
                    <HistoricalSearchResults
                        historicalSections={props.historicalSections}
                    />
                ) : (
                    <></>
                )}
            </div>
            <div className={Css.hiddenMeasureContainer}>
                <div ref={rowMeasureRef}>
                    <CourseRow section={props.sections[0]!} expand={false} />
                </div>
            </div>
        </>
    );
});

const CourseSearchRow = memo(function CourseSearchRow(props: {
    index: number;
    section: APIv4.Section;
    scroll: number;
    rowHeight: number;
    viewportHeight: number;
    expandIndex: number | null;
}): JSX.Element | null {
    const setExpandKey = useStore((store) => store.setExpandKey);
    const setExpandHeight = useStore((store) => store.setExpandHeight);
    const expandHeight = useStore((store) => store.expandHeight);
    const clearExpand = useStore((store) => store.clearExpand);

    const pos =
        props.index * props.rowHeight +
        (props.expandIndex !== null && props.index > props.expandIndex
            ? expandHeight
            : 0);

    const expand = props.index === props.expandIndex;

    const onClick = useCallback(
        () => (expand ? clearExpand() : setExpandKey(props.section.identifier)),
        [expand],
    );

    return (
        <div
            style={{ transform: `translateY(${pos}px)` }}
            className={Css.courseRowPosition}
        >
            <CourseRow
                section={props.section}
                expand={expand}
                onClick={onClick}
                updateDetailsSize={expand ? setExpandHeight : undefined}
            />
        </div>
    );
});

const CourseSearchEnd = memo(function CourseSearchEnd(props: { text: string }) {
    return <div className={Css.end}>({props.text})</div>;
});

const HistoricalSearchMenu = memo(function HistoricalSearchMenu() {
    const historicalSearchOptions = useStore(
        (store) => store.historicalSearchOptions,
    );
    const setHistoricalSearchOptions = useStore(
        (store) => store.setHistoricalSearchOptions,
    );

    const allTerms = useAllTerms() ?? [];
    function createPossibleRanges(numTerms: number): number[] {
        let results = [];
        for (let i = 0; i < Math.log2(numTerms); i++) {
            if (i !== 0) {
                results.push(2 ** i);
            }
        }
        results.push(numTerms);
        return results;
    }
    const rangeOptions = createPossibleRanges(allTerms.length);

    return (
        <div className={Css.historicalSearchMenu}>
            <div className={Css.element}>
                <span>Search for courses from other recent semesters</span>
                <Slider
                    value={historicalSearchOptions.enable}
                    onToggle={() => {
                        setHistoricalSearchOptions({
                            ...historicalSearchOptions,
                            enable: !historicalSearchOptions.enable,
                        });
                    }}
                    text=""
                />
            </div>
            <div className={Css.element}>
                <span>
                    How many recent semesters do you want to search?{" "}
                    <span className={Css.warning}>
                        {" "}
                        (this may affect performance!)
                    </span>
                </span>
                <Dropdown
                    choices={rangeOptions.map((range) => range.toString())}
                    selected={historicalSearchOptions.range.toString()}
                    onSelect={(index) => {
                        const selectedRange = rangeOptions[index] ?? 4;
                        setHistoricalSearchOptions({
                            ...historicalSearchOptions,
                            range: selectedRange,
                        });
                    }}
                    emptyPlaceholder={"none selected"}
                />
            </div>
        </div>
    );
});

const HistoricalSearchResults = memo(function HistoricalSearch(props: {
    historicalSections: APIv4.Section[] | undefined;
}) {
    const activeTerm = useUserStore((user) => user.activeTerm);
    const setPopup = useStore((store) => store.setPopup);

    const sections = props.historicalSections?.filter((section) => {
        return !(
            section.identifier.term === activeTerm.term &&
            section.identifier.year === activeTerm.year
        );
    });

    if (sections === undefined) {
        return (
            <div className={Css.end}>
                (loading courses from other semesters...)
            </div>
        );
    }

    return (
        <>
            <div className={Css.historicalSearchResults}>
                {sections.map((section) => (
                    <CourseRow
                        key={APIv4.stringifySectionCodeLong(section.identifier)}
                        section={section}
                        expand={false}
                        fromOtherTerm={true}
                        onClick={() => {
                            setPopup({
                                option: PopupOption.SectionDetail,
                                section: section,
                            });
                        }}
                    />
                ))}
            </div>

            <CourseSearchEnd
                text={
                    sections.length === 0
                        ? "no historical records of courses found"
                        : "end of recent semesters search results"
                }
            />
        </>
    );
});
