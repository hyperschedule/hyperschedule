<script lang="ts">
  import * as Course from "@hyperschedule/lib/course";

  import randomColor from "randomcolor";
  import md5 from "md5";

  export let course: Pick<
    Course.CourseV3,
    | "courseCode"
    | "courseName"
    | "courseEnrollmentStatus"
    | "courseSeatsFilled"
    | "courseSeatsTotal"
  > = {
    courseCode: "ABCD HM-01",
    courseName: "Placeholder course",
    courseEnrollmentStatus: "open",
    courseSeatsFilled: 5,
    courseSeatsTotal: 13,
  };

  $: bg = randomColor({
    hue: "random",
    luminosity: "light",
    seed: md5(course.courseCode),
    format: "hex",
  });
</script>

<div class="course-row result" style="background-color: {bg}">
  <div class="code">{course.courseCode}</div>
  <div class="name">{course.courseName}</div>
  <div class="status">
    <div class="badge">{course.courseEnrollmentStatus}</div>
    <div class="seats">
      {course.courseSeatsFilled}/{course.courseSeatsTotal}
      seats filled
    </div>
  </div>
</div>
