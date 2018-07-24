import React from 'react';
import {connect} from 'react-redux';

import * as actions from './actions';

import './Schedule.css';

import * as util from 'hyperschedule-util';

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

const Schedule = ({courses, scheduled, starred, focusCourse}) => {
  const courseBlocks = scheduled.map(courseKey => {
    const course = courses.get(courseKey);

    return course.scheduleGroups.map((group, index) => {
      return group.days.map(day => {

        const gridStyle = {
          gridRowStart: timeToRow(group.timeSlot.start),
          gridRowEnd: timeToRow(group.timeSlot.end),
          gridColumn: dayIndex[day] + 2,
        };

        const className = ['course'].concat(course.dataClasses).join(' ');
        
        return (
          <div key={day} className={className} style={gridStyle}
               onClick={() => focusCourse(course)}>
            <div className="course-code fields">
              {course.titleFields}
            </div>
          </div>
        );
        
      });
    });

  });
  
  return (
    <div id="schedule">
      <div className="margin-container">
        <div className="size-container">
          <div className="grid">
            <div className="column header"></div>
            <div className="column even" style={{gridColumnStart: 2}}></div>
            <div className="column odd"  style={{gridColumnStart: 3}}></div>
            <div className="column even" style={{gridColumnStart: 4}}></div>
            <div className="column odd"  style={{gridColumnStart: 5}}></div>
            <div className="column even" style={{gridColumnStart: 6}}></div>
            <div className="column odd"  style={{gridColumnStart: 7}}></div>
            <div className="column even" style={{gridColumnStart: 8}}></div>

            <div className="column-label even" style={{gridColumnStart: 2}}>Sunday</div>
            <div className="column-label odd"  style={{gridColumnStart: 3}}>Monday</div>
            <div className="column-label even" style={{gridColumnStart: 4}}>Tuesday</div>
            <div className="column-label odd"  style={{gridColumnStart: 5}}>Wednesday</div>
            <div className="column-label even" style={{gridColumnStart: 6}}>Thursday</div>
            <div className="column-label odd"  style={{gridColumnStart: 7}}>Friday</div>
            <div className="column-label even" style={{gridColumnStart: 8}}>Saturday</div>

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

            {courseBlocks}

          </div>
        </div>
      </div>
    </div>
  ); 
};

const ScheduleWrapper = connect(
  state => ({
    courses: state.get('app').get('schedule').get('selection').get('courses'),
    order: state.get('app').get('schedule').get('selection').get('order'),
    starred: state.get('app').get('schedule').get('selection').get('starred'),
    scheduled: state.get('app').get('schedule').get('scheduled'),
  }),
  dispatch => ({
    focusCourse: course => dispatch(actions.focusCourse(course)),
  }),
)(Schedule);

export default ScheduleWrapper;

