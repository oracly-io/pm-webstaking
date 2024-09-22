import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import { STATUSES } from '@constants'

import css from './Status.module.scss'

const Status = ({ status }) => {
  return (
    <span className={cn(css.status, {
      [css.pending]: status === STATUSES.PENDING,
      [css.staked]: status === STATUSES.STAKED,
      [css.pendingUnstaked]: status === STATUSES.PENDING_UNSTAKED,
      [css.unstaked]: status === STATUSES.UNSTAKED,
      [css.withdrawn]: status === STATUSES.WITHDRAWN,
    })}>
      {status}
    </span>
  )
}

Status.propTypes = {
  status: PropTypes.string,
}

export default Status