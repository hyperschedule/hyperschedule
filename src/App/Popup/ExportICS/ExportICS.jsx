import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import * as exportUtil from "@/util/export";

import "./ExportICS.css";

function ExportICS({exportSchedule, exportStarred}) {
  return (
    <div id="export-ics">
      <div className="description" />
      <div className="controls">
        <button
          className="button export-schedule"
          onClick={exportSchedule}
        >
          Export all scheduled courses
        </button>
        <button
          className="button export-starred"
          onClick={exportStarred}
        >
          Export starred courses only
        </button>
        <button className="button cancel">Cancel</button>
      </div>
    </div>
  );
}

ExportICS.propTypes = {
  exportSchedule: PropTypes.func.isRequired,
  exportStarred: PropTypes.func.isRequired,
};

export default connect(state => {
  const courses = state.get("selection").get("courses");
  const starred = state.get("selection").get("starred");
  const schedule = state.get("schedule");

  return {
    exportSchedule: () => exportUtil.exportICS(courses, schedule),
    exportStarred: () => exportUtil.exportICS(courses, starred),
  };
})(ExportICS);
