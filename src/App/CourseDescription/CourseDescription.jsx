import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Measure from 'react-measure';

import * as util from '@/util/misc';
import * as courseUtil from '@/util/course';

import './CourseDescription.css';

class CourseDescription extends React.PureComponent {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    credits: PropTypes.string,
    semesters: PropTypes.string,
    title: PropTypes.string,
    faculty: PropTypes.string,
    schedule: PropTypes.arrayOf(
      PropTypes.shape({
        days: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
      }),
    ),
  };

  constructor(props) {
    super(props);

    this.state = {
      height: 0,
    };

    this.setHeight = ({scroll: {height}}) => {
      this.setState({height});
    };
  }

  render() {
    const {
      show,
      credits,
      semesters,
      title,
      faculty,
      schedule,
    } = this.props;

    let summary = null;
    if (show) {
      const scheduleRow = (
        <div className="row schedule">
          {schedule.map((slot, index) => (
            <div key={index} className="block">
              {slot.days} {slot.startTime}
              &ndash;
              {slot.endTime} at {slot.location}
            </div>
          ))}
        </div>
      );

      summary = (
        <div className="summary">
          <div className="row title">{title}</div>
          {schedule.length > 0 && scheduleRow}
          <div className="row faculty">{faculty}</div>
          <div className="row semesters-credits">
            {semesters}, {credits}
          </div>
        </div>
      );
    }

    const measurer = ({measureRef}) => (
      <div ref={measureRef} className="measure">
        {summary}
      </div>
    );

    return (
      <div id="course-description">
        <div
          className="overflow"
          style={{
            height: this.state.height + 'px',
          }}
        >
          <Measure offset scroll onResize={this.setHeight}>
            {measurer}
          </Measure>
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    const course = state.get('focus');
    if (course.size === 0) {
      return {
        show: false,
        height: 0,
      };
    }

    const credits = courseUtil.courseCredits(course);

    return {
      show: true,
      title: `${courseUtil.courseFullCode(course)} ${course.get(
        'courseName',
      )}`,
      faculty: courseUtil.courseFacultyString(course),
      semesters:
        (course.get('firstHalfSemester')
          ? course.get('secondHalfSemester')
            ? 'Full'
            : 'First-half'
          : 'Second-half') + '-semester course',
      schedule: course.get('schedule'),
      credits: `${credits} credit${credits === 1 ? '' : 's'}`,
    };
  },
  () => ({}),
)(util.componentToJS(CourseDescription));
