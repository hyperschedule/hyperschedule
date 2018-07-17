import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Button } from 'semantic-ui-react';

const CourseSearchItem = ({course, courseId, onClick}) => {
  return (
    <Segment>
      {course.courseName}
      <Button floated='right'
              icon='plus'
              onClick={onClick}
              courseid={courseId}/>
    </Segment>
  );
};

CourseSearchItem.propTypes = {
  course: PropTypes.object.isRequired,
  courseId: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
};

export default CourseSearchItem;
