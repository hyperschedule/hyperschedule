<script lang='ts'>
  import * as Course from '@hyperschedule/lib/course';

  export let course: Course;
</script>

<div class='course-row'>
<div class='code'>{course.courseCode}</div>
<div class='name'>{course.courseName}</div>
<div class='status'>
<div class='badge'>{course.courseEnrollmentStatus}</div>
<div class='seats'>
{course.courseSeatsFilled}/{course.courseSeatsTotal}
seats filled
</div>
</div>
</div>
