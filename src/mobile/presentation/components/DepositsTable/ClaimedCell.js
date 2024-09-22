import PropTypes from 'prop-types'
import React from 'react'

import { GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { CurrencyCell } from '@components/common/cells'
import { connect } from '@state'
import { isInitialLoading } from '@state/getters'

import css from './ClaimedCell.module.scss'

const ClaimedCell = ({
  amount,
  erc20,
  isLoading,
}) => {
  return (
    <span className={css.container}>
      <CurrencyCell
        erc20={erc20}
        amount={amount}
        isLoading={isLoading}
      />
    </span>
  )
}

ClaimedCell.propTypes = {
  amount: PropTypes.string.isRequired,
  depositid: PropTypes.string.isRequired,
  erc20: PropTypes.string.isRequired,
}

export default connect(
  (state, { depositid, erc20 }) => ({
    isLoading: isInitialLoading(state, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT, [depositid, erc20])
  })
)(React.memo(ClaimedCell))