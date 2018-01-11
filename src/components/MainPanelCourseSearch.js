import React from 'react';
import VisibleCourseSearchInput from '../containers/VisibleCourseSearchInput';
import VisibleCourseSearchList from '../containers/VisibleCourseSearchList';

const MainPanelCourseSearch = () => {
  return (
      <React.Fragment>
      <VisibleCourseSearchInput />
      <VisibleCourseSearchList />
      </React.Fragment>
  );
};

export default MainPanelCourseSearch;
