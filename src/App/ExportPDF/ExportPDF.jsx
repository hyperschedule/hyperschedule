import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import Popup from "@/App/common/Popup/Popup";
import * as actions from "./actions";
import * as exportUtil from "@/util/export";

import "./ExportPDF.css";

function ExportPDF({visible, close, exportSchedule, exportStarred}) {
  return (
    <Popup title="Export to PDF" visible={visible} close={close}>
      <div id="export-pdf">
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
    </Popup>
  );
}

ExportPDF.propTypes = {
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
      visible: state.get("exportPDF").get("visible"),
      exportSchedule: () => exportUtil.exportPDF(courses, schedule),
      exportStarred: () => exportUtil.exportPDF(courses, starred),
    };
  },
  dispatch => ({
    close: () => dispatch(actions.close()),
  }),
)(ExportPDF);
