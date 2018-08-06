import React from 'react';
import {connect} from 'react-redux';

import CourseBlock from './CourseBlock/CourseBlock';

import * as actions from './actions';

import {Mode} from '@/App/mode';

import './Schedule.css';

import * as util from '@/util/hyperschedule-util';

const timeToRow = ({hour, minute}) => (
  ((hour - 8) * 60 + minute) / 5 + 2
);

const dayIndex = {
  U: 0,
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
  S: 6,
};

const dayToColumn = day => (
  dayIndex[day] * 2 + 2
);

const Schedule = ({mode, courses, schedule, starred, focusCourse}) => {

  const blocks = schedule.map(key => {
    const course = courses.get(key);
    const halfOffset = course.get('firstHalfSemester') ? 0 : 1;

    return course.get('schedule').map(slot => {
      return Array.from(slot.get('days')).map(day => {

        const gridStyle = {
          gridRowStart: timeToRow(util.parseTime(slot.get('startTime'))),
          gridRowEnd: timeToRow(util.parseTime(slot.get('endTime'))),
          gridColumnStart: dayToColumn(day) + halfOffset,
          gridColumnEnd: 'span ' + util.courseHalfSemesters(course),
        };

        const focus = () => focusCourse(key);

        return (
          <CourseBlock key={day}
                       color={util.courseColor(course)}
                       code={util.courseFullCode(course)}
                       name={course.get('courseName')}
                       gridStyle={gridStyle}
                       focus={focus}/>
        );
        
      });
    });

  });

  return (
    <div id="schedule" className={mode === Mode.SCHEDULE ? 'active' : ''}>
      <div className="margin-container">
        <div className="size-container">
          <div className="grid">
            <div className="column header"></div>
            <div className="column even" style={{gridColumnStart: 2 + 2 * 0}}></div>
            <div className="column odd"  style={{gridColumnStart: 2 + 2 * 1}}></div>
            <div className="column even" style={{gridColumnStart: 2 + 2 * 2}}></div>
            <div className="column odd"  style={{gridColumnStart: 2 + 2 * 3}}></div>
            <div className="column even" style={{gridColumnStart: 2 + 2 * 4}}></div>
            <div className="column odd"  style={{gridColumnStart: 2 + 2 * 5}}></div>
            <div className="column even" style={{gridColumnStart: 2 + 2 * 6}}></div>

            <div className="column-label even" style={{gridColumnStart: 2 + 2 * 0}}>Sunday</div>
            <div className="column-label odd"  style={{gridColumnStart: 2 + 2 * 1}}>Monday</div>
            <div className="column-label even" style={{gridColumnStart: 2 + 2 * 2}}>Tuesday</div>
            <div className="column-label odd"  style={{gridColumnStart: 2 + 2 * 3}}>Wednesday</div>
            <div className="column-label even" style={{gridColumnStart: 2 + 2 * 4}}>Thursday</div>
            <div className="column-label odd"  style={{gridColumnStart: 2 + 2 * 5}}>Friday</div>
            <div className="column-label even" style={{gridColumnStart: 2 + 2 * 6}}>Saturday</div>

            <div className="row header"></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 0 }}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 1 }}></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 2 }}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 3 }}></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 4 }}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 5 }}></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 6 }}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 7 }}></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 8 }}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 9 }}></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 10}}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 11}}></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 12}}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 13}}></div>
            <div className="row even" style={{gridRowStart: 2 + 12 * 14}}></div>
            <div className="row odd"  style={{gridRowStart: 2 + 12 * 15}}></div>

            <div className="row-label even" style={{gridRowStart: 2 + 12 * 0 }}>8:00 am</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 1 }}>9:00 am </div>
            <div className="row-label even" style={{gridRowStart: 2 + 12 * 2 }}>10:00 am</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 3 }}>11:00 am</div>
            <div className="row-label even" style={{gridRowStart: 2 + 12 * 4 }}>12:00 pm</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 5 }}>1:00 pm</div>
            <div className="row-label even" style={{gridRowStart: 2 + 12 * 6 }}>2:00 pm</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 7 }}>3:00 pm</div>
            <div className="row-label even" style={{gridRowStart: 2 + 12 * 8 }}>4:00 pm</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 9 }}>5:00 pm</div>
            <div className="row-label even" style={{gridRowStart: 2 + 12 * 10}}>6:00 pm</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 11}}>7:00 pm</div>
            <div className="row-label even" style={{gridRowStart: 2 + 12 * 12}}>8:00 pm</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 13}}>9:00 pm</div>
            <div className="row-label even" style={{gridRowStart: 2 + 12 * 14}}>10:00 pm</div>
            <div className="row-label odd"  style={{gridRowStart: 2 + 12 * 15}}>11:00 pm</div>

            {blocks}

          </div>
        </div>
      </div>
    </div>
  ); 
};


export default connect(
  state => {
    const selection = state.get('selection');
    return ({
      mode: state.get('mode'),
      schedule: state.get('schedule'),
      courses: selection.get('courses'),
      starred: selection.get('starred'),
    });
  },
  dispatch => ({
    focusCourse: key => dispatch(actions.focusCourse(key)),
  }),
)(Schedule);


