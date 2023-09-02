import * as Search from "@lib/search";

import Css from "./FilterBubble.module.css";

export default function FilterBubble({ filter }: { filter: Search.Filter }) {
    // A little type trickery to enable implementing per-key components in a record,
    // which is nicer to write than a bunch of if-else or switch-case code.
    // FilterBubbleInput is typed to make sure the type of the component's props
    // matches its corresponding key, but TS doesn't understand this yet,
    // so we do a little type cast to appease it.
    const InputComponent = FilterBubbleInput[filter.key] as React.FC<
        Search.FilterData[Search.FilterKey]
    >;

    return (
        <div className={Css.bubble}>
            {filter.key}:{<InputComponent {...filter.data} />}
        </div>
    );
}

function FilterBubbleInputUnimplemented() {
    return <>?</>;
}

const FilterBubbleInput: {
    [K in Search.FilterKey]: React.FC<Search.FilterData[K]>;
} = {
    [Search.FilterKey.Department]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.Instructor]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.Description]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.CourseCode]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.Title](props) {
        return <input></input>;
    },
    [Search.FilterKey.ScheduleDays]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.MeetingTime]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.CourseArea]: FilterBubbleInputUnimplemented,
    [Search.FilterKey.Campus]: FilterBubbleInputUnimplemented,
};
