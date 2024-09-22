import React from 'react'

import { GET_BLOCKCHAIN_EPOCH } from '@actions'

import { CurrencyCell } from '@components/common/cells'
import { connect } from '@state'
import { isInitialLoading } from '@state/getters'

export default connect(
  (state, { epochid, erc20 }) => {
    const isLoading = isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [epochid, erc20])

    return {
      isLoading
    }
  }
)(React.memo(CurrencyCell))