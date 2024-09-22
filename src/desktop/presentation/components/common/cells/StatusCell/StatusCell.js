import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import { STATUSES } from '@constants'
import Spinner from '@components/common/Spinner'

import css from './StatusCell.module.scss'

const StatusCell = ({ status, isLoading }) => {
  if (isLoading) return <Spinner />

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

StatusCell.propTypes = {
  status: PropTypes.string,
  isLoading: PropTypes.bool,
}

export default StatusCell