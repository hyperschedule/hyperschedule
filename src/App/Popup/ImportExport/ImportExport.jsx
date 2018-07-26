import React from 'react';
import {connect} from 'react-redux';

const ImportExport = ({schedule}) => {
  return (
    <div>
      <div>
        {JSON.stringify(schedule.toJS())}
      </div>
    </div>
  );
};

export default connect(
  state => ({
    schedule: state.get('app').get('schedule'),
  }),
  dispatch => ({}),
)(ImportExport);
