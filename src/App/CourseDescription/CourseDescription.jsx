import React from 'react';
import {connect} from 'react-redux';

import * as util from 'hyperschedule-util';

import Measure from 'react-measure';

import * as actions from './actions';

import './CourseDescription.css';

const CourseDescription = ({
  show, credits, semesters, title, faculty, height, schedule, setHeight,
}) => {
  let summary = null;
  if (show) {

    const scheduleRow = (
      <div className='row schedule'>
        {schedule.map((slot, index) => (
          <div key={index} className='block'>
            {slot.days} {slot.startTime}&ndash;{slot.endTime} at {slot.location}
          </div>
        ))}
      </div>
    );
    
    summary = (
      <div className="summary">
        <div className="row title">
          {title}
        </div>
        {schedule.length > 0 && scheduleRow}
        <div className="row faculty">
          {faculty}
        </div>
        <div className="row semesters-credits">
          {semesters}, {credits}
        </div>
      </div>
    );
  }
  
  const focusSummaryMeasure = ({measureRef}) => (
    <div ref={measureRef} className="measure">
      {summary}
    </div>
  );

  return (
    <div id="course-description">
      <div className="overflow" style={{
             height: height + 'px',
           }}>
        <Measure offset onResize={({offset: {height}}) => setHeight(height)}>
          {focusSummaryMeasure}
        </Measure>
      </div>
    </div>
  );
};

export default connect(
  state => {
    const focus = state.getIn(['app', 'focus']);
    const course = focus.get('course');

    if (course === null) {
      return {
        show: false,
        height: 0,
      };
    }

    const credits = util.courseCredits(course);

    return {
      show: true,
      title: `${util.courseFullCode(course)} ${course.get('courseName')}`,
      faculty: util.courseFacultyString(course),
      semesters: (course.get('firstHalfSemester') ? (
        course.get('secondHalfSemester') ? 'Full' : 'First-half'
      ) : 'Second-half') + '-semester course',
      schedule: course.get('schedule'),
      credits: `${credits} credit${credits === 1 ? '' : 's'}`,
      height: focus.get('height'),
    };
  },
  dispatch => ({
    setHeight: height => dispatch(actions.setHeight(height)),
  }),
)(util.componentToJS(CourseDescription));

