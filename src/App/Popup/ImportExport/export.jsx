//import {ics} from './ics.js';

import jsPDF from 'jspdf';

const config = {
  margin: {
    top: .5 * 72,
    bottom: .5 * 72,
    right: .5 * 72,
    left: .5 * 72,
  },
  paper: {
    height: 8.5 * 72,
    width: 11 * 72,
  },
  first: {
    rowHeight: .25 * 72,
    columnWidth: .75 * 72,
  },
  color: {
    column: {
      even: 230,
      odd: 255,
    },
    border: 192,
  },
};

const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const times = [
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '1:00 pm',
  '2:00 pm',
  '3:00 pm',
  '4:00 pm',
  '5:00 pm',
  '6:00 pm',
  '7:00 pm',
  '8:00 pm',
  '9:00 pm',
  '10:00 pm',
  '11:00 pm',
];

const dayIndex = {
  U: 0,
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
  S: 6,
};

export const exportPDF = (courses, selected) => {

  var doc = new jsPDF({unit: 'pt', format: 'letter', orientation: 'l'});
  const pdf = doc;

  pdf.setFontSize(6);
  pdf.setLineWidth(.5);
  pdf.setDrawColor(config.color.border);

  const tableWidth = config.paper.width - (config.margin.left + config.margin.right);
  const tableHeight = config.paper.height - (config.margin.top + config.margin.bottom);

  const bodyWidth = tableWidth - config.first.columnWidth;
  const bodyHeight = tableHeight - config.first.rowHeight;

  const columnWidth = bodyWidth / 7;
  const rowHeight = bodyHeight / 16;

  pdf.setFontStyle('bold');
  for (let i = 0; i < 7; ++i) {
    const x = i * columnWidth + config.margin.left + config.first.columnWidth;
    if (i & 1) {
      pdf.setFillColor(config.color.column.odd);
    } else {
      pdf.setFillColor(config.color.column.even);
    }
    
    pdf.rect(x, config.margin.top, columnWidth, tableHeight, 'F');
    pdf.text(
      x + columnWidth/2,
      config.margin.top + config.first.rowHeight / 2 + pdf.getLineHeight() / 2,
      days[i],
      'center',
    );
  }

  pdf.setFontStyle('normal');
  for (let i = 0; i < 16; ++i) {
    const y = i * rowHeight + config.margin.top + config.first.rowHeight;
    pdf.line(config.margin.left, y, config.margin.left + tableWidth, y);
    pdf.text(
      config.margin.left + config.first.columnWidth - 6,
      y + pdf.getLineHeight() + 6,
      times[i],
      'right',
    );
  }

  pdf.line(
    config.margin.left + config.first.columnWidth, config.margin.top,
    config.margin.left + config.first.columnWidth, config.margin.top + tableHeight,
  );
  pdf.rect(config.margin.left, config.margin.top, tableWidth, tableHeight, 'S');

  pdf.setFont('Helvetica');

  for (const key of selected) {
    const course = courses.get(key);
    for (const {day, timeSlot: {start, end}} of course.scheduleSlots) {
      const x = dayIndex[day] * columnWidth +
            config.margin.left + config.first.columnWidth;
      const yStart = (start.hour - 8 + start.minute / 60) * rowHeight +
            config.margin.top + config.first.rowHeight;
      const yEnd = (end.hour - 8 + end.minute / 60) * rowHeight +
            config.margin.top + config.first.rowHeight;

      pdf.setFillColor(128);

      pdf.rect(x, yStart, columnWidth, yEnd-yStart, 'F');

      const lines = pdf.splitTextToSize(course.data.get('courseName'), columnWidth - 12);

      const xText = x + columnWidth/2;
      const yText = (yStart + yEnd)/2 - (lines.length + 1) * pdf.getLineHeight() / 2 + pdf.getLineHeight();
      pdf.setFontStyle('bold');
      pdf.text(xText, yText, course.courseCodeString, 'center');
      pdf.setFontStyle('normal');
      pdf.text(xText, yText+pdf.getLineHeight(), lines, 'center');
    }
  }
  
  //const x = pdf.splitTextToSize('lorem ipsum dolor sit amet', 50);
  //pdf.text(x, 15, 15);
  
  const uri = pdf.output('datauristring');
  window.open(uri, 'hyperschedule.pdf');
                       
};









  
  //

  //const dayToICal = {
  //  U: 'SU',
//  M: 'MO',
//  T: 'TU',
//  W: 'WE',
//  R: 'TH',
//  F: 'FR',
//  S: 'SA',
//};
//
//function convertDayToICal(day) {
//  return dayToICal[day];
//}
//
//function weekdayCharToInteger(weekday)
//{
//  const index = "UMTWRFS".indexOf(weekday);
//  if (index < 0)
//  {
//    throw Error("Invalid weekday: " + weekday);
//  }
//  return index;
//}
//
//// See https://github.com/nwcell/ics.js/issues/26.
//function uglyHack(input) {
//  return input.replace(/\n/g, "\\n").replace(/,/g, "\\,");
//}
//
//  function downloadICalFile(scheduled) {
//    const cal = ics();
//    for (const course of scheduled) {
//      if (course.starred) {
//        const subject = course.courseName;
//        // Why use a literal \n in the description? Bug in ics.js, see
//        // .
//        const description = uglyHack(
//          course.courseCodeString + ' ' +
//            course.data.get('courseName') + '\n' +
//            course.facultyString);
//        const listedStartDay = new Date(course.data.get('startDate'));
//        const listedStartWeekday = listedStartDay.getDay();
//        const listedEndDay = new Date(course.data.get('endDate'));
//        // The range is inclusive, but ics.js interprets it exclusively.
//        listedEndDay.setDate(listedEndDay.getDate() + 1);
//        for (const slot of course.scheduleSlots) {
//          const location = uglyHack(slot.data.get('location'));
//          // Determine the first day of class. We want to pick the
//          // weekday that occurs the soonest after (possibly on the same
//          // day as) the listed start date.
//          let startWeekday = null;
//          let weekdayDifference = 7;
//          for (const weekday of slot.days) {
//            const possibleStartWeekday = weekdayCharToInteger(weekday);
//            const possibleWeekdayDifference =
//                  (possibleStartWeekday - listedStartWeekday) % 7;
//            if (possibleWeekdayDifference < weekdayDifference)
//            {
//              startWeekday = possibleStartWeekday;
//              weekdayDifference = possibleWeekdayDifference;
//            }
//          }
//          
//          // See https://stackoverflow.com/a/563442/3538165.
//          const start = new Date(listedStartDay.valueOf());
//          start.setDate(start.getDate() + weekdayDifference);
//          const [startHours, startMinutes] =
//                timeStringToHoursAndMinutes(slot.data.get('startTime'));
//          start.setHours(startHours);
//          start.setMinutes(startMinutes);
//          const end = new Date(start.valueOf());
//          const [endHours, endMinutes] =
//                timeStringToHoursAndMinutes(slot.data.get('endTime'));
//          end.setHours(endHours);
//          end.setMinutes(endMinutes);
//          const freq = "WEEKLY";
//          const until = listedEndDay;
//          const interval = 1;
//          const byday = slot.days.split("").map(convertDayToICal);
//          const rrule = {
//            freq, until, interval, byday,
//          };
//          cal.addEvent(subject, description, location, start, end, rrule);
//        }
//      }
//    }
//    cal.download("hyperschedule-export");
//  }
//
