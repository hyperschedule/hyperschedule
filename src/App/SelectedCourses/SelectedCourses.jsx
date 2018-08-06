import React from 'react';
import {connect} from 'react-redux';

import CourseItem from 'App/common/CourseItem/CourseItem';

import * as actions from './actions';

import * as util from 'hyperschedule-util';

import './SelectedCourses.css';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';


const SortableItem = SortableElement(({props}) => {
  return (
    <CourseItem {...props}/>
  );
});

const SortableList = SortableContainer(({items}) => {
  return (
    <div className="list">
      {
        items.map(({key, props}, index) => (
          <SortableItem index={index} key={key} props={props}/>
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

  const courseItems = order.map(key => {
    const course = courses.get(key);

    return {
      key,
      props: {
        code: util.courseFullCode(course),
        name: course.get('courseName'),
        status: util.courseStatusString(course),
        focus: () => focusCourse(course),
        checked: checked.has(key),
        starred: starred.has(key),
        remove: event => {
          removeCourse(key);
          event.stopPropagation();
        },
        toggleChecked: event => {
          toggleCourseChecked(key);
          event.stopPropagation();
        },
        toggleStarred: event => {
          toggleCourseStarred(key);
          event.stopPropagation();
        },
      },
    };
  });

  return (
    <div id="selected-courses">
      <SortableList
        items={courseItems}
        onSortEnd={onSortEnd}
        helperClass="sortable course item float"
        distance={10}/>
    </div>
  );
};

const SelectedCoursesWrapper = connect(
  state => {
    const selection = state.getIn(['app', 'schedule', 'selection']);
    
    return ({
      courses: selection.get('courses'),
      order: selection.get('order'),
      checked: selection.get('checked'),
      starred: selection.get('starred'),
    });
  },
  dispatch => ({
    reorder: (from, to) => dispatch(actions.reorder(from, to)),
    focusCourse: course => dispatch(actions.focusCourse(course)),
    removeCourse: key => dispatch(actions.removeCourse(key)),
    toggleCourseChecked: key => dispatch(actions.toggleCourseChecked(key)),
    toggleCourseStarred: key => dispatch(actions.toggleCourseStarred(key)),
  }),
)(SelectedCourses);

export default SelectedCoursesWrapper;
