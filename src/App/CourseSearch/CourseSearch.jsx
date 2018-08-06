import React from 'react';
import {connect} from 'react-redux';

import CourseItem from '@/App/common/CourseItem/CourseItem';

import * as actions from './actions';

import * as util from '@/util/hyperschedule-util';

import {Mode} from '@/App/mode';

import {List, CellMeasurer, CellMeasurerCache, AutoSizer} from 'react-virtualized';
import 'react-virtualized/styles.css';

import './CourseSearch.css';

const cache = new CellMeasurerCache({
  fixedWidth: true,    
});

const classFields = ['department', 'school'];

const CourseSearch = ({
  mode,
  courses,
  searchString,
  setSearch,
  focusCourse,
  addCourse,
}) => {

  const rowRenderer = ({key, index, parent, style}) => {
    const courseKey = courses.keySeq().get(index);
    const course = courses.get(courseKey);

    const focus = () => focusCourse(course);
    const add = event => {
      addCourse(course);
      event.stopPropagation();
    };

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        rowIndex={index}
        parent={parent}
        key={key}>
        <div style={{...style}}>
          <CourseItem code={util.courseFullCode(course)}
                      color={util.courseColor(course)}
                      name={course.get('courseName')}
                      status={util.courseStatusString(course)}
                      focus={focus}
                      add={add}/>
        </div>
      </CellMeasurer>
    );
  };

  const listRenderer = ({height, width}) => (
    <List height={height}
          width={width}
          rowHeight={cache.rowHeight}
          rowCount={courses.size}
          rowRenderer={rowRenderer}/>
  );
  
  return (
    <div id="course-search" className={mode === Mode.COURSE_SEARCH ? 'active' : 'inactive'}>
      <div className="search">
        <input type="text"
               placeholder="Search..."
               value={searchString}
               onChange={event => setSearch(event.target.value)}/>
      </div>
      <div className="entries">
        <AutoSizer>
          {listRenderer}
        </AutoSizer>
      </div>
    </div>
  );
};

const CourseSearchWrapper = connect(
  state => {
    const searchString = state.getIn(['search', 'string']);

    return {
      mode: state.get('mode'),
      courses: state.get('courses').filter(course => (
        util.courseMatches(course, searchString)
      )),
      searchString,
    };
  },
  dispatch => ({
    setSearch: string => dispatch(actions.setSearch(string)),
    focusCourse: course => dispatch(actions.focusCourse(course)),
    addCourse: course => dispatch(actions.addCourse(course)),
  }),
)(CourseSearch);


export default CourseSearchWrapper;
