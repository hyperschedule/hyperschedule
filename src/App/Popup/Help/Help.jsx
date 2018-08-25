import React from 'react';

import './Help.css';

const Help = () => (
  <div id='help'>
    <p>
      The <strong>Course Search</strong> tab lists all courses for the
      coming semester.  Click on the <button className='demo'>
        <i className='ion-md-add'></i>
      </button> button to add a
      course.  Each section is listed separately, so make sure to get
      all the ones you want.  You can click on a course to see more
      information about it in the upper-right panel.
    </p>
    <p>
      On the right-hand column, you can click and drag courses to
      reorder them.  The ones at the top are given the highest
      scheduling priority.  From here, you can also remove courses (
      <button className='demo'>
        <i className='ion-md-close'></i>
      </button>
      ),
      star them (
      <i className='ion-md-star-outline'></i>
      ), and disable them (
      <i className='ion-md-square-outline'></i>
      ).
    </p>
    <p>
      The <strong>Schedule</strong> tab is, of course, the main event.
      Scheduling is simple: first, all of your starred courses are
      scheduled, regardless of conflicts.  Then, as many remaining
      courses as possible are scheduled as long as they don&rsquo;t
      conflict: the algorithm starts from the top of your list and
      goes down.  Courses that are disabled, however, won&rsquo;t be
      considered.  So, to change your schedule, just use reordering,
      starring, and disabling, rather than paging through multiple
      schedules.
    </p>
    <p>
      Hyperschedule was created by Radon Rosborough and {''}
      <a href='https://github.com/MuddCreates/hyperschedule/contributors'>friends</a>
      {''} during Fall 2017 registration.
    </p>
  </div>
);

export default Help;
