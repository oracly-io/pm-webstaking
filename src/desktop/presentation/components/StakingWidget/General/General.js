import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import { ERC20 } from '@constants'
import AmountField from '@components/common/AmountField'
import Spinner from '@components/common/Spinner'

import css from './General.module.scss'

const General = ({
  className,
  isLoading,
  isLoadingCollected,
  splitted,
  epoch = 0,
  erc20,
  stakingErc20,
  stakes = 0,
  staked = 0,
  collected = 0,
}) => {
  return (
    <div className={cn(css.container, { [css.splitted]: splitted }, className)}>
      <span>
        <div className={css.row}>
          <div className={css.name}>Epoch</div>
          <div className={css.amount}>{isLoading ? <Spinner /> : epoch}</div>
        </div>
        <div className={css.row}>
          <div className={css.name}>Stakes</div>
          <div className={css.amount}>{isLoading ? <Spinner /> : stakes}</div>
        </div>
      </span>
      <span>
        <div className={css.row}>
          <div className={css.name}>Staked</div>
          {isLoading ? <Spinner /> : (
            <AmountField
              iconClassName={css.icon}
              amount={staked}
              currency={ERC20[stakingErc20]}
            />
          )}
        </div>
        <div className={css.row}>
          <div className={css.name}>Collected</div>
          {isLoadingCollected ? <Spinner /> : (
            <AmountField
              iconClassName={css.icon}
              amount={collected}
              currency={ERC20[erc20]}
            />
          )}
        </div>
      </span>
    </div>
  )
}

General.propTypes = {
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  isLoadingCollected: PropTypes.bool,
  epoch: PropTypes.string,
  stakes: PropTypes.string,
  staked: PropTypes.string,
  collected: PropTypes.string
}

export default React.memo(General)