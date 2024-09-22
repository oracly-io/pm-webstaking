import React from 'react'
import cn from 'clsx'

import { CLAIM_REWARD } from '@actions'
import { connect } from '@state'
import { isCommiting } from '@state/getters'
import { toDepositRewardfundKey } from '@state/mappers'

const EpochesTableRow = ({ columns, style, className, commiting }) => {
  return (
    <div
      className={cn(className, { propagating: commiting })}
      role="row"
      style={style}
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