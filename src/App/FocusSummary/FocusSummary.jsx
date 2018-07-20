import React from 'react';
import {connect} from 'react-redux';

import {createCourseTitleElement} from '../util';

import Measure from 'react-measure';

import * as actions from './actions';

import './FocusSummary.css';

    const FocusSummary = ({course, height, setHeight}) => {        
    let summary = null;
    if (course !== null) {
        const schedule = course.get('schedule');
        const faculty = course.get('faculty');
        
        const scheduleBlocks = schedule.map((block, index) => (
            <div key={index} className="block">
              <span className="days">
                {block.get('days')}
              </span>
              <span className="start-time">
                {block.get('startTime')}
              </span>
              <span className="end-time">
                {block.get('endTime')}
              </span>
              <span className="location">
                {block.get('location')}
              </span>
            </div>
        ));

        const scheduleRow = schedule.size === 0 ? null : (
            <div className="row schedule">
              {scheduleBlocks}
            </div>
        );
        
        summary = (
            <div className="summary">
              <div className="row title">
                {createCourseTitleElement(course)}
              </div>
              {scheduleRow}
              <div className="row faculty">
                {
                    faculty.size === 1 ? (
                        faculty.get(0)
                    ) : faculty.size === 2 ? (
                        faculty.join(' and ')
                    ) : faculty.size === 3 ? (
                        faculty.slice(0, -1).join(', ') + ', and ' + faculty.get(-1)
                    ) : null
                }
              </div>
            </div>
        );
    }

    const updateHeight = ({offset}) => this.setState({
        focusSummaryHeight: offset.height,
    });

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
        course: state.get('focus').get('course'),
        height: state.get('focus').get('height'),
    }),
    dispatch => ({
        setHeight: height => dispatch(actions.setHeight(height))
    }),
)(FocusSummary);

export default FocusSummaryWrapper;

