import React from 'react';
import {connect} from 'react-redux';

import { createSlotEntity } from '../../model';
        import './Schedule.css';

    const Schedule = ({schedule}) => {
        const backgroundCells = [];
        for (let hour = 0; hour < 12; ++hour) {
            const row = [];
            for (let day = 0; day < 6; ++day) {
                row.push(
                    <div key={day} className="cell"></div>
                );
            }
            backgroundCells.push(row);
        }
        
        let entities = [];
        
        for (let course of schedule)
        {
            for (let slot of course.schedule)
            {
                for (let day of slot.days)
                {
                    const entity = createSlotEntity(course, day, slot.startTime, slot.endTime);
                    if (entity)
                    {
                        entities.push(entity);
                    }
                }
            }
        }
        
        return (
            <div id="schedule">
              <div className="background layer">
                {backgroundCells}
              </div>
              <div className="courses layer">
                {entities}
              </div>
            </div>
        );
    };

    const ScheduleWrapper = connect(
        state => ({schedule: state.get('courseList')}),
        dispatch => ({}),
    )(Schedule);

    export default ScheduleWrapper;

