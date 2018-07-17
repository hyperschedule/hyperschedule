import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';

const CourseSearchInput = ({value, onChange}) => {
  return (
    <Input fluid
           icon='search'
           label='course:'
           value={value}
           onChange={onChange} />
  );
};

CourseSearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default CourseSearchInput;
