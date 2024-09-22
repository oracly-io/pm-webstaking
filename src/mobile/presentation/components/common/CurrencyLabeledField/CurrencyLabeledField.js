import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import BalanceCurrency from '@oracly/pm-react-components/app/mobile/components/common/BalanceCurrency'

import LabeledField from '../LabeledField'
import CurrencyField from '../CurrencyField'

import css from './CurrencyLabeledField.module.scss'

const CurrencyLabeledField = ({
  className,
  labelClassName,
  amountClassName,
  currencyClassName,
  contentClassName,
  spinnerClassName,
  isLoading,
  label,
  amount,
  currency,
  withIcon,
}) => {
  const stakeIconRenderer = useCallback(() => (
    <BalanceCurrency className={css.currency} currency={currency} />
  ), [currency])

  return (
    <LabeledField
      className={className}
      labelClassName={labelClassName}
      contentClassName={contentClassName}
      label={label}
      iconRenderer={withIcon ? stakeIconRenderer : undefined}
    >
      <CurrencyField
        isLoading={isLoading}
        amountClassName={amountClassName}
        currencyClassName={currencyClassName}
        spinnerClassName={spinnerClassName}
        amount={amount}
        currency={currency}
      />
    </LabeledField>
  )
}

CurrencyLabeledField.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  labelClassName: PropTypes.string,
  amountClassName: PropTypes.string,
  currencyClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  spinnerClassName: PropTypes.string,
  isLoading: PropTypes.bool,
  withIcon: PropTypes.bool,
}

export default React.memo(CurrencyLabeledField)