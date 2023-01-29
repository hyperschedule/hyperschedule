import * as React from "react";

import { useMeasure, useRafEffect } from "@react-hookz/web";
import classNames from "classnames";
import shallow from "zustand/shallow";

import type * as Api from "hyperschedule-shared/api/v4";

import { useCourses } from "@hooks/api";
import useStore from "@hooks/store";
import * as Search from "@lib/search";

import SearchControls from "@components/course-search/SearchControls";
import CourseRow from "@components/course-search/CourseRow";

import * as Css from "./CourseSearch.module.css";

function sectionKey(id: Api.SectionIdentifier) {
    return [
        id.department,
        id.courseNumber,
        id.suffix,
        id.affiliation,
        id.sectionNumber,
        id.year,
        id.term,
        id.half,
    ].join(" ");
}

export default function CourseSearch() {
    const query = useCourses();

    const search = useStore(
        (store) => ({
            text: store.searchText,
            filters: store.searchFilters,
        }),
        shallow,
    );

    // disable animated position transitions when section data changes; the
    // animations look good for the accordion view but look noisy during search
    // changes (when entries disappear, appear, and get shuffled around
    // non-uniformly)
    const [searchTransition, setSearchTransition] = React.useState(false);
    const [sections, setSections] = React.useState<Api.Section[] | undefined>(
        undefined,
    );

    const filteredSections = React.useMemo(() => {
        return query.data?.filter((section) =>
            Search.matches(section, search.text, search.filters),
        );
    }, [query.data, search.text, search.filters]);

    // use requestAnimationFrame effects here to ensure renders are flushed
    // before making the next update; otherwise disable/enable transition state
    // updates get batched and never make it to render
    useRafEffect(() => {
        if (sections === filteredSections) {
            setSearchTransition(false);
            return;
        }
        if (!searchTransition) {
            setSearchTransition(true);
            return;
        }
        setSections(filteredSections);
    }, [sections, filteredSections, searchTransition]);

    return (
        <div
            className={classNames(Css.container, {
                [Css.searchTransition]: searchTransition,
            })}
        >
            <SearchControls />
            {sections !== undefined ? (
                <CourseSearchResults sections={sections} />
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
    return [
        Math.max(
            Math.floor(
                (state.scroll - state.viewportHeight - state.expandHeight) /
                    state.rowHeight,
            ),
            0,
        ),
        Math.ceil(
            (state.scroll + 2 * state.viewportHeight + state.expandHeight) /
                state.rowHeight,
        ),
    ];
}

function CourseSearchResults(props: { sections: Api.Section[] }) {
    // https://github.com/streamich/react-use/issues/1264#issuecomment-721645100
    const [rowBounds, rowMeasureRef] = useMeasure<HTMLDivElement>();
    const [viewportBounds, viewportRef] = useMeasure<HTMLDivElement>();

    const [scroll, setScroll] = React.useState(0);

    const { expandIndex, setExpandIndex, expandKey, expandHeight } = useStore(
        (store) => ({
            expandIndex: store.expandIndex,
            setExpandIndex: store.setExpandIndex,
            expandKey: store.expandKey,
            expandHeight: store.expandHeight,
        }),
        shallow,
    );

    const [indexStart, indexEnd] = computeIndices({
        scroll,
        rowHeight: rowBounds?.height ?? 1,
        viewportHeight: viewportBounds?.height ?? 0,
        expandHeight,
    });

    // recompute expand index if section list changes. potential optimization:
    // pre-compute (and memoize) a key↦index mapping of all sections in the data;
    // when updates happen due to search query changes, binary search to find
    // the new expand index.
    React.useEffect(() => {
        if (expandKey === null) {
            setExpandIndex(null);
            return;
        }

        const key = sectionKey(expandKey);
        const index = props.sections.findIndex(
            (section) => sectionKey(section.identifier) === key,
        );
        setExpandIndex(index === -1 ? null : index);
    }, [props.sections]);

    if (props.sections.length === 0)
        return <CourseSearchEnd text="no courses found" />;

    // always render expanded entry even if it's outside the viewport bounds, to
    // ensure height measurements/calculations are up-to-date
    const sections = props.sections
        .slice(indexStart, indexEnd)
        .map((section, i) => ({ index: i + indexStart, section }));
    if (
        expandIndex !== null &&
        !(indexStart <= expandIndex && expandIndex < indexEnd)
    )
        sections.push({
            index: expandIndex,
            section: props.sections[expandIndex]!,
        });

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
                                    key={sectionKey(section.identifier)}
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
    section: Api.Section;
    scroll: number;
    rowHeight: number;
    viewportHeight: number;
}): JSX.Element | null {
    const { show, pos, expand, setExpand, setExpandHeight, clearExpand } =
        useStore((store) => {
            const expand = props.index === store.expandIndex;
            const pos =
                props.index * props.rowHeight +
                (store.expandIndex !== null && props.index > store.expandIndex
                    ? store.expandHeight
                    : 0);
            const height = props.rowHeight + (expand ? store.expandHeight : 0);

            return {
                expandIndex: store.expandIndex,
                expandKey: store.expandIndex,
                expandHeight: store.expandHeight,
                setExpand: store.setExpand,
                setExpandHeight: store.setExpandHeight,
                clearExpand: store.clearExpand,
                expand,
                pos,
                show:
                    expand ||
                    (props.scroll - props.viewportHeight <= pos + height &&
                        pos <= props.scroll + 2 * props.viewportHeight),
            };
        }, shallow);

    if (!show) return null;

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
                        : setExpand(props.section.identifier, props.index)
                }
                updateDetailsSize={expand ? setExpandHeight : undefined}
            />
        </div>
    );
}
