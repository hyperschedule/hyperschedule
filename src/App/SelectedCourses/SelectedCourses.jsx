import React from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';

import * as util from 'hyperschedule-util';

import './SelectedCourses.css';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';


const SortableItem = SortableElement(({value: {
    key: courseKey,
    course,
    focusCourse,
    removeCourse,
}}) => {

    return (
        <div className={'sortable course item ' + course.dataClasses.join(' ')}
             onClick={() => focusCourse(course)}>
          <div className="fields">
            {course.titleFields}
            {course.statusFields}
          </div>
          <button
            className="right button remove"
            onClick={event => {
                removeCourse(courseKey);
                event.stopPropagation();
            }}>
            x
          </button>
        </div>
    );
});

const SortableList = SortableContainer(({items}) => {
    return (
        <div className="sortable list">
          {
              items.map((value, index) => (
                  <SortableItem key={index} index={index} value={value}/>
              ))
          }
        </div>
    );
});

const SelectedCourses = ({order, courses, removeCourse, focusCourse, reorder}) => {

    const onSortEnd = ({oldIndex: from, newIndex: to}) => reorder(from, to);

    const courseItems = order.map(key => ({
        key,
        course: courses.get(key),
        focusCourse,
        removeCourse,
    }));

    return (
        <div id="selected-courses">
          <SortableList
            items={courseItems}
            onSortEnd={onSortEnd}
            helperClass="sortable float"
            distance={10}/>
        </div>
    );
};

const SelectedCoursesWrapper = connect(
    state => ({
        courses: state.get('app').get('schedule').get('selection').get('courses'),
        order: state.get('app').get('schedule').get('selection').get('order'),
    }),
    dispatch => ({
        reorder: (from, to) => dispatch(actions.reorder(from, to)),
        focusCourse: course => dispatch(actions.focusCourse(course)),
        removeCourse: key => dispatch(actions.removeCourse(key)),
    }),
)(SelectedCourses);

export default SelectedCoursesWrapper;
