import React from 'react';
import {connect} from 'react-redux';

import * as util from 'hyperschedule-util';

import Measure from 'react-measure';

import * as actions from './actions';

import './FocusSummary.css';

const FocusSummary = ({course, height, setHeight}) => {        
    let summary = null;
    if (course !== null) {


        const schedule = course.scheduleGroups;
        const scheduleRow = course.scheduleGroups.length === 0 ? null : (
            <div className="row schedule">
              {course.scheduleGroups.map((group, index) => (
                  <div key={index} className="block">
                    {group.fields}
                  </div>
              ))}
            </div>
        );
        
        summary = (
            <div className="summary">
              <div className="row title fields">
                {course.titleFields}
              </div>
              {scheduleRow}
              <div className="row faculty">
                {course.facultyString}
              </div>
              <div className="row credit fields">
                {course.creditFields}
              </div>
            </div>
        );
    }

    const focusSummaryMeasure = ({measureRef}) => (
        <div ref={measureRef} className="measure">
          {summary}
        </div>
    );


    return (
        <div id="focus-summary">
          <div className="overflow" style={{
                   height: height + 'px',
               }}>
            <Measure offset onResize={({offset: {height}}) => setHeight(height)}>
              {focusSummaryMeasure}
            </Measure>
          </div>
        </div>
    );
};

const FocusSummaryWrapper = connect(
    state => ({
        course: state.get('app').get('focus').get('course'),
        height: state.get('app').get('focus').get('height'),
    }),
    dispatch => ({
        setHeight: height => dispatch(actions.setHeight(height))
    }),
)(FocusSummary);

export default FocusSummaryWrapper;

