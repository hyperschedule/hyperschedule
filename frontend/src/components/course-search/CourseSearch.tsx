import * as React from "react";

import { useMeasure /*, useRafEffect*/ } from "@react-hookz/web";
//import classNames from "classnames";
import { shallow } from "zustand/shallow";

import * as APIv4 from "hyperschedule-shared/api/v4";

import { useSectionsQuery } from "@hooks/api/course";
import useStore from "@hooks/store";
import * as Search from "@lib/search";

import SearchControls from "@components/course-search/SearchControls";
import CourseRow from "@components/course-search/CourseRow";

import Css from "./CourseSearch.module.css";

export default function CourseSearch() {
    const activeTerm = useStore((store) => store.activeTerm);
    const query = useSectionsQuery(activeTerm);
    const search = useStore(
        (store) => ({
            text: store.searchText,
            filters: store.searchFilters,
        }),
        shallow,
    );

    const filteredSections = React.useMemo(() => {
        return query.data?.filter((section) =>
            Search.matches(section, search.text, search.filters),
        );
    }, [query.data, search.text, search.filters]);

    return (
        <div className={Css.container}>
            <SearchControls />
            {filteredSections !== undefined ? (
                <CourseSearchResults
                    sections={filteredSections}
                    searchKey={btoa(search.text)}
                />
            ) : (
                <CourseSearchEnd text="loading courses..." />
            )}
        </div>
    );
}

function CourseSearchEnd(props: { text: string }) {
    return <div className={Css.end}>({props.text})</div>;
}

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

function CourseSearchResults(props: {
    sections: APIv4.Section[];
    searchKey: string;
}) {
    // https://github.com/streamich/react-use/issues/1264#issuecomment-721645100
    const [rowBounds, rowMeasureRef] = useMeasure<HTMLDivElement>();
    const [viewportBounds, viewportRef] = useMeasure<HTMLDivElement>();

    const [scroll, setScroll] = React.useState(0);

    const { expandKey, expandHeight } = useStore(
        (store) => ({
            expandKey: store.expandKey,
            expandHeight: store.expandHeight,
        }),
        shallow,
    );

    const setScrollFunc = useStore((store) => store.setScrollToSection);

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

    const allSectionsToIndexMap = React.useMemo(() => {
        const map = new Map<string, number>();
        for (let i = 0; i < props.sections.length; i++) {
            map.set(
                APIv4.stringifySectionCodeLong(props.sections[i]!.identifier),
                i,
            );
        }
        return map;
    }, [props.sections, props.searchKey]);

    function scrollToSection(section: APIv4.SectionIdentifier) {
        const index = allSectionsToIndexMap.get(
            APIv4.stringifySectionCodeLong(section),
        );
        if (index === undefined) return;
        if (rowBounds === undefined) return;
        viewportRef.current?.scrollTo({
            top: index * rowBounds.height,
        });
    }

    React.useEffect(() => {
        setScrollFunc(scrollToSection);
        return () => setScrollFunc(() => {});
    }, [props.sections, props.searchKey, rowBounds]);

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
        return <CourseSearchEnd text="no courses found" />;

    return (
        <>
            <div
                ref={viewportRef}
                className={Css.resultsContainer}
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
                                    key={`${
                                        props.searchKey
                                    }:${APIv4.stringifySectionCodeLong(
                                        section.identifier,
                                    )}`}
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
                    </>
                )}
            </div>
            <div className={Css.hiddenMeasureContainer}>
                <div ref={rowMeasureRef}>
                    <CourseRow section={props.sections[0]!} expand={false} />
                </div>
            </div>
        </>
    );
}

function CourseSearchRow(props: {
    index: number;
    section: APIv4.Section;
    scroll: number;
    rowHeight: number;
    viewportHeight: number;
    expandIndex: number | null;
}): JSX.Element | null {
    const { setExpandKey, expandHeight, setExpandHeight, clearExpand } =
        useStore(
            (store) => ({
                expandHeight: store.expandHeight,
                setExpandKey: store.setExpandKey,
                setExpandHeight: store.setExpandHeight,
                clearExpand: store.clearExpand,
            }),
            shallow,
        );

    const pos =
        props.index * props.rowHeight +
        (props.expandIndex !== null && props.index > props.expandIndex
            ? expandHeight
            : 0);

    const expand = props.index === props.expandIndex;

    return (
        <div
            style={{ transform: `translateY(${pos}px)` }}
            className={Css.courseRowPosition}
        >
            <CourseRow
                section={props.section}
                expand={expand}
                onClick={() =>
                    expand
                        ? clearExpand()
                        : setExpandKey(props.section.identifier)
                }
                updateDetailsSize={expand ? setExpandHeight : undefined}
            />
        </div>
    );
}
