import React from 'react'

import { GET_BLOCKCHAIN_EPOCH } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT } from '@actions'
import { CurrencyCell } from '@components/common/cells'
import { connect } from '@state'
import { isInitialLoading } from '@state/getters'

import css from './RewardCell.module.scss'

export default connect(
  (state, { depositid, epochid, erc20 }) => {
    const isLoading = isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT, [depositid]) ||
      isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [epochid, erc20])

    return {
      isLoading,
      spinnerClassName: css.spinner,
    }
  }
)(React.memo(CurrencyCell))