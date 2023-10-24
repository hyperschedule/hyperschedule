import * as Css from "./Filter.module.css";
import { ExampleFilterBubble } from "@components/course-search/filter-bubble/FilterBubble";
import * as Search from "@lib/search";
import * as Feather from "react-feather";
import useStore from "@hooks/store";

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

export default function Filter() {
    const setPopup = useStore((store) => store.setPopup);
    const addFilter = useStore((store) => store.addSearchFilter);

    return (
        <div>
            <h2 className={Css.title}> Filters </h2>
            <div>
                When multiple filters are specified, only courses matching all
                the criteria will be shown. You can add a filter by typing its
                left-side, followed by a colon, into the search box. For
                example, you can add{" "}
                <span style={{ display: "inline-block", width: "fit-content" }}>
                    <ExampleFilterBubble filterKey="dept" data="CS" />
                </span>{" "}
                by typing <mark>dept:</mark> into the search box. All the
                examples here will match Mudd's CS5 in FA2023. All filters are
                case-insensitive.
            </div>
            <div className={Css.tableWrapper}>
                <table className={Css.filterTable}>
                    <thead>
                        <tr>
                            <th>Filter for</th>
                            <th>Type into search box</th>
                            <th>Examples</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(
                            Object.entries(filterSpecs) as [
                                Search.FilterKey,
                                FilterSpec,
                            ][]
                        ).map(([key, spec]) => {
                            return (
                                <tr key={key}>
                                    <td className={Css.nameColumn}>
                                        <Feather.PlusCircle
                                            className={Css.addIcon}
                                            onClick={() => {
                                                setPopup(null);
                                                addFilter({ key, data: null });
                                            }}
                                        />
                                        <span className={Css.name}>
                                            {spec.name}
                                        </span>
                                    </td>

                                    <td className={Css.typeable}>
                                        <code>{key}:</code>
                                    </td>

                                    <td>
                                        <div className={Css.example}>
                                            {spec.example.map((s) => (
                                                <div
                                                    className={
                                                        Css.bubbleWrapper
                                                    }
                                                    key={s}
                                                >
                                                    <ExampleFilterBubble
                                                        filterKey={key}
                                                        data={s}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
