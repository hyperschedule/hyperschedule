import React from 'react';
import {connect} from 'react-redux';

import './ImportExport.css';

const ImportExport = ({schedule}) => {
  return (
    <div id='import-export'>
      <div className='body'>
        You can edit the JSON in another application.
        Be warned that your changes are not validated!
        <textarea className='data'
                  value={JSON.stringify(schedule.toJSON())}
                  readOnly/>
      </div>
      <div className='controls'>
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
