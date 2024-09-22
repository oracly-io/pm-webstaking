import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import { htmlCurrency } from '@oracly/pm-libs/html-utils'

import Spinner from '@components/common/Spinner'

import css from './CurrencyField.module.scss'

const CurrencyField = ({
  className,
  amountClassName,
  currencyClassName,
  spinnerClassName,
  isLoading,
  amount = 0,
  currency,
}) => {
  return (
    <div className={cn(css.container, className)}>
      {isLoading ? (
        <Spinner className={cn(css.spinner, spinnerClassName)} />
      ) : (
        <span className={cn(css.amount, amountClassName)}>{htmlCurrency(amount)}</span>
      )}
      <span className={cn(css.currency, currencyClassName)}>{currency}</span>
    </div>
  )
}

CurrencyField.propTypes = {
  className: PropTypes.string,
  amountClassName: PropTypes.string,
  currencyClassName: PropTypes.string,
  spinnerClassName: PropTypes.string,
  isLoading: PropTypes.bool,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
}

export default React.memo(CurrencyField)