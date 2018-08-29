import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import * as actions from "./actions";

import "./ImportExport.css";

const ImportExport = ({
  data,

  setData,
  apply,
  close,
  exportPDF,
  exportICS,
}) => {
  const textareaRef = React.createRef();

  const copy = () => {
    textareaRef.current.select();
    document.execCommand("copy");
  };

  return (
    <div id="import-export">
      <div className="body">
        You can edit the JSON in another application. Be warned that
        your changes are not validated!
        <textarea
          className="data"
          value={data}
          onChange={setData}
          ref={textareaRef}
        />
      </div>
      <div className="controls">
        <button className="button export pdf" onClick={copy}>
          <i className="ion-md-copy" />
        </button>
        <button className="button export pdf" onClick={exportPDF}>
          Export (PDF)
        </button>
        <button className="button export ical" onClick={exportICS}>
          Export (iCal)
        </button>
        <button className="button apply" onClick={apply}>
          Apply
        </button>
        <button className="button cancel" onClick={close}>
          Cancel
        </button>
      </div>
    </div>
  );
};

ImportExport.propTypes = {
  data: PropTypes.string.isRequired,
  setData: PropTypes.func.isRequired,
  apply: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  exportPDF: PropTypes.func.isRequired,
  exportICS: PropTypes.func.isRequired,
};

export default connect(
  state => {
    return {
      data: state.get("importExport").get("data"),
    };
  },
  dispatch => ({
    setData: event => dispatch(actions.setData(event.target.value)),
    apply: () => {
      dispatch(actions.applyData());
      dispatch(actions.close());
    },
    close: () => dispatch(actions.close()),
    exportPDF: () => dispatch(actions.exportPDF()),
    exportICS: () => dispatch(actions.exportICS()),
  }),
)(ImportExport);
