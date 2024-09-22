import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'
import BalanceCurrency from '@oracly/pm-react-components/app/desktop/components/common/BalanceCurrency'

import { ORCY_ADDRESS, USDC_ADDRESS } from '@constants'
import { ERC20 } from '@constants'
import Spinner from '@components/common/Spinner'
import Button from '@components/common/Button'
import Dropdown from '@components/common/Dropdown'
import DropdownIcon from '@components/SVG/DropdownIcon'

import css from './StakingDropdown.module.scss'

const options = [
  { erc20: ORCY_ADDRESS },
  { erc20: USDC_ADDRESS },
]

const Option = ({ className, option }) => {
  return (
    <span className={cn(css.optionRenderer, className)}>
      <span className={css.optionIcon}>
        <BalanceCurrency
          currency={ERC20[option.erc20]}
          className={css.optionBalance}
        />
      </span>
      <span className={css.optionLabel}>{ERC20[option.erc20]}</span>
    </span>
  )
}

const StakingDropdown = ({
  className,
  erc20,
  disabled,
  disabledDropdown,
  isLoading,
  onClick,
  onChange,
}) => {

  const option = options.find((option) => option.erc20 === erc20)
  const currency = ERC20[option.erc20]

  const modifiers = useMemo(() => [{
    name: 'body-position',
    enabled: true,
    phase: 'beforeWrite',
    requires: ['computeStyles'],
    fn: ({ state }) => {
      state.styles.popper.top = '3px'
      state.styles.popper.left = '-48px'
    },
  }], [])

  const valueRenderer = useCallback(() => <DropdownIcon />, [])
  const optionRenderer = useCallback((option) => <Option option={option} />, [])
  const handleClick = useCallback(() => onClick(erc20), [onClick, erc20])
  const handleChange = useCallback((option) => onChange(option.erc20), [])

  return (
    <div className={cn(css.container, className)}>
      <Button
        className={cn(css.stake, { [css.disabled]: disabled })}
        onClick={handleClick}
        disabled={disabled}
      >
        {isLoading ? <Spinner /> : (
          <>
            <BalanceCurrency
              fill="#843CCC"
              className={css.icon}
              currency={currency}
            />
            <span>{currency}</span>
          </>
        )}
      </Button>
      <Dropdown
        headerClassName={cn(css.header, { [css.disabled]: disabledDropdown } )}
        iconClassName={css.icon}
        bodyClassName={css.body}
        valueClassName={cn(css.value, { [css.disabled]: disabledDropdown } )}
        optionClassName={css.option}
        iconColor="#DCE7CD"
        value={option}
        showIcon={false}
        options={options}
        modifiers={modifiers}
        disabled={disabledDropdown}
        onChange={handleChange}
        valueRenderer={valueRenderer}
        optionRenderer={optionRenderer}
      />
    </div>
  )
}

StakingDropdown.propTypes = {
  className: PropTypes.string,
  erc20: PropTypes.string,
  disabled: PropTypes.bool,
  disabledDropdown: PropTypes.bool,
  isLoading: PropTypes.bool,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
}

export default StakingDropdown
