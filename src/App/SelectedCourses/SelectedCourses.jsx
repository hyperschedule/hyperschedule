import React from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';

import {createCourseTitleElement, computeCourseStyleClasses} from '../util';

import './SelectedCourses.css';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';


const SelectedCourses = ({courses, order, reorder, focusCourse}) => {

    const SortableItem = SortableElement(({value: courseKey}) => {

        const course = courses.get(courseKey);

        return (
            <div className={'sortable course item ' + computeCourseStyleClasses(course).join(' ')}
                 onClick={() => focusCourse(course)}>
              {createCourseTitleElement(course)}
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

    
    const onSortEnd = ({oldIndex: from, newIndex: to}) => reorder(from, to);
    
    return (
        <div id="selected-courses">
          <SortableList
            items={order}
            onSortEnd={onSortEnd}
            helperClass="sortable float"
            distance={10}/>
        </div>
    );
};

const SelectedCoursesWrapper = connect(
    state => ({
        courses: state.get('schedule').get('courses'),
        order: state.get('schedule').get('order'),
    }),
    dispatch => ({
        reorder: (from, to) => dispatch(actions.reorder(from, to)),
        focusCourse: course => dispatch(actions.focusCourse(course)),
    }),
)(SelectedCourses);

export default SelectedCoursesWrapper;
