import React from 'react';
import {fromJS, Map, List, Iterable} from 'immutable';


export function deserializeCourse(data) {
  return fromJS(data);
}

const courseKeyFields = [
  'school', 'department', 'courseNumber', 'courseCodeSuffix', 'section',
];
export function courseKey(course) {
  return (
    courseKeyFields
      .map(field => course.get(field))
      .join('/')
  );
}

const courseCodeKeyFields = [
  'department', 'courseNumber', 'courseCodeSuffix',
];
export function courseCodeKey(course) {
  return (
    courseCodeKeyFields
      .map(field => course.get(field))
      .join('/')
  );
}

export function courseCode(course) {
  return course.get('department') + ' ' +
    course.get('courseNumber').toString().padStart(3, '0') +
    course.get('courseCodeSuffix');
}

  export function courseFullCode(course) {
    return courseCode(course) + ' ' +
      course.get('school') + '-' +
      course.get('section').toString().padStart(2, '0');
  }

  export function courseStatusString(course) {
  return `${course.get('courseStatus')}, ` +
    `${course.get('openSeats')}/${course.get('totalSeats')}`;
}

export function courseFacultyString(course) {
  return commaJoin(course.get('faculty').toJS());
}

export function courseHalfSemesters(course) {
  return course.get('firstHalfSemester') + course.get('secondHalfSemester');
}

export function courseCredits(course) {
  return course.get('quarterCredits') / 4;
}

export function courseMatches(course, search) {
  return course.get('courseName').toLowerCase().includes(
    search.toLowerCase(),
  );
}

function daysOverlap(daysA, daysB) {
  const daysASet = new Set(daysA);
  for (const dayB of daysB) {
    if (daysASet.has(dayB)) {
      return true;
    }
  }
  return false;
}

export function parseTime(timeString) {
  const [hourString, minuteString] = timeString.split(':');
  return {
    hour: parseInt(hourString),
    minute: parseInt(minuteString),
  };
}

export function timeToMinutes({hour, minute}) {
  return hour * 60 + minute;
}

export function coursesConflict(courseA, courseB) {
  if (!(courseA.get('firstHalfSemester') && courseB.get('firstHalfSemester') ||
        courseA.get('secondHalfSemester') && courseB.get('secondHalfSemester'))) {
    return false;
  }
  
  for (const slotA of courseA.get('schedule')) {
    for (const slotB of courseB.get('schedule')) {
      if (!daysOverlap(slotA.get('days'), slotB.get('days'))) {
        continue;
      }

      const startA = timeToMinutes(parseTime(slotA.get('startTime'))),
            startB = timeToMinutes(parseTime(slotB.get('startTime'))),
            endA = timeToMinutes(parseTime(slotA.get('endTime'))),
            endB = timeToMinutes(parseTime(slotB.get('endTime')));
      
      if (startA <= startB && startB < endA ||
          startB <= startA && startA < endB) {
        return true;
      }
    }
  }

  return false;  
}

export function coursesRedundant(courseA, courseB) {
  return courseCodeKey(courseA) === courseCodeKey(courseB);
}

export const componentToJS = Component => props => {
  const jsProps = {};
  
  for (const key in props) {
    const value = props[key];
    
    if (Iterable.isIterable(value)) {
      jsProps[key] = value.toJS();
      continue;
    }

    jsProps[key] = value;
  }

  return <Component {...jsProps}/>;
};

                                 function commaJoin(items, comma = ',') {
                                   switch (true) {
                                   case items.length === 1:
                                     return items[0];
                                   case items.length === 2:
                                     return items.join(' and ');
                                   case items.length >= 3:
                                     return items.slice(0, -1).join(comma + ' ') + comma +' and ' + items[-1];
                                   default:
                                     return '';
                                   }
                                 };


                                 //export class Course {
                                 // constructor(data) {
                                 //   this.data = data;
                                 //
                                 //   this.key = [
                                 //     'school', 'department', 'courseNumber', 'courseCodeSuffix', 'section'
                                 //   ].map(field => this.data.get(field)).join('/');
                                 //
                                 //   this.courseGroupKey = [
                                 //     'school', 'department', 'courseNumber', 'courseCodeSuffix'
                                 //   ].map(field => this.data.get(field)).join('/');
                                 //
                                 //   this.credits = this.data.get('quarterCredits') * .25;
                                 //
                                 //   this.halfSemesters = (
