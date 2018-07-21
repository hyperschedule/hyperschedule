import React from 'react';


export const courseKey = (course) => (
    [
        'school', 'department', 'courseNumber', 'courseCodeSuffix', 'section'
    ].map(field => course.get(field)).join('/')
);


export const courseTitleFields = (course) => [(
    <span key="department" className="field department">
      {course.get('department')}
    </span>
), (
    <span key="course-number" className="field course-number">
      {course.get('courseNumber').toString().padStart(3, '0')}
    </span>
), (
    <span key="course-code-suffix" className="field course-code-suffix">
      {course.get('courseCodeSuffix')}
    </span>
), (
    <span key="school" className="field school">
      {course.get('school')}
    </span>
), (
    <span key="section" className="field section">
      {course.get('section').toString().padStart(2, '0')}
    </span>
), (
    <span key="course-name" className="field course-name">
      {course.get('courseName')}
    </span>
)];

export const courseStatusFields = course => [(
    <span key="course-status" className="field course-status">
      {course.get('courseStatus')}
    </span>
), (
    <span key="filled-seats" className="field filled-seats">
      {course.get('openSeats')}
      </span>
), (
    <span key="total-seats" className="field total-seats">
      {course.get('totalSeats')}
    </span>
)];


export const courseScheduleBlockFields = (block, key) => (
    <span key={key} className="schedule-block fields">
      <span key="days" className="field days">
        {block.get('days')}
      </span>
      <span key="start-time" className="field start-time">
        {block.get('startTime')}
      </span>
      <span key="end-time" className="field end-time">
        {block.get('endTime')}
      </span>
      <span key="location" className="field location">
        {block.get('location')}
      </span>
    </span>
);

const courseDurationHalf = course => (
    course.get('firstHalfSemester') + course.get('secondHalfSemester')
);

const courseCredits = course => (
    course.get('quarterCredits') * .25
);

export const courseCreditFields = course => {
    const credits = courseCredits(course);

    return [(
        <span key="duration" className="field duration">
          {courseDurationHalf(course) == 1 ? 'half' : 'full'}
        </span>
    ), (
        <span key="credits" className="field credits">
          {credits} {credits === 1 ? 'credit' : 'credits'}
        </span>
    )];
};

export const commaJoin = items => {
    switch (true) {
    case items.size === 1:
        return items.join('');
    case items.size === 2:
        return items.join(' and ');
    case items.size >= 3:
            return items.slice(0, -1).join(', ') + ', and ' + items.get(-1);
        default:
            return '';
        }
    };

    export const courseStyleClasses = course => (
    ['school', 'department'].map(field => (
        field + '-' + course.get(field)
    ))
);


