import * as React from "react";
import * as Css from "./CourseSearch.module.css";
import { useMeasure } from "@react-hookz/web";

import type * as Api from "hyperschedule-shared/api/v4";
import type * as Course from "hyperschedule-shared/types/course";
import { useCourses } from "@hooks/api";

import SearchControls from "@components/course-search/SearchControls";
import CourseRow from "@components/CourseRow";

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

function CourseSearchRow(props: {
    index: number;
    section: Api.Section;
    expand: { index: number; height: number } | null;
    scroll: number;
    rowHeight: number;
    viewportHeight: number;
    setExpand: (expand: { index: number; height: number } | null) => void;
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

    const key = sectionKey(props.section.identifier);
    const style = { transform: `translateY(${pos}px)` };

    return (
        <div key={key} style={style} className={Css.courseRowPosition}>
            <CourseRow
                section={props.section}
                expand={props.index === props.expand?.index}
                onClick={(height: number) =>
                    props.setExpand(
                        props.index === props.expand?.index
                            ? null
                            : { index: props.index, height },
                    )
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
        height: number;
    } | null>(null);
    const [scroll, setScroll] = React.useState(0);

    return (
        <>
            <div
                ref={viewportRef}
                className={Css.resultsContainer}
                onScroll={(ev) => setScroll(ev.currentTarget.scrollTop)}
            >
                {viewportBounds && rowBounds && (
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
    return <div>({props.text})</div>;
}

export default function CourseSearch() {
    const query = useCourses();

    return (
        <div className={Css.container}>
            <SearchControls />
            {query.data ? (
                <CourseSearchResults sections={query.data} />
            ) : (
                <CourseSearchEnd text="loading courses..." />
            )}
        </div>
    );
}
