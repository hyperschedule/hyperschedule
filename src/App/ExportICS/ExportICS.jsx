import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import Popup from "@/App/common/Popup/Popup";
import exportICS from "@/util/export/ics";
import * as actions from "./actions";

import "./ExportICS.css";

function ExportICS({visible, close, exportSchedule, exportStarred}) {
  return (
    <Popup title="Export to iCal" visible={visible} close={close}>
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
          <button className="button cancel" onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </Popup>
  );
}

ExportICS.propTypes = {
  visible: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  exportSchedule: PropTypes.func.isRequired,
  exportStarred: PropTypes.func.isRequired,
};

export default connect(
  state => {
    const courses = state.get("selection").get("courses");
    const starred = state.get("selection").get("starred");
    const schedule = state.get("schedule");

    return {
      visible: state.get("exportICS").get("visible"),
      exportSchedule: () => exportICS(courses, schedule),
      exportStarred: () => exportICS(courses, starred),
    };
  },
  dispatch => ({
    close: () => dispatch(actions.close()),
  }),
)(ExportICS);
