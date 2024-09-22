import React, { useCallback } from 'react'

import { CurrencyCell } from '@components/common/cells'
import InfoIcon from '@components/SVG/InfoIcon'
import { useModal } from '@hooks'

import DepositModal from '../DepositModal'

import css from './DepositStakeCell.module.scss'

const DepositStakeCell = ({ amount, erc20, depositid }) => {
  const { modal, open: openModal } = useModal({
    type: 'secondary',
    Content: DepositModal,
    depositid
  })

  const handleInfoIconClick = useCallback((e) => {
    e.stopPropagation()
    openModal()
  }, [openModal])

  return (
    <div className={css.container}>
      <CurrencyCell erc20={erc20} amount={amount} />
      <div className={css.info} onClick={handleInfoIconClick}>
        <InfoIcon />
      </div>
      {modal}
    </div>
  )
}

DepositStakeCell.propTypes = {}

export default DepositStakeCell
