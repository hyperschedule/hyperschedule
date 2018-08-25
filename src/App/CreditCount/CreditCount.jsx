import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import * as util from '@/util/misc';
import * as courseUtil from '@/util/course';

import './CreditCount.css';

const CreditCount = ({credits}) => {
  const rows = [];
  for (const category in credits) {
    const categoryCredits = credits[category];
    rows.push(
      <tr key={category} className={['category', category].join(' ')}>
        <th>{category} credits:</th>
        <td>
          {categoryCredits.HM + 3 * categoryCredits.other} total
        </td>
        <td>({categoryCredits.HM} HMC,</td>
        <td>{categoryCredits.other} off-campus)</td>
      </tr>,
    );
  }

  return (
    <div id="credit-count">
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

CreditCount.propTypes = {
  credits: PropTypes.objectOf(
    PropTypes.shape({
      HM: PropTypes.number.isRequired,
      other: PropTypes.number.isRequired,
    }).isRequired,
  ).isRequired,
};

export default connect(
  state => {
    const selection = state.get('selection'),
      schedule = state.get('schedule'),
      order = selection.get('order'),
      starred = selection.get('starred'),
      checked = selection.get('checked'),
      courses = selection.get('courses');

    const credits = {
      selected: {
        HM: 0,
        other: 0,
      },
      checked: {
        HM: 0,
        other: 0,
      },
      scheduled: {
        HM: 0,
        other: 0,
      },
      starred: {
        HM: 0,
        other: 0,
      },
    };

    for (const key of order) {
      const course = courses.get(key);

      const school = course.get('school');
      const schoolKey = school === 'HM' ? 'HM' : 'other';

      const courseCredits = courseUtil.courseCredits(course);

      credits.selected[schoolKey] += courseCredits;
      if (checked.has(key)) {
        credits.checked[schoolKey] += courseCredits;
      }
      if (schedule.has(key)) {
        credits.scheduled[schoolKey] += courseCredits;
      }
      if (starred.has(key)) {
        credits.starred[schoolKey] += courseCredits;
      }
    }

    return {
      credits,
    };
  },
  () => ({}),
)(util.componentToJS(CreditCount));
