import React from 'react'

import { GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, GET_BLOCKCHAIN_EPOCH } from '@actions'
import { StatusCell } from '@components/common/cells'
import { connect } from '@state'
import { getActualEpochId, isInitialLoading } from '@state/getters'

export default connect(
  (state, { epochid, erc20 }) => {
    const actualEpochId = getActualEpochId(state)
    const isLoading = isInitialLoading(state, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID) ||
      isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [actualEpochId, erc20]) ||
      isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [epochid, erc20])

    return {
      isLoading
    }
  }
)(React.memo(StatusCell))