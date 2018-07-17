import React from 'react';
import PropTypes from 'prop-types';

import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import VisibleCourseListItem from '../containers/VisibleCourseListItem';

const SortableItem = SortableElement(
  ({value}) =>
    <VisibleCourseListItem courseId={value}/>
);

const SortableList = SortableContainer(
  ({items}) => {
    return (
      <ul>
        {items.map((value, index) => (
          <SortableItem key={`item-${index}`} index={index} value={value} />
        ))}
      </ul>
    );
  }
);

const CourseSearchList = ({courseList, onSortEnd}) => {
  return <SortableList items={courseList} onSortEnd={onSortEnd} />;
};

CourseSearchList.propTypes = {
  courseList: PropTypes.array.isRequired,
  onSortEnd: PropTypes.func.isRequired
};

export default CourseSearchList;
