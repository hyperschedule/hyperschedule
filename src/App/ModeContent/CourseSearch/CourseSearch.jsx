import React from 'react';
import {connect} from 'react-redux';

import {createCourseTitleElement} from '../../util';

import * as actions from './actions';

//import SearchList from './SearchList';
import CourseSearchInput from './CourseSearchInput';

import {List, CellMeasurer, CellMeasurerCache, AutoSizer} from 'react-virtualized';
import 'react-virtualized/styles.css';

import './CourseSearch.css';

const cache = new CellMeasurerCache({
    fixedWidth: true,    
});

const classFields = ['department', 'school'];

const CourseSearch = ({courses, searchString, setSearch, focusCourse, addCourse}) => {

    const rowRenderer = ({key, index, parent, style}) => {
        const courseKey = courses.keySeq().get(index);
        const course = courses.get(courseKey);

        const classList = ['entry', 'course'];
        for (const field of classFields) {
            classList.push(field + '-' + course.get(field));
        }

        return (
            <CellMeasurer
              cache={cache}
              columnIndex={0}
              rowIndex={index}
              parent={parent}
              key={key}>
              <div style={{...style}}>
                <div
                  className={classList.join(' ')}
                  onClick={event => focusCourse(course)}>
                  {createCourseTitleElement(course)}
                  <button className="right add" onClick={event => {
                        addCourse(course);
                        event.stopPropagation();
                    }}>
                    +
                  </button>
                </div>
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
        <div id="course-search">
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
        const searchString = state.get('search').get('string');

        return {
            courses: state.get('courses').filter(course => (
                course.get('courseName').toLowerCase().includes(
                    searchString.toLowerCase(),
                )
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
