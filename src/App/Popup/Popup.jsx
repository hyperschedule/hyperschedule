import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import ExportICS from "./ExportICS/ExportICS";
import ExportPDF from "./ExportPDF/ExportPDF";
import Help from "./Help/Help";
import ImportExport from "./ImportExport/ImportExport";

import "./Popup.css";
import Mode from "./mode";
import * as actions from "./actions";

const stopPropagation = event => event.stopPropagation();

const title = {
  [Mode.HELP]: "Help",
  [Mode.IMPORT_EXPORT]: "Import/export data",
  [Mode.EXPORT_PDF]: "Export to PDF",
  [Mode.EXPORT_ICS]: "Export to iCal",
};

const content = {
  [Mode.HELP]: <Help />,
  [Mode.IMPORT_EXPORT]: <ImportExport />,
  [Mode.EXPORT_PDF]: <ExportPDF />,
  [Mode.EXPORT_ICS]: <ExportICS />,
};

const Popup = ({mode, visible, close}) => {
  return (
    <div
      id="popup"
      className={visible ? " visible" : ""}
      onClick={close}
    >
      <div className="box" onClick={stopPropagation}>
        <div className="header">
          <span className="title">{title[mode]}</span>
          <button className="close" onClick={close}>
            <i className="ion-md-close" />
          </button>
        </div>
        <div className="content">{content[mode]}</div>
      </div>
    </div>
  );
};

Popup.propTypes = {
  mode: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
};

export default connect(
  state => {
    const popup = state.get("popup");
    return {
      mode: popup.get("mode"),
      visible: popup.get("visible"),
    };
  },
  dispatch => ({
    close: () => dispatch(actions.close()),
  }),
)(Popup);
