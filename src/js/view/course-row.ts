import * as Course from "@hyperschedule/lib/course";
import md5 from "md5";
import randomColor from "randomcolor";

export interface Dom {
  readonly root: HTMLElement;
  readonly code: HTMLElement;
  readonly name: HTMLElement;
  readonly statusBadge: HTMLElement;
  readonly statusSeats: HTMLElement;
  readonly btns: DomBtns;
  add: (e: MouseEvent) => void;
  focus: (e: MouseEvent) => void;
}

interface DomBtns {
  readonly add?: HTMLButtonElement;
  readonly remove?: HTMLButtonElement;
  readonly star?: HTMLButtonElement;
  readonly enable?: HTMLButtonElement;
}

export enum Mode {
  SearchResult,
  Selected,
}

export const create = (mode: Mode): Dom => {
  const root = document.createElement("div");
  root.className = `course-row ${modeClass[mode]}`;

  const code = document.createElement("div");
  code.className = "code";
  root.appendChild(code);

  const name = document.createElement("div");
  name.className = "name";
  root.appendChild(name);

  const status = document.createElement("div");
  status.className = "status";
  root.appendChild(status);

  const statusBadge = document.createElement("div");
  statusBadge.className = "badge";
  status.appendChild(statusBadge);

  const statusSeats = document.createElement("div");
  statusSeats.className = "seats";
  status.appendChild(statusSeats);

  return {
    root,
    code,
    name,
    statusBadge,
    statusSeats,
    btns: createBtns[mode](root),
    add: () => undefined,
    focus: () => undefined,
  };
};

const modeClass: Record<Mode, string> = {
  [Mode.SearchResult]: "result",
  [Mode.Selected]: "selected",
};

const createBtns: Record<Mode, (root: HTMLElement) => DomBtns> = {
  [Mode.SearchResult]: (root) => {
    const add = document.createElement("button");
    add.className = "add las la-plus";
    root.appendChild(add);
    return { add };
  },
  [Mode.Selected]: (root) => {
    const toggles = document.createElement("div");
    toggles.className = "toggles";
    root.appendChild(toggles);

    const star = document.createElement("button");
    star.className = "star las la-star";
    toggles.appendChild(star);

    const enable = document.createElement("button");
    enable.className = "enable las la-check";
    toggles.appendChild(enable);

    const remove = document.createElement("button");
    remove.className = "remove las la-times";
    root.appendChild(remove);

    return { star, enable, remove };
  },
};

export const update = (
  dom: Dom,
  course: Course.CourseV3,
  selected: boolean,
  add: () => void,
  focus: () => void
) => {
  if (dom.btns.add !== undefined) {
    dom.btns.add.disabled = selected;
    dom.btns.add.removeEventListener("click", dom.add);
    const onClick = (e: MouseEvent) => {
      add();
      e.stopPropagation();
    };
    dom.add = onClick;
    dom.btns.add.addEventListener("click", onClick);
  }
  dom.root.removeEventListener("click", dom.focus);
  dom.focus = focus;
  dom.root.addEventListener("click", focus);
  if (selected) {
    dom.root.dataset.selected = "";
  } else delete dom.root.dataset.selected;
  if (course.starred) dom.root.dataset.starred = "";
  else delete dom.root.dataset.starred;

  dom.code.textContent = course.courseCode;
  dom.name.textContent = course.courseName;
  dom.statusBadge.textContent = course.courseEnrollmentStatus;
  dom.statusBadge.dataset.status = course.courseEnrollmentStatus?.toLocaleLowerCase();
  dom.statusSeats.textContent = `${course.courseSeatsFilled}/${course.courseSeatsTotal} seats filled`;

  dom.root.style.backgroundColor = randomColor({
    hue: "random",
    luminosity: "light",
    seed: md5(course.courseCode),
    format: "hex",
  });
};

export const placeholder = (dom: Dom) => {
  dom.code.textContent = "CODE";
  dom.name.textContent = "name";
  dom.statusBadge.textContent = "Open";
  dom.statusSeats.textContent = "1/1";
};

export const append = (parent: HTMLElement, dom: Dom) => {
  parent.appendChild(dom.root);
};
