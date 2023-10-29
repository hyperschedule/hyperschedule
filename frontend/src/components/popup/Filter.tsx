import * as Css from "./Filter.module.css";
import * as AppCss from "@components/App.module.css";
import { ExampleFilterBubble } from "@components/course-search/filter-bubble/FilterBubble";
import * as Search from "@lib/search";
import useStore from "@hooks/store";
import { memo, Fragment } from "react";
import classNames from "classnames";

type FilterSpec = {
    name: string;
    example: string[];
};

const filterSpecs: { [k in Search.FilterKey]: FilterSpec } = {
    [Search.FilterKey.CourseCode]: {
        name: "Course Code",
        example: ["cs5", "csci5", "sc005"],
    },
    [Search.FilterKey.Department]: {
        name: "Department",
        example: ["CSCI", "cs"],
    },
    [Search.FilterKey.Title]: {
        name: "Title",
        example: ["Computer Science", "intro"],
    },
    [Search.FilterKey.Campus]: {
        name: "Campus",
        example: ["Harvey Mudd"],
    },
    [Search.FilterKey.Description]: {
        name: "Course Description",
        example: ["machine language"],
    },
    [Search.FilterKey.Instructor]: {
        name: "Instructor",
        example: ["Dodds", "zach"],
    },
    [Search.FilterKey.Location]: {
        name: "Location",
        example: ["McGregor", "greg"],
    },
    [Search.FilterKey.CourseArea]: {
        name: "Course Area",
        example: ["HM Common Core", "PO Area 5 Requirement"],
    },
    [Search.FilterKey.ScheduleDays]: {
        name: "Days",
        example: ["MWF", "T R", "wtf", "us"],
    },
    [Search.FilterKey.MeetingTime]: {
        name: "Time",
        example: [">10am", "<6:30pm", "8am-3:45pm", ">=17:05", "<=13"],
    },
    [Search.FilterKey.Credits]: {
        name: "Credits (HMC)",
        example: ["<=1", "=3", "1-2", ">=2"],
    },
};

export default memo(function Filter() {
    const setPopup = useStore((store) => store.setPopup);
    const addFilter = useStore((store) => store.addSearchFilter);

    return (
        <div>
            <h2 className={Css.title}> Filters </h2>
            <div>
                All filters are case-insensitive. When multiple filters are
                specified, only courses matching all the criteria will be shown
                (logical AND).
            </div>
            <div className={Css.filterTable}>
                <span className={Css.tableHeader}>Filter for</span>
                <span className={Css.tableHeader}>Type into search box</span>
                <span className={Css.tableHeader}>Examples</span>

                {(
                    Object.entries(filterSpecs) as [
                        Search.FilterKey,
                        FilterSpec,
                    ][]
                ).map(([key, spec], index) => {
                    return (
                        <Fragment key={key}>
                            <span
                                className={Css.line}
                                style={{
                                    gridRow: index + 2,
                                }}
                            />
                            <div className={Css.nameWrapper}>
                                <span className={Css.name}>{spec.name}</span>
                                <button
                                    className={classNames(
                                        AppCss.defaultButton,
                                        Css.applyButton,
                                    )}
                                    onClick={() => {
                                        setPopup(null);
                                        addFilter({ key, data: null });
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                            <span className={Css.typeable}>
                                <code>{key}:</code>
                            </span>

                            <div className={Css.examples}>
                                {spec.example.map((s) => (
                                    <div className={Css.bubbleWrapper} key={s}>
                                        <ExampleFilterBubble
                                            filterKey={key}
                                            data={s}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
});
