import PropTypes from "prop-types";
import React from "react";

import "./Popup.css";
import * as util from "@/util/misc";

function stopPropagation(event) {
  event.stopPropagation();
}

const Popup = ({title, children, visible, close}) => {
  return (
    <div
      className={util.classMap({popup: true, visible})}
      onClick={close}
    >
      <div className="box" onClick={stopPropagation}>
        <div className="header">
          <span className="title">{title}</span>
          <button className="close" onClick={close}>
            <i className="ion-md-close" />
          </button>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

Popup.propTypes = {
  title: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default Popup;
