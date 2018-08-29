import ImmutablePropTypes from "react-immutable-proptypes";
import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import {exportICS, exportPDF} from "@/util/export";
import * as actions from "./actions";
import * as courseUtil from "@/util/course";

import "./ImportExport.css";

const ImportExport = ({
  data,
  setData,
  apply,
  close,
  schedule,
  selection,
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
        <button
          className="button export pdf"
          onClick={() => exportPDF(selection, schedule)}
        >
          Export (PDF)
        </button>
        <button
          className="button export ical"
          onClick={() => exportICS(selection, schedule)}
        >
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
  selection: ImmutablePropTypes.mapContains({
    courses: ImmutablePropTypes.mapOf(courseUtil.coursePropType)
      .isRequired,
    order: ImmutablePropTypes.listOf(PropTypes.string).isRequired,
    starred: ImmutablePropTypes.setOf(PropTypes.string).isRequired,
    checked: ImmutablePropTypes.setOf(PropTypes.string).isRequired,
  }).isRequired,
  schedule: ImmutablePropTypes.setOf(PropTypes.string).isRequired,
};

export default connect(
  state => {
    return {
      data: state.get("importExport").get("data"),
      selection: state.get("selection"),
      schedule: state.get("schedule"),
    };
  },
  dispatch => ({
    setData: event => dispatch(actions.setData(event.target.value)),
    apply: () => {
      dispatch(actions.applyData());
      dispatch(actions.close());
    },
    close: () => dispatch(actions.close()),
  }),
)(ImportExport);
