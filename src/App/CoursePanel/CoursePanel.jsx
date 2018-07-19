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

    const SummaryField = ({field, format = s => s}) => (
        <span className={field}>
          {format(focusCourse.get(field))}
        </span>
    );

    const SummaryRow = ({children}) => {
        return children;
    };

    const focusSummary = focusCourse.size == 0 ? (
        null
    ) : (
        <SummaryRow>
          <SummaryField field="department"/>
          <SummaryField field="courseNumber"/>
          <SummaryField field="school"/>
          <SummaryField field="section" format={n => n.toString().padStart(2, '0')}/>
        </SummaryRow>
    );

    return (
        <div id="course-panel">
          <div className="focus-summary">
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

