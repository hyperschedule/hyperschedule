import * as Course from "@hyperschedule/lib/course";
import * as Row from "@hyperschedule/view/course-row";

interface Dom {
  readonly root: HTMLElement;
  readonly spacer: HTMLElement;
  readonly list: HTMLUListElement;
  readonly footer: HTMLElement;
}
interface State {
  height: number;
  length: number;
  get: (i: number) => Course.CourseV3;
  rows: Row.Dom[];
}

const dom: Dom = (() => {
  const root = document.getElementById("search-results")!;
  return <const>{
    root,
    spacer: <HTMLElement>root.querySelector(".spacer"),
    list: <HTMLUListElement>root.querySelector("ul"),
    footer: <HTMLElement>root.querySelector("footer"),
  };
})();

const state: State = {
  height: 1,
  length: 0,
  get: () => undefined!,
  rows: [],
};

export const update = (length: State["length"], get: State["get"]) => {
  state.length = length;
  state.get = get;
  dom.spacer.style.height = `${length * state.height}px`;
  render();
};

const render = () => {
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
  //console.log(limit, offset);

  //console.log("RERENDER");
  for (let i = 0; i < limit; ++i) {
    console.log("hi");
    Row.update(state.rows[i], state.get(i + offset));
    (<HTMLElement>dom.list.children[i]).style.top = `${
      (i + offset) * state.height
    }px`;
    //console.log(state.get(i + offset).courseCode);
  }
  //for (let i = 0; i < state.length; ++i) {
  //  const row = Row.create(Row.Mode.SearchResult);
  //  Row.update(row, state.get(i));
  //  Row.append(dom.list, row);
  //}
};

dom.root.addEventListener("scroll", render);
window.addEventListener("resize", render);
window.addEventListener("load", () => {
  // TODO
  state.height = 30;
  render();
});

//export const update = ({ offset, limit, rowHeight }: {offset: number; limit: numbe}) => {
//};
