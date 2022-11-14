import * as Course from "@hyperschedule/lib/course";
import * as Schedule from "@hyperschedule/lib/schedule";
import * as Util from "@hyperschedule/lib/util";
import * as Sidebar from "@hyperschedule/view/sidebar";

const dom = (() => {
  const container = document.getElementById("course-details")!;
  return <const>{
    container,
    close: <HTMLElement>container.querySelector(".close"),
    sizer: container.querySelector(".sizer")!,
    code: container.querySelector(".code")!,
    name: container.querySelector(".name")!,
    credits: container.querySelector(".credits")!,
    status: <HTMLElement>container.querySelector(".status .badge"),
    seats: <HTMLElement>container.querySelector(".status .seats"),
    schedule: container.querySelector(".schedule")!,
    instructors: container.querySelector(".instructors")!,
    description: container.querySelector(".description")!,
  };
})();

const partOfYear = (course: Course.CourseV3) => {
  if (course.courseSchedule.length === 0) return "No scheduled meetings";
  const sched = course.courseSchedule[0];
  return Course.termListDescription(
    sched.scheduleTerms,
    sched.scheduleTermCount
  );
};

const capitalize = (s: string) => `${s[0].toLocaleUpperCase()}${s.slice(1)}`;

const hide = () => {
  dom.container.classList.remove("show");
  dom.container.style.height = "0";
};
dom.close.addEventListener("click", hide);

export const setCourse = (course: Course.CourseV3) => {
  dom.container.classList.add("show");
  Sidebar.show();

  dom.code.textContent = course.courseCode;
  dom.name.textContent = course.courseName;
  const credits = course.courseCredits * creditMultiplier(course);
  dom.credits.textContent = `${partOfYear(course)}, ${credits} credit${
    credits === 1 ? "" : "s"
  }`;
  dom.description.innerHTML = course.courseDescription || "";

  if (course.courseEnrollmentStatus) {
    dom.status.dataset.status =
      course.courseEnrollmentStatus.toLocaleLowerCase();
    dom.status.textContent = `${capitalize(course.courseEnrollmentStatus)}`;
    dom.seats.textContent = `${course.courseSeatsFilled}/${course.courseSeatsTotal} seats filled`;
    if (course.permCount !== undefined && course.permCount !== 0){
      dom.seats.textContent += `, ${course.permCount} PERMs`
    }
  }

  // TODO: sanitize data on backend
  dom.instructors.textContent = Util.formatList(
    Array.from(new Set(course.courseInstructors))
  );

  while (dom.schedule.childElementCount < course.courseSchedule.length)
    dom.schedule.appendChild(document.createElement("div"));
  while (dom.schedule.childElementCount > course.courseSchedule.length)
    dom.schedule.removeChild(dom.schedule.lastElementChild!);

  for (let i = 0; i < course.courseSchedule.length; ++i) {
    dom.schedule.children[i].textContent = Schedule.generateDescription(
      course.courseSchedule[i],
      0
    );
  }

  dom.container.style.height = `${dom.sizer.scrollHeight}px`;
};

const creditMultiplier = (course: Course.CourseV3) =>
  course.courseCode.match(/[A-Z]* *[0-9A-Z ]*? *([A-Z]{2})-[0-9]{2}/)?.[1] ===
  "HM"
    ? 1
    : 3;
