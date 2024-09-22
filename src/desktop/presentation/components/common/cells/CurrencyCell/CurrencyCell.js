import React from 'react'
import PropTypes from 'prop-types'
import { ERC20 } from '@constants'

import Spinner from '@components/common/Spinner'
import AmountField from '@components/common/AmountField'

import css from './CurrencyCell.module.scss'

const CurrencyCell = ({ amount, erc20, isLoading }) => {
  if (isLoading) return <Spinner />

  return (
    <AmountField
      iconClassName={css.icon}
      currency={ERC20[erc20]}
      amount={amount}
      placement="left"
  />
  )
}

CurrencyCell.propTypes = {
  erc20: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isLoading: PropTypes.bool,
}

export default CurrencyCell