import React from 'react';



export const computeCourseKey = (course) => (
    [
        'school', 'department', 'courseNumber', 'courseCodeSuffix', 'section'
    ].map(field => course.get(field)).join('/')
);


export const createCourseTitleElement = (course) => (
    <span className="fields">
      <span className="field department">
        {course.get('department')}
      </span>
      <span className="field course-number">
        {course.get('courseNumber').toString().padStart(3, '0')}
      </span>
      <span className="field course-code-suffix">
        {course.get('courseCodeSuffix')}
      </span>
      <span className="field school">
        {course.get('school')}
      </span>
      <span className="field section">
        {course.get('section').toString().padStart(2, '0')}
      </span>
      <span className="field course-name">
        {course.get('courseName')}
      </span>
    </span>
);


export const computeCourseStyleClasses = course => (
    ['school', 'department'].map(field => (
        field + '-' + course.get(field)
    ))
);

