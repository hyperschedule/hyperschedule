import React from 'react';
import { createSlotEntity } from '../model';

const MainPanelSchedule = ({schedule}) => {
  let entities = [];
  for (let course of schedule)
  {
    for (let slot of course.schedule)
    {
      for (let day of slot.days)
      {
        const entity = createSlotEntity(
          course, day, slot.startTime, slot.endTime);
        if (entity)
        {
          entities.push(entity);
        }
      }
    }
  }
  return (
    <div>
      <table id="schedule-table">
        <thead>
          <th className="schedule-hour schedule-hour-0"></th>
          <th className="schedule-day schedule-day-1">M</th>
          <th className="schedule-day schedule-day-2">T</th>
          <th className="schedule-day schedule-day-3">W</th>
          <th className="schedule-day schedule-day-4">T</th>
          <th className="schedule-day schedule-day-5">F</th>
        </thead>
        <tbody id="schedule-table-body">
          <tr><td className="schedule-hour-1 schedule-hour">8am</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-2 schedule-hour">9am</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-3 schedule-hour">10am</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-4 schedule-hour">11am</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-5 schedule-hour">12pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-6 schedule-hour">1pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-7 schedule-hour">2pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-8 schedule-hour">3pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-9 schedule-hour">4pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-10 schedule-hour">5pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-11 schedule-hour">6pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-12 schedule-hour">7pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-13 schedule-hour">8pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-14 schedule-hour">9pm</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="schedule-hour-15 schedule-hour">10pm</td><td></td><td></td><td></td><td></td><td></td></tr>
        </tbody>
        {entities}
      </table>
    </div>
  );
};

export default MainPanelSchedule;