//     this.data.get('firstHalfSemester') + this.data.get('secondHalfSemester')
//   );
//   
//   this.scheduleGroups = [];
//   for (const groupData of this.data.get('schedule')) {
//
//     let redundant = false;
//     for (const previous of this.scheduleGroups) {
//       if (groupData.equals(previous.data)) {
//         redundant = true;
//         break;
//       }
//     }
//
//     if (redundant) {
//       continue;
//     }
//
//     this.scheduleGroups.push(new ScheduleGroup(groupData));
//
//   }
//
//   this.scheduleSlots = this.scheduleGroups.map(group => (
//     group.slots
//   )).reduce((slots, nextSlots) => slots.concat(nextSlots), []);
//
//   this.courseCodeString = this.data.get('department') + ' ' +
//     this.data.get('courseNumber').toString().padStart(3, '0') +
//     this.data.get('courseCodeSuffix') + ' ' +
//     this.data.get('school') + '-' +
//     this.data.get('section').toString().padStart(2, '0');
//   
//   this.courseCodeFields = [
//     this.field('department'),
//     this.field('courseNumber', s => s.toString().padStart(3, '0')),
//     this.field('courseCodeSuffix'),
//     this.field('school'),
//     this.field('section', s => s.toString().padStart(2, '0')),
//   ];
//   
//   this.titleFields = this.courseCodeFields.concat([
//     this.field('courseName'),
//   ]);
//
//   this.statusFields = [
//     this.field('courseStatus'),
//     this.field('openSeats'),
//     this.field('totalSeats'),
//   ];
//
//   this.creditFields = [(
//     <span key="duration" className="field duration">
//       {this.halfSemesters == 1 ? 'half' : 'full'}
//     </span>
//   ), (
//     <span key="credits" className="field credits">
//       {this.credits} {this.credits === 1 ? 'credit' : 'credits'}
//     </span>
//   )];
//
//   this.dataClasses = ['school', 'department'].map(field => (
//     field + '-' + this.data.get(field)
//   ));
//
//   this.facultyString = commaJoin(this.data.get('faculty'));
// }
//
// field(field, format = s => s) {
//   return (
//     <span key={field} className={['field', field].join(' ')}>
//       {format(this.data.get(field))}
    //     </span>
    //   );
    // }
//
// matches(search) {
//   return this.data.get('courseName').toLowerCase().includes(
//     search.toLowerCase(),
//   );
// }
//
// equivalent(other) {
//   return this.courseGroupKey === other.courseGroupKey;
// }
//
// conflicts(other) {
//   
//   if (!(this.data.get('firstHalfSemester') && other.data.get('firstHalfSemester') ||
//         this.data.get('secondHalfSemester') && other.data.get('secondHalfSemester'))) {
//     return false;
//   }
//   
//   for (const slot of this.scheduleSlots) {
//     for (const otherSlot of other.scheduleSlots) {
//       if (slot.day === otherSlot.day &&
//           slot.timeSlot.overlaps(otherSlot.timeSlot)) {
//         return true;
//       }
//     }
//   }
//
//   return false;
// }
//
// toJS() {
//   return {
//     ...this,
//     data: this.data.toJS(),
//   };
// }
//
// toJSON() {
//   return this.data.toJS();
// }
//
//
//
// class ScheduleGroup {
//   constructor(data) {
//     this.days = data.get('days').split('');
//     this.timeSlot = new TimeSlot(
//       data.get('startTime'),
//       data.get('endTime'),
//     );
//
//     
//     this.slots = this.days.map(day => ({
//       day,
//       timeSlot: this.timeSlot,
//     }));
//
//     this.fields = ['days', 'startTime', 'endTime', 'location'].map(field => (
//       <span key={field} className={['field', field].join(' ')}>
//         {this.data.get(field)}
//       </span>
//     ));
//
//   }
//
// }
//
// class TimeSlot {
//   constructor(start, end) {
//     this.start = new Time(start);
//     this.end = new Time(end);
//   }
//
//   overlaps(other) {
//     switch (this.start.compare(other.start)) {
//     case -1:
//       return this.end.compare(other.start) === 1;
//     case 1:
//       return this.start.compare(other.end) === -1;
//     default:
//       return true;
//     }
//   }
// }
//
//
// class Time {
//   constructor(s) {
//     const [hourString, minuteString] = s.split(':');
//     this.hour = parseInt(hourString);
//     this.minute = parseInt(minuteString);
//   };
//
//   compare(other) {
//     switch (true) {
//     case this.hour < other.hour:
//       return -1;
//     case this.hour > other.hour:
//       return 1;
//     default:
//       switch (true) {
//       case this.minute < other.minute:
//         return -1;
//       case this.minute > other.minute:
//         return 1;
//       default:
//         return 0;
//       }
//     }
//   }
// }


