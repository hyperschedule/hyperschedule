import React from 'react';

export class Course {
  constructor(data) {
    this.data = data;

    this.key = [
      'school', 'department', 'courseNumber', 'courseCodeSuffix', 'section'
    ].map(field => this.data.get(field)).join('/');

    this.credits = this.data.get('quarterCredits') * .25;

    this.halfSemesters = (
      this.data.get('firstHalfSemester') + this.data.get('secondHalfSemester')
    );

    
    this.scheduleGroups = [];
    this.data.get('schedule').map(groupData => {

      let redundant = false;
      for (const previous of this.scheduleGroups) {
        if (groupData.equals(previous.data)) {
          redundant = true;
          break;
        }
      }

      if (redundant) {
        return;
      }

      this.scheduleGroups.push(new ScheduleGroup(groupData));

    });

    this.scheduleSlots = this.scheduleGroups.map(group => (
      group.slots
    )).reduce((slots, nextSlots) => slots.concat(nextSlots), []);

    this.courseCodeFields = [
      this.field('department'),
      this.field('courseNumber', s => s.toString().padStart(3, '0')),
      this.field('courseCodeSuffix'),
      this.field('school'),
      this.field('section', s => s.toString().padStart(2, '0')),
    ];
    
    this.titleFields = this.courseCodeFields.concat([
      this.field('courseName'),
    ]);

    this.statusFields = [
      this.field('courseStatus'),
      this.field('openSeats'),
      this.field('totalSeats'),
    ];

    this.creditFields = [(
      <span key="duration" className="field duration">
        {this.halfSemesters == 1 ? 'half' : 'full'}
      </span>
    ), (
      <span key="credits" className="field credits">
        {this.credits} {this.credits === 1 ? 'credit' : 'credits'}
      </span>
    )];

    this.dataClasses = ['school', 'department'].map(field => (
      field + '-' + this.data.get(field)
    ));

    this.facultyString = commaJoin(this.data.get('faculty'));
  }




  field(field, format = s => s) {
    return (
      <span key={field} className={['field', field].join(' ')}>
        {format(this.data.get(field))}
      </span>
    );
  }

  matches(search) {
    return this.data.get('courseName').toLowerCase().includes(
      search.toLowerCase(),
    );
  }

  conflicts(other) {
    for (const slot of this.scheduleSlots) {
      for (const otherSlot of other.scheduleSlots) {
        if (slot.day === otherSlot.day &&
            slot.timeSlot.overlaps(otherSlot.timeSlot)) {
          return true;
        }
      }
    }

    return false;
  }

  toJS() {
    return {
      ...this,
      data: this.data.toJS(),
    };
  }

  toJSON() {
    return this.data.toJS();
  }

}

class ScheduleGroup {
  constructor(data) {
    this.data = data;
    
    this.days = this.data.get('days').split('');
    this.timeSlot = new TimeSlot(
      this.data.get('startTime'),
      this.data.get('endTime'),
    );

    
    this.slots = this.days.map(day => ({
      day,
      timeSlot: this.timeSlot,
    }));

    this.fields = ['days', 'startTime', 'endTime', 'location'].map(field => (
      <span key={field} className={['field', field].join(' ')}>
        {this.data.get(field)}
      </span>
    ));

  }

}

class TimeSlot {
  constructor(start, end) {
    this.start = new Time(start);
    this.end = new Time(end);
  }

  overlaps(other) {
    switch (this.start.compare(other.start)) {
    case -1:
      return this.end.compare(other.start) === 1;
    case 1:
      return this.start.compare(other.end) === -1;
    default:
      return true;
    }
  }
}


class Time {
  constructor(s) {
    const [hourString, minuteString] = s.split(':');
    this.hour = parseInt(hourString);
    this.minute = parseInt(minuteString);
  };

  compare(other) {
    switch (true) {
    case this.hour < other.hour:
      return -1;
    case this.hour > other.hour:
      return 1;
    default:
      switch (true) {
      case this.minute < other.minute:
        return -1;
      case this.minute > other.minute:
        return 1;
      default:
        return 0;
      }
    }
  }
}


const commaJoin = (items, comma = ',') => {
  switch (true) {
  case items.size === 1:
    return items.join('');
  case items.size === 2:
    return items.join(' and ');
  case items.size >= 3:
    return items.slice(0, -1).join(comma + ' ') + comma +' and ' + items.get(-1);
  default:
    return '';
  }
};
