import React from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';

import * as util from 'hyperschedule-util';

import './SelectedCourses.css';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';


const SortableItem = SortableElement(({value: {
    key,
    course,
    checked,
    starred,
    focusCourse,
    removeCourse,
    toggleCourseChecked,
    toggleCourseStarred,
}}) => {

    return (
        <div className={'sortable course item ' + course.dataClasses.join(' ')}
             onClick={() => focusCourse(course)}>
          <span className={'handle check ' + (checked ? 'on' : 'off')}
                onClick={event => {
                    toggleCourseChecked(key);
                    event.stopPropagation();
            }}>
          </span>
          <span className={'handle star ' + (starred ? 'on' : 'off')}
                onClick={event => {
                    toggleCourseStarred(key);
                    event.stopPropagation();
            }}>
          </span>
          <div className="fields">
            {course.titleFields}
            {course.statusFields}
          </div>
          <button
            className="right remove"
            onClick={event => {
                removeCourse(key);
                event.stopPropagation();
            }}>
            x
          </button>
        </div>
    );
});

const SortableList = SortableContainer(({items}) => {
    return (
        <div className="list">
          {
              items.map((value, index) => (
                  <SortableItem key={index} index={index} value={value}/>
              ))
          }
        </div>
    );
});

const SelectedCourses = ({
    order,
    courses,
    checked,
    starred,
    removeCourse,
    focusCourse,
    reorder,
    toggleCourseChecked,
    toggleCourseStarred,
}) => {
    
    const onSortEnd = ({oldIndex: from, newIndex: to}) => reorder(from, to);

    const courseItems = order.map(key => ({
        key,
        course: courses.get(key),
        checked: checked.has(key),
        starred: starred.has(key),
        focusCourse,
        removeCourse,
        toggleCourseChecked,
        toggleCourseStarred,
        
    }));

        return (
            <div id="selected-courses">
              <SortableList
                items={courseItems}
                onSortEnd={onSortEnd}
                helperClass="sortable course item float"
                pressDelay={100}/>
            </div>
        );
};

const SelectedCoursesWrapper = connect(
    state => ({
        courses: state.get('app').get('schedule').get('selection').get('courses'),
        order: state.get('app').get('schedule').get('selection').get('order'),
        checked: state.get('app').get('schedule').get('selection').get('checked'),
        starred: state.get('app').get('schedule').get('selection').get('starred'),
    }),
    dispatch => ({
        reorder: (from, to) => dispatch(actions.reorder(from, to)),
        focusCourse: course => dispatch(actions.focusCourse(course)),
        removeCourse: key => dispatch(actions.removeCourse(key)),
        toggleCourseChecked: key => dispatch(actions.toggleCourseChecked(key)),
        toggleCourseStarred: key => dispatch(actions.toggleCourseStarred(key)),
    }),
)(SelectedCourses);

export default SelectedCoursesWrapper;
