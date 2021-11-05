<script lang="ts">
  import * as Model from "../lib/app/course-details";
  import * as Course from "@hyperschedule/lib/course";
  import * as Schedule from "@hyperschedule/lib/schedule";
  import * as Util from "@hyperschedule/lib/util";

  let height: number;

  const current = Model.course;

  const capitalize = (s: string) =>
    `${s.slice(0, 1).toLocaleUpperCase()}${s.slice(1)}`;

  const partOfYear = (course: Course.CourseV3) => {
    if (course.courseSchedule.length === 0) return "No scheduled meetings";
    const sched = course.courseSchedule[0];
    return Course.termListDescription(
      sched.scheduleTerms,
      sched.scheduleTermCount
    );
  };

  $: school = $current?.courseCode.match(
    /[A-Z]* *[0-9A-Z ]*? *([A-Z]{2})-[0-9]{2}/
  )?.[1];

  $: credits = (school === "HM" ? 1 : 3) * ($current?.courseCredits ?? 0);
</script>

<div id="course-details" style="height: {$current !== null ? height : 0}px">
  <div class="sizer" bind:clientHeight={height}>
    {#if $current !== null}
      <header>
        <div class="code">
          {$current?.courseCode}
        </div>
        <div class="name">
          {$current?.courseName}
        </div>
        <button class="close" on:click={() => current.set(null)}>
          <i class="las la-times" />
        </button>
      </header>
      <section class="meta">
        <div class="status">
          <div
            class="badge"
            data-status={$current?.courseEnrollmentStatus?.toLocaleLowerCase()}
          >
            {capitalize($current?.courseEnrollmentStatus ?? "")}
          </div>
          <div class="seats">
            {$current?.courseSeatsFilled}/{$current?.courseSeatsTotal} seats filled
          </div>
        </div>
        <div class="credits">
          {$current !== null ? partOfYear($current) : ""},
          {credits} credit{credits === 1 ? "" : "s"}
        </div>
        <div class="instructors">
          {Util.formatList($current?.courseInstructors ?? [])}
        </div>
        <div class="schedule">
          {#each $current?.courseSchedule ?? [] as entry}
            <div>{Schedule.generateDescription(entry, 0)}</div>
          {/each}
        </div>
      </section>
      <section class="description">
        {$current?.courseDescription}
      </section>
    {/if}
  </div>
</div>

<style lang="pcss">
  #course-details {
    @apply px-4 overflow-y-hidden h-0 duration-150;
    transition-property: height;

    .sizer {
      @apply pb-4;
    }

    header {
      @apply font-bold grid;
      grid-template-areas: "code close" "name close";
      grid-template-columns: 1fr auto;
      .code {
        @apply opacity-50 text-sm my-0 leading-none;
        grid-area: code;
      }
      .name {
        grid-area: name;
      }

      .close {
        @apply px-2 py-1 self-start;
        grid-area: close;
      }
    }

    section.meta {
      @apply mb-2 text-xs;

      .status {
        @apply mb-2 grid gap-x-1 items-center text-xs;
        grid-template-columns: repeat(2, max-content);

        .badge {
          @apply rounded-full text-white font-bold px-2 uppercase;
          &[data-status="open"] {
            @apply bg-green-500;
          }
          &[data-status="closed"] {
            @apply bg-red-400;
          }
          &[data-status="reopened"] {
            @apply bg-yellow-500;
          }
        }
      }
      .credits {
      }
      .instructors {
        @apply mb-1;
      }
      .schedule {
        @apply text-xs;
      }
    }

    section.description {
      @apply text-xs;
    }
  }
</style>
