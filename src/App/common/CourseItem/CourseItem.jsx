import PropTypes from "prop-types";
import React from "react";
import {connect} from "react-redux";

import "./CourseItem.css";
import * as courseUtil from "@/util/course";
import * as util from "@/util/misc";

function CourseItem({
  code,
  name,
  color,
  status,
  focus,
  add,
  remove,
  starred,
  checked,
  selected,
  scheduled,
  toggleStarred,
  toggleChecked,
}) {
  const checkButton =
    toggleChecked === undefined ? null : (
      <span className="toggle check" onClick={toggleChecked}>
        <i
          className={
            "ion-md-" + (checked ? "checkbox" : "square-outline")
          }
        />
      </span>
    );

  const starButton =
    toggleStarred === undefined ? null : (
      <span className={"toggle star"} onClick={toggleStarred}>
        <i className={"ion-md-star" + (starred ? "" : "-outline")} />
      </span>
    );

  const addButton =
    add === undefined || selected ? null : (
      <button className="right add ion-md-add" onClick={add} />
    );

  const removeButton =
    remove === undefined ? null : (
      <button
        className="right remove ion-md-close"
        onClick={remove}
      />
    );

  return (
    <div
      className={["course", "item"]
        .concat(scheduled ? ["scheduled"] : [])
        .join(" ")}
      style={{
        backgroundColor: color,
      }}
      onClick={focus}
    >
      {checkButton}
      {starButton}
      <span className="label">
        <span className="code">{code}</span>{" "}
        <span className="name">{name}</span>{" "}
        <span className="status">({status})</span>
      </span>
      {addButton}
      {removeButton}
    </div>
  );
}

CourseItem.propTypes = {
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,

  starred: PropTypes.bool.isRequired,
  checked: PropTypes.bool.isRequired,
  scheduled: PropTypes.bool.isRequired,
  selected: PropTypes.bool.isRequired,

  focus: PropTypes.func.isRequired,
  add: PropTypes.func,
  remove: PropTypes.func,
  toggleStarred: PropTypes.func,
  toggleChecked: PropTypes.func,
};

export default connect((state, {course}) => {
  const key = courseUtil.courseKey(course);
  const selection = state.get("selection");

  return {
    scheduled: state.get("schedule").has(key),
    checked: selection.get("checked").has(key),
    starred: selection.get("starred").has(key),
    selected: selection.get("courses").has(key),
    code: courseUtil.courseFullCode(course),
    color: courseUtil.courseColor(course),
    name: course.get("courseName"),
    status: courseUtil.courseStatusString(course),
  };
})(util.componentToJS(CourseItem));
