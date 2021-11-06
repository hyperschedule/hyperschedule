import * as Course from "@hyperschedule/lib/course";
import * as Row from "@hyperschedule/view/course-row";

/*

This view controller renders course row elements in a "virtualized" list: only
rows that should appear in the main viewport are included in the DOM.  Doing so
offers substantial performance benefits--here are the two alternatives:

1. Include all course rows matching search filter in DOM.  Refresh DOM elements
   on API update or filter change.

   This was what we originally did when Hyperschedule was first made.  That
   implementation was the worst possible--every time the DOM contents changed,
   we cleared the entire list with `removeChild`, then re-created and re-added
   all ~2k course row elements.  That took ~0.5-1s to update.

   I tested a more optimized implementation that only applies diffs to the DOM
   (adds/removes children until there are the right number of elements, then
   update the contents of each entry, instead of clearing and re-adding all
   children).  Even then, it took ~0.3-0.5s (estimate based on my perception,
   not actually measured) to update elements when the search filter changed.
   Not good.

2. Include all course rows from API in DOM, toggle `display: none` to filter

   This was the next thing I tested.  The rationale, according to an [SO
   thread][so]: DOM mutations are very costly compared to style updates.  In
   that respect, this solution seemed optimal: the DOM was only modified only
   when new API data comes in (relatively infrequently); search queries only
   adjust the `display` style on row elements but do not touch the DOM
   structure at all.  Yet this solution still took ~0.3-0.5s to update the
   search results per keystroke, same as the (optimized) implementation of
   option 1.

[so]: https://stackoverflow.com/questions/62709969/does-display-none-improve-or-worsen-performance

Based on these tests, I concluded that, on lists this large (~2k elements),
layout reflowing (which is triggered both by updating DOM elements and by
toggling `display: none`) incurs the most significant performance cost.  DOM
mutations on the large list also probably incurs a signficant performance cost.

However, with a _virtualized_ rendering approach, at most only ~100 rows are
included in the DOM, so even though, per-operation, DOM mutations might be more
costly than style changes, the smaller-size advantage of virtualized rendering
significantly outweighs that difference.

*/

interface Dom {
  readonly root: HTMLElement;
  readonly spacer: HTMLElement;
  readonly list: HTMLUListElement;
  readonly footer: HTMLElement;
  readonly measure: HTMLElement;
}
interface State {
  height: number;
  length: number;
  get: (i: number) => Course.CourseV3;
  rows: Row.Dom[];
  isAdded: (course: Course.CourseV3) => boolean;
  add: (course: Course.CourseV3) => void;
  focus: (course: Course.CourseV3) => void;
}

const dom: Dom = (() => {
  const root = document.getElementById("search-results")!;
  return <const>{
    root,
    spacer: <HTMLElement>root.querySelector(".spacer"),
    list: <HTMLUListElement>root.querySelector("ul"),
    footer: <HTMLElement>root.querySelector("footer"),
    measure: <HTMLElement>root.querySelector(".measure"),
  };
})();

const state: State = {
  height: 1,
  length: 0,
  get: () => undefined!,
  rows: [],
  isAdded: () => false,
  add: () => undefined,
  focus: () => undefined,
};

export const update = (
  length: State["length"],
  get: State["get"],
  isAdded: State["isAdded"],
  add: State["add"],
  focus: State["focus"]
) => {
  return;
  //state.length = length;
  //state.get = get;
  //state.isAdded = isAdded;
  //state.add = add;
  //state.focus = focus;
  //dom.footer.textContent = "End of results";
  //render();
};

const render = () => {
  state.height = dom.measure.scrollHeight;
  dom.spacer.style.height = `${state.length * state.height}px`;

  const offset = Math.min(
    Math.floor(dom.root.scrollTop / state.height),
    state.length
  );
  const limit = Math.min(
    Math.ceil(window.innerHeight / state.height),
    state.length - offset
  );
  while (dom.list.childElementCount < limit) {
    const row = Row.create(Row.Mode.SearchResult);
    state.rows.push(row);
    const wrapper = document.createElement("li");
    wrapper.className = "slot";
    Row.append(wrapper, row);
    dom.list.appendChild(wrapper);
  }
  while (dom.list.childElementCount > limit) {
    dom.list.removeChild(dom.list.lastElementChild!);
    state.rows.pop();
  }

  for (let i = 0; i < limit; ++i) {
    const course = state.get(i + offset);
    Row.update(
      state.rows[i],
      course,
      state.isAdded(course),
      () => state.add(course),
      () => state.focus(course)
    );
    (<HTMLElement>dom.list.children[i]).style.top = `${
      (i + offset) * state.height
    }px`;
  }
};

const init = () => {
  dom.root.addEventListener("scroll", render);
  window.addEventListener("resize", render);

  const row = Row.create(Row.Mode.SearchResult);
  Row.placeholder(row);

  const measure = <HTMLElement>dom.root.querySelector(".measure");
  Row.append(measure, row);

  render();
};

init();
