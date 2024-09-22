import React, { useCallback } from 'react'
import cn from 'clsx'

import { CLAIM_REWARD } from '@actions'
import { connect } from '@state'
import { isCommiting } from '@state/getters'
import { toDepositRewardfundKey } from '@state/mappers'

import css from './EpochesTableRow.module.scss'

const EpochesTableRow = ({ columns, style, className, commiting, onClick, rowData }) => {

  const handleClick = useCallback(() => {
    onClick && onClick({ rowData })
  }, [onClick, rowData])

  return (
    <div
      className={cn(className, { [css.commiting]: commiting })}
      role="row"
      style={style}
      onClick={handleClick}
    >
      {columns}
    </div>
  )
}
export default connect(
  (state, { rowData: { erc20, depositid, epochid } }) => {
    const depositRewardfundKey = toDepositRewardfundKey({ erc20, depositid, epochid })
    return {
      commiting: isCommiting(state, CLAIM_REWARD, [depositRewardfundKey])
    }
  },
)(React.memo(EpochesTableRow))