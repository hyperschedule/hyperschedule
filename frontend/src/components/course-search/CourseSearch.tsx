import * as React from "react";
import * as Css from "./CourseSearch.module.css";
import { useMeasure } from "@react-hookz/web";

import type * as Api from "hyperschedule-shared/api/v4";
import type * as Course from "hyperschedule-shared/types/course";
import { useCourses } from "@hooks/api";

import SearchControls from "@components/course-search/SearchControls";
import CourseRow from "@components/course-search/CourseRow";
import shallow from "zustand/shallow";

import useStore from "@hooks/store";
import * as Search from "@lib/search";

function sectionKey(id: Course.SectionIdentifier) {
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
        (store) => ({ text: store.searchText, filters: store.searchFilters }),
        shallow,
    );
    // another TODO: maybe.... change render key whenever `search` changes so
    // that row components are un/re-mounted rather than mutated in-place to
    // avoid janky-looking sliding around animations from CSS transitions. the
    // other alternative is to a store a state variable like `animate`, only
    // enable it with `useEffect` during certain actions, and assign css
    // transition classes conditionally. also look into what `useTransition` is.

    const sections = React.useMemo(() => {
        return query.data?.filter((section) =>
            Search.matches(section, search.text, search.filters),
        );
    }, [query.data, search.text, search.filters]);

    return (
        <div className={Css.container}>
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

function CourseSearchResults(props: { sections: Api.Section[] }) {
    // https://github.com/streamich/react-use/issues/1264#issuecomment-721645100
    const [rowBounds, rowMeasureRef] = useMeasure<HTMLDivElement>();
    const [viewportBounds, viewportRef] = useMeasure<HTMLDivElement>();

    const [scroll, setScroll] = React.useState(0);

    const { setExpandIndex, expandKey, expandHeight } = useStore(
        (store) => ({
            setExpandIndex: store.setExpandIndex,
            expandKey: store.expandKey,
            expandHeight: store.expandHeight,
        }),
        shallow,
    );

    // recompute expand index if section list changes
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
                            {props.sections.map((s, i) => (
                                <CourseSearchRow
                                    key={sectionKey(s.identifier)}
                                    index={i}
                                    section={s}
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
                    {/* TODO implement actual dummy item */}
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
                onClick={
                    expand
                        ? clearExpand
                        : () => setExpand(props.section.identifier, props.index)
                }
                updateDetailsSize={expand ? setExpandHeight : undefined}
            />
        </div>
    );
}
