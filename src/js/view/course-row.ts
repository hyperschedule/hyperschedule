import * as Course from "@hyperschedule/lib/course";

export interface Dom {
  readonly root: HTMLElement;
  readonly code: HTMLElement;
  readonly name: HTMLElement;
  readonly statusBadge: HTMLElement;
  readonly statusSeats: HTMLElement;
}

export enum Mode {
  SearchResult,
  Selected,
}

export const create = (mode: Mode): Dom => {
  const root = document.createElement("div");
  root.className = "course-row";

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

  return { root, code, name, statusBadge, statusSeats };
};

export const update = (dom: Dom, course: Course.CourseV3) => {
  dom.code.textContent = course.courseCode;
  dom.name.textContent = course.courseName;
  dom.statusBadge.textContent = course.courseEnrollmentStatus;
  dom.statusSeats.textContent = `${course.courseSeatsFilled}/${course.courseSeatsTotal}`;
};

export const append = (parent: HTMLElement, dom: Dom) => {
  parent.appendChild(dom.root);
};
