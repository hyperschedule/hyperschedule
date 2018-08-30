import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import "./CourseBlock.css";

import * as courseUtil from "@/util/course";
import * as util from "@/util/misc";

function CourseBlock({code, name, focus, gridStyle, color, starred}) {
  return (
    <div
      className={util.classMap({
        course: true,
        block: true,
        starred: starred,
      })}
      style={{
        ...gridStyle,
        backgroundColor: color,
      }}
      onClick={focus}
    >
      <div className="star" />
      <div className="label">
        <div className="code">{code}</div>
        <div className="name">{name}</div>
      </div>
    </div>
  );
}

CourseBlock.propTypes = {
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  focus: PropTypes.func.isRequired,
  gridStyle: PropTypes.object,
  color: PropTypes.string.isRequired,
  starred: PropTypes.bool.isRequired,
};

export default connect((state, {course}) => {
  const key = courseUtil.courseKey(course);
  const selection = state.get("selection");

  return {
    color: courseUtil.courseColor(course),
    code: courseUtil.courseFullCode(course),
    starred: selection.get("starred").has(key),
    name: course.get("courseName"),
  };
})(util.componentToJS(CourseBlock));
