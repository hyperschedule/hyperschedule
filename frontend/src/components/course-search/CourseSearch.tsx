import * as React from "react";
import * as Css from "./CourseSearch.module.css";
import { useMeasure } from "@react-hookz/web";

import type * as Api from "hyperschedule-shared/api/v4";
import type * as Course from "hyperschedule-shared/types/course";
import { useCourses } from "@hooks/api";

import SearchControls from "@components/course-search/SearchControls";
import CourseRow from "@components/course-search/CourseRow";

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

function sectionIdEqual(
    a: Course.SectionIdentifier,
    b: Course.SectionIdentifier,
) {
    return sectionKey(a) === sectionKey(b);
}

function CourseSearchRow(props: {
    index: number;
    section: Api.Section;
    expand: {
        index: number;
        identifier: Api.SectionIdentifier;
        height: number;
    } | null;
    scroll: number;
    rowHeight: number;
    viewportHeight: number;
    setExpand: (
        expand: {
            index: number;
            identifier: Api.SectionIdentifier;
            height: number;
        } | null,
    ) => void;
}): JSX.Element | null {
    const pos =
        props.index * props.rowHeight +
        (props.expand && props.index > props.expand.index
            ? props.expand.height
            : 0);

    const height =
        props.rowHeight +
        (props.index === props.expand?.index ? props.expand.height : 0);

    const show =
        props.index === props.expand?.index ||
        (props.scroll - props.viewportHeight <= pos + height &&
            pos <= props.scroll + 2 * props.viewportHeight);

    if (!show) return null;

    const style = { transform: `translateY(${pos}px)` };

    const expand = props.index === props.expand?.index;

    return (
        <div style={style} className={Css.courseRowPosition}>
            <CourseRow
                section={props.section}
                expand={expand}
                onClick={(height: number) =>
                    props.setExpand(
                        props.index === props.expand?.index
                            ? null
                            : {
                                  index: props.index,
                                  height,
                                  identifier: props.section.identifier,
                              },
                    )
                }
                onResize={(height) =>
                    props.index === props.expand?.index
                        ? props.setExpand({ ...props.expand, height })
                        : undefined
                }
            />
        </div>
    );
}

function CourseSearchResults(props: { sections: Api.Section[] }) {
    // https://github.com/streamich/react-use/issues/1264#issuecomment-721645100
    const [rowBounds, rowMeasureRef] = useMeasure<HTMLDivElement>();
    const [viewportBounds, viewportRef] = useMeasure<HTMLDivElement>();

    const [expand, setExpand] = React.useState<{
        index: number;
        identifier: Api.SectionIdentifier;
        height: number;
    } | null>(null);

    const [scroll, setScroll] = React.useState(0);

    // recompute expand index if section list changes
    React.useEffect(() => {
        if (expand === null) return;

        const index = props.sections.findIndex((section) =>
            sectionIdEqual(section.identifier, expand.identifier),
        );
        console.log("recomputing expand index", index);

        setExpand(index === -1 ? null : { ...expand, index });
    }, [props.sections]);
    // TODO: should `setExpand` be one of the dependencies? also consider
    // refactoring expand state logic

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
                                    (expand?.height ?? 0)
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
                                    expand={expand}
                                    setExpand={setExpand}
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

function CourseSearchEnd(props: { text: string }) {
    return <div className={Css.end}>({props.text})</div>;
}

export default function CourseSearch() {
    const query = useCourses();

    const search = useStore((store) => store.search);
    // another TODO: maybe.... change render key whenever `search` changes so
    // that row components are un/re-mounted rather than mutated in-place to
    // avoid janky-looking sliding around animations from CSS transitions. the
    // other alternative is to a store a state variable like `animate`, only
    // enable it with `useEffect` during certain actions, and assign css
    // transition classes conditionally. also look into what `useTransition` is.

    return (
        <div className={Css.container}>
            <SearchControls />
            {query.data ? (
                <CourseSearchResults
                    sections={query.data.filter((section) =>
                        Search.matches(section, search),
                    )}
                />
            ) : (
                <CourseSearchEnd text="loading courses..." />
            )}
        </div>
    );
}
