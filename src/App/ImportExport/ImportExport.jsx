import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import Popup from "@/App/common/Popup/Popup";
import * as actions from "./actions";

import "./ImportExport.css";

const ImportExport = ({
  visible,
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
    <Popup title="Import/export data" visible={visible} close={close}>
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
    </Popup>
  );
};

ImportExport.propTypes = {
  data: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,

  setData: PropTypes.func.isRequired,
  apply: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  exportPDF: PropTypes.func.isRequired,
  exportICS: PropTypes.func.isRequired,
};

export default connect(
  state => {
    const importExport = state.get("importExport");
    return {
      data: importExport.get("data"),
      visible: importExport.get("visible"),
    };
  },
  dispatch => ({
    setData: event => dispatch(actions.setData(event.target.value)),
    apply: () => {
      dispatch(actions.applyData());
      dispatch(actions.close());
    },
    close: () => dispatch(actions.close()),
    exportPDF: () => {
      dispatch(actions.exportPDF());
      dispatch(actions.close());
    },
    exportICS: () => {
      dispatch(actions.exportICS());
      dispatch(actions.close());
    },
  }),
)(ImportExport);
