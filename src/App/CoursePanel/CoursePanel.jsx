import React from 'react';
import {connect} from 'react-redux';

import './CoursePanel.css';

//import {SortableContainer, SortableElement} from 'react-sortable-hoc';
//import VisibleCourseListItem from '../containers/VisibleCourseListItem';
//
//const SortableItem = SortableElement(
//  ({value}) =>
//    <VisibleCourseListItem courseId={value}/>
//);
//
//const SortableList = SortableContainer(
//  ({items}) => {
//    return (
//      <ul>
//        {items.map((value, index) => (
//          <SortableItem key={`item-${index}`} index={index} value={value} />
//        ))}
//      </ul>
//    );
//  }
//);

const CoursePanel = ({focusCourse}) => {
    let focusSummary = null;
    if (focusCourse !== null) {
        const schedule = focusCourse.get('schedule');
        const faculty = focusCourse.get('faculty');
        
        const scheduleBlocks = schedule.map((block, index) => (
            <div key={index} className="block">
              <span className="days">
                {block.get('days')}
              </span>
              <span className="start-time">
                {block.get('startTime')}
              </span>
              <span className="end-time">
                {block.get('endTime')}
              </span>
              <span className="location">
                {block.get('location')}
              </span>
            </div>
        ));
        
        focusSummary = (
            <div className="focus-summary">
              <div className="row description">
                <span className="department">
                  {focusCourse.get('department')}
                </span>
                <span className="course-number">
                  {focusCourse.get('courseNumber')}
                </span>
                <span className="course-code-suffix">
                  {focusCourse.get('courseCodeSuffix')}
                </span>
                <span className="school">
                  {focusCourse.get('school')}
                </span>
                <span className="section">
                  {focusCourse.get('section').toString().padStart(2, '0')}
                </span>
                <span className="course-name">
                  {focusCourse.get('courseName')}
                </span>
              </div>
              {schedule.size === 0 ? null : (
                  <div className="row schedule">
                    {scheduleBlocks}
                  </div>
              )}
              <div className="row faculty">
                {
                    faculty.size === 1 ? (
                        faculty.get(0)
                    ) : faculty.size === 2 ? (
                        faculty.join(' and ')
                    ) : faculty.size === 3 ? (
                        faculty.slice(0, -1).join(', ') + ', and ' + faculty.get(-1)
                    ) : null
                }
                      </div>
            </div>
        );
    }

    return (
        <div id="course-panel">
          <div className="focus-summary-container">
            {focusSummary}
          </div>
        </div>
    );
};

const CoursePanelWrapper = connect(
    state => ({
        focusCourse: state.get('focusCourse'),
    }),
    dispatch => ({}),
)(CoursePanel);

export default CoursePanelWrapper;

