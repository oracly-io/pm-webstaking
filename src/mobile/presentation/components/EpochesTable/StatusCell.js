import React from 'react'

import { GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, GET_BLOCKCHAIN_EPOCH } from '@actions'
import Status from '@components/common/Status'
import Spinner from '@components/common/Spinner'
import { connect } from '@state'
import { getActualEpochId, isInitialLoading } from '@state/getters'

import css from './StatusCell.module.scss'

const StatusCell = ({ status, spinnerClassName, isLoading }) => {
  return isLoading ? <Spinner className={spinnerClassName} /> : <Status status={status} />
}

export default connect(
  (state, { epochid, erc20 }) => {
    const actualEpochId = getActualEpochId(state)
    const isLoading = isInitialLoading(state, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID) ||
      isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [actualEpochId, erc20]) ||
      isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [epochid, erc20])

    return {
      isLoading,
      spinnerClassName: css.spinner
    }
  }
)(React.memo(StatusCell))