import React from 'react'

import { GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { CurrencyCell } from '@components/common/cells'
import { connect } from '@state'
import { isInitialLoading } from '@state/getters'

export default connect(
  (state, { depositid, erc20 }) => ({
    isLoading: isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, [depositid, erc20])
  })
)(React.memo(CurrencyCell))