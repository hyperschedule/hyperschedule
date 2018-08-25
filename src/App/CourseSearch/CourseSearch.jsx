import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {connect} from 'react-redux';
import {
  List as VirtualizedList,
  CellMeasurer,
  CellMeasurerCache,
  AutoSizer,
} from 'react-virtualized';
import 'react-virtualized/styles.css';

import CourseItem from '@/App/common/CourseItem/CourseItem';
import * as actions from './actions';
import * as courseUtil from '@/util/course';
import Mode from '@/App/mode';

import './CourseSearch.css';

const cache = new CellMeasurerCache({
  fixedWidth: true,
});

const CourseSearch = ({
  mode,
  courses,
  order,
  schedule,
  searchString,
  setSearch,
  focusCourse,
  addCourse,
}) => {
  const rowRenderer = ({key, index, parent, style}) => {
    const courseKey = order.get(index);
    const course = courses.get(courseKey);

    const focus = () => focusCourse(courseKey);
    const add = event => {
      addCourse(courseKey);
      event.stopPropagation();
    };

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        rowIndex={index}
        parent={parent}
        key={key}
      >
        <div style={{...style}}>
          <CourseItem
            code={courseUtil.courseFullCode(course)}
            color={courseUtil.courseColor(course)}
            scheduled={schedule.has(courseKey)}
            name={course.get('courseName')}
            status={courseUtil.courseStatusString(course)}
            focus={focus}
            add={add}
          />
        </div>
      </CellMeasurer>
    );
  };

  rowRenderer.propTypes = {
    key: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    parent: PropTypes.node.isRequired,
    style: PropTypes.object,
  };

  const listRenderer = ({height, width}) => (
    <VirtualizedList
      height={height}
      width={width}
      rowHeight={cache.rowHeight}
      rowCount={order.size}
      rowRenderer={rowRenderer}
    />
  );

  listRenderer.propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  return (
    <div
      id="course-search"
      className={mode === Mode.COURSE_SEARCH ? 'active' : 'inactive'}
    >
      <div className="search">
        <input
          type="text"
          placeholder="Search..."
          value={searchString}
          onChange={event => setSearch(event.target.value)}
        />
      </div>
      <div className="entries">
        <AutoSizer>{listRenderer}</AutoSizer>
      </div>
    </div>
  );
};

CourseSearch.propTypes = {
  mode: PropTypes.string.isRequired,
  courses: ImmutablePropTypes.mapOf(ImmutablePropTypes.map)
    .isRequired,
  order: ImmutablePropTypes.listOf(PropTypes.string).isRequired,
  schedule: ImmutablePropTypes.setOf(PropTypes.string).isRequired,
  searchString: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
  focusCourse: PropTypes.func.isRequired,
  addCourse: PropTypes.func.isRequired,
};

export default connect(
  state => {
    const searchString = state.getIn(['search', 'string']);
    const api = state.get('api');

    const courses = api.get('courses');
    const order = api
      .get('order')
      .filter(key =>
        courseUtil.courseMatches(courses.get(key), searchString),
      );

    return {
      mode: state.get('mode'),
      courses,
      order,
      schedule: state.get('schedule'),
      searchString,
    };
  },
  dispatch => ({
    setSearch: string => dispatch(actions.setSearch(string)),
    focusCourse: key => dispatch(actions.focusCourse(key)),
    addCourse: key => dispatch(actions.addCourse(key)),
  }),
)(CourseSearch);
