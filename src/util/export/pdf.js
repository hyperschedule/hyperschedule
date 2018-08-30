import jsPDF from "jspdf";

import * as courseUtil from "@/util/course";
import * as util from "@/util/misc";

// paper margins
const marginTop = 0.5 * 72;
const marginBottom = 0.5 * 72;
const marginRight = 0.5 * 72;
const marginLeft = 0.5 * 72;

// paper dimensions
const paperHeight = 8.5 * 72;
const paperWidth = 11 * 72;

// text baseline offset for vertical position tuning
const textBaselineOffset = 1;

// label dimensions
const columnLabelHeight = 0.25 * 72;
const rowLabelWidth = 0.75 * 72;

// paddings
const rowLabelPaddingTop = 3;
const rowLabelPaddingRight = 6;
const coursePadding = 6;

// colors
const paperColor = [255];
const gridLineColor = [192];
const columnEvenColor = [230];
const columnOddColor = [255];
const rowLabelColor = [128];
const columnLabelColor = [0];
const courseTextColor = [0];

// font styles/variants
const columnLabelFontStyle = "bold";
const rowLabelFontStyle = "normal";
const courseCodeFontStyle = "bold";
const courseNameFontStyle = "normal";

// global font styles
const font = "Helvetica";
const fontSize = 6;

// label texts
const columnLabel = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const rowLabel = [
  "8:00 am",
  "9:00 am",
  "10:00 am",
  "11:00 am",
  "12:00 pm",
  "1:00 pm",
  "2:00 pm",
  "3:00 pm",
  "4:00 pm",
  "5:00 pm",
  "6:00 pm",
  "7:00 pm",
  "8:00 pm",
  "9:00 pm",
  "10:00 pm",
  "11:00 pm",
];

// derived/computed dimensions
const tableWidth = paperWidth - (marginLeft + marginRight);
const tableHeight = paperHeight - (marginTop + marginBottom);

const bodyWidth = tableWidth - rowLabelWidth;
const bodyHeight = tableHeight - columnLabelHeight;

const columnWidth = bodyWidth / 7;
const rowHeight = bodyHeight / 16;

// convert time to y-position
const timeToY = time =>
  marginTop +
  columnLabelHeight +
  (time.hour - 8 + time.minute / 60) * rowHeight;

const dayToX = day =>
  marginLeft + rowLabelWidth + util.dayIndex[day] * columnWidth;

export default function exportPDF(courses, keys) {
  // initialize pdf object
  const pdf = new jsPDF({
    unit: "pt",
    format: "letter",
    orientation: "landscape",
  });

  // set global styles
  pdf.setFont(font);
  pdf.setFontSize(fontSize);
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(...gridLineColor);

  // fill paper with opaque white background
  pdf.setFillColor(...paperColor);
  pdf.rect(0, 0, paperWidth, paperHeight, "F");

  // draw column backgrounds (alternating even/odd fill) and labels
  pdf.setFontStyle(columnLabelFontStyle);
  pdf.setTextColor(...columnLabelColor);
  for (let i = 0; i < 7; ++i) {
    // top-left corner of column rectangle
    const x = marginLeft + rowLabelWidth + i * columnWidth;
    const y = marginTop;

    // draw column background
    pdf.setFillColor(...(i & 1 ? columnOddColor : columnEvenColor));
    pdf.rect(x, y, columnWidth, tableHeight, "F");

    // compute column label text anchor position
    const xLabel = x + columnWidth / 2;
    const yLabel =
      y +
      columnLabelHeight / 2 +
      pdf.getLineHeight() / 2 -
      textBaselineOffset;

    // render column label
    pdf.text(xLabel, yLabel, columnLabel[i], "center");
  }

  // draw vertical gridline to separate row labels from table body
  pdf.line(
    marginLeft + rowLabelWidth,
    marginTop,
    marginLeft + rowLabelWidth,
    marginTop + tableHeight,
  );

  // draw row gridlines and labels
  pdf.setFontStyle(rowLabelFontStyle);
  pdf.setTextColor(...rowLabelColor);
  for (let i = 0; i < 16; ++i) {
    // left endpoint of upper-gridline
    const x = marginLeft;
    const y = marginTop + columnLabelHeight + i * rowHeight;

    // draw upper-gridline
    pdf.line(marginLeft, y, marginLeft + tableWidth, y);

    // compute row label text anchor position
    const xLabel = x + rowLabelWidth - rowLabelPaddingRight;
    const yLabel =
      y +
      pdf.getLineHeight() +
      rowLabelPaddingTop -
      textBaselineOffset;

    // draw row label
    pdf.text(xLabel, yLabel, rowLabel[i], "right");
  }

  // draw course slot entities
  pdf.setTextColor(...courseTextColor);
  for (const key of keys) {
    // get course object
    const course = courses.get(key);

    for (const slot of course.get("schedule")) {
      // parse start and end times
      const start = courseUtil.parseTime(slot.get("startTime"));
      const end = courseUtil.parseTime(slot.get("endTime"));

      for (const day of slot.get("days")) {
        // compute slot positions
        const x =
          dayToX(day) +
          (course.get("firstHalfSemester") ? 0 : columnWidth / 2);
        const yStart = timeToY(start);
        const yEnd = timeToY(end);

        // compute width based on half-full semester
        const width =
          courseUtil.courseHalfSemesters(course) * (columnWidth / 2);

        // set course color
        pdf.setFillColor(
          ...courseUtil.courseColor(course, "rgbArray"),
        );

        // draw schedule block
        pdf.rect(x, yStart, width, yEnd - yStart, "F");

        // manually wrap course code and course name text into multiple lines
        const splitTextToSize = text =>
          pdf.splitTextToSize(text, width - 2 * coursePadding);

        const courseCodeLines = splitTextToSize(
          courseUtil.courseFullCode(course),
        );
        const courseNameLines = splitTextToSize(
          course.get("courseName"),
        );

        // compute course label dimensions and positions
        const courseCodeHeight =
          courseCodeLines.length * pdf.getLineHeight();
        const courseNameHeight =
          courseNameLines.length * pdf.getLineHeight();

        const textHeight = courseCodeHeight + courseNameHeight;

        const xText = x + width / 2;
        const yText =
          (yStart + yEnd) / 2 -
          textHeight / 2 +
          pdf.getLineHeight() -
          textBaselineOffset;

        // render course code label
        pdf.setFontStyle(courseCodeFontStyle);
        pdf.text(xText, yText, courseCodeLines, "center");

        // render course name label
        pdf.setFontStyle(courseNameFontStyle);
        pdf.text(
          xText,
          yText + courseCodeHeight,
          courseNameLines,
          "center",
        );
      }
    }
  }

  // render outermost border/gridline
  pdf.rect(marginLeft, marginTop, tableWidth, tableHeight, "S");

  // save pdf
  pdf.save("hyperschedule.pdf");
}
