//import {ics} from './ics.js';

import jsPDF from 'jspdf';
import './jspdf.customfonts.debug';

import ROBOTO from './fonts/Roboto-Regular.ttf.js';
import ROBOTO_BOLD from './fonts/Roboto-Bold.ttf.js';

import * as util from 'hyperschedule-util';

import ical from 'ical-generator';

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
    background: 255,
    column: {
      even: 230,
      odd: 255,
    },
    border: 192,
  },
  padding: {
    course: 6,
    
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

  const pdf = new jsPDF({unit: 'pt', format: 'letter', orientation: 'l'});

  pdf.addFileToVFS('Roboto-Regular.ttf', ROBOTO);
  pdf.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD);
  pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
  pdf.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

  pdf.setFontSize(6);
  pdf.setLineWidth(.5);
  pdf.setDrawColor(config.color.border);

  const tableWidth = config.paper.width - (config.margin.left + config.margin.right);
  const tableHeight = config.paper.height - (config.margin.top + config.margin.bottom);

  const bodyWidth = tableWidth - config.first.columnWidth;
  const bodyHeight = tableHeight - config.first.rowHeight;

  const columnWidth = bodyWidth / 7;
  const rowHeight = bodyHeight / 16;

  pdf.setFillColor(config.color.background);
  pdf.rect(config.margin.left, config.margin.top, tableWidth, tableHeight, 'FS');

  for (let i = 0; i < 7; ++i) {
    const x = i * columnWidth + config.margin.left + config.first.columnWidth;
    if (i & 1) {
      pdf.setFillColor(config.color.column.odd);
    } else {
      pdf.setFillColor(config.color.column.even);
    }
    
    pdf.rect(x, config.margin.top, columnWidth, tableHeight, 'F');

    pdf.setFont('Roboto');
    pdf.setFontStyle('bold');
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

    pdf.setFont('Roboto');
    pdf.setFontStyle('normal');
    pdf.text(
      config.margin.left + config.first.columnWidth - 6,
      y + pdf.getLineHeight() + 3,
      times[i],
      'right',
    );
  }

  pdf.line(
    config.margin.left + config.first.columnWidth, config.margin.top,
    config.margin.left + config.first.columnWidth, config.margin.top + tableHeight,
  );

  for (const key of selected) {
    const course = courses.get(key);
    for (const slot of course.get('schedule')) {
      const start = util.parseTime(slot.get('startTime'));
      const end = util.parseTime(slot.get('endTime'));

      for (const day of slot.get('days')) {

        const x = dayIndex[day] * columnWidth +
              config.margin.left + config.first.columnWidth +
              (course.get('firstHalfSemester') ? 0 : columnWidth / 2);


        const width = util.courseHalfSemesters(course) * columnWidth / 2;
                                   
        const yStart = (start.hour - 8 + start.minute / 60) * rowHeight +
              config.margin.top + config.first.rowHeight;
        
        const yEnd = (end.hour - 8 + end.minute / 60) * rowHeight +
              config.margin.top + config.first.rowHeight;

        console.log(util.courseColor(course, 'rgbArray'));
        pdf.setFillColor(...util.courseColor(course, 'rgbArray'));

        pdf.rect(x, yStart, width, yEnd-yStart, 'F');
        
        pdf.setFont('Helvetica');
        const courseCodeLines = pdf.splitTextToSize(util.courseFullCode(course), width - 12);
        const courseNameLines = pdf.splitTextToSize(course.get('courseName'), width - 12);

        pdf.setFont('Roboto');
        const xText = x + width/2;
        const yText = (yStart + yEnd)/2 -
              (courseCodeLines.length + courseNameLines.length) * pdf.getLineHeight() / 2 +
              pdf.getLineHeight();
        pdf.setFontStyle('bold');
        pdf.text(xText, yText, courseCodeLines, 'center');
        pdf.setFontStyle('normal');
        pdf.text(xText, yText+courseCodeLines.length * pdf.getLineHeight(), courseNameLines, 'center');
      }
    }
  }
  
  const uri = pdf.output('datauristring');
  window.open(uri, 'hyperschedule.pdf');
  
};




const dayToICal = {
  U: 'SU',
  M: 'MO',
  T: 'TU',
  W: 'WE',
  R: 'TH',
  F: 'FR',
  S: 'SA',
};

export const exportICS = (courses, selected) => {
  const cal = ical();

  for (const key of selected) {
    const course = courses.get(key);
    for (const slot of course.get('schedule')) {

      const listedStartDay = new Date(course.get('startDate'));
      const listedStartWeekday = listedStartDay.getDay();
      const listedEndDay = new Date(course.get('endDate'));

      // Determine the first day of class. We want to pick the
      // weekday that occurs the soonest after (possibly on the same
      // day as) the listed start date.
      let startWeekday = null;
      let weekdayDifference = 7;
      for (const weekday of slot.get('days')) {

        const possibleStartWeekday = dayIndex[weekday];
        const possibleWeekdayDifference =
              (possibleStartWeekday - listedStartWeekday) % 7;
        if (possibleWeekdayDifference < weekdayDifference) {
          startWeekday = possibleStartWeekday;
          weekdayDifference = possibleWeekdayDifference;
        }
      }

      const description = util.courseFullCode(course) + ' ' +
            course.get('courseName') + '\n' +
            util.courseFacultyString(course);

      const start = new Date(listedStartDay.valueOf());
      start.setDate(start.getDate() + weekdayDifference);
      const {hour: startHours, minute: startMinutes} = util.parseTime(slot.get('startTime'));
      start.setHours(startHours);
      start.setMinutes(startMinutes);
      
      const end = new Date(start.valueOf());
      const {hour: endHours, minute: endMinutes} = util.parseTime(slot.get('endTime'));
      end.setHours(endHours);
      end.setMinutes(endMinutes);
      
      cal.createEvent({
        summary: course.get('courseName'),
        description,
        location: course.get('location'),
        start,
        end,
        repeating: {
          freq: 'WEEKLY',
          until: listedEndDay,
          interval: 1,
          byDay: Array.from(slot.get('days')).map(day => dayToICal[day]),
        },
      });

    }
  }

  const value = cal.toString();
  console.log(value);

  const uri = 'data:text/calendar;base64,' + btoa(value);
  window.open(uri, 'hyperschedule.ics');
};
