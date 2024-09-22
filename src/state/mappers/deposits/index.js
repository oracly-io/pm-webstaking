import { isEmpty, curryRight } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'

import { ORCY_ADDRESS } from '@constants'
import { blockchain2EntityMap } from '@utils'

export function toDepositRewardfundKey({ erc20, depositid, epochid }) {
  return `${erc20}-${depositid}-${epochid}`
}

export const DEPOSIT_BC = {
  'id'            : '0',
  'depositid'     : '0',
  'staker'        : '1',
  'epochStaked'   : '2', // inEpochid
  'stakedAt'      : '3', // createdAt
  'stake'         : '4', // amount
  'epochUnstaked' : '5', // outEpochid
  'unstaked'      : '6',
  'unstakedAt'    : '7',
  'withdrawn'     : '8',
  'withdrawnAt'   : '9',
}

export const blockchain2DepositMap = curryRight(blockchain2EntityMap)(DEPOSIT_BC)

export function blockchain2Deposit(bcdepositMap, rewardfunds) {

  const deposit = { ...bcdepositMap }

  deposit.unstaked = Boolean(Number(deposit.unstaked))
  deposit.withdrawn = Boolean(Number(deposit.withdrawn))

  deposit.stakingErc20 = ORCY_ADDRESS
  deposit.stake = deposit.stake
    ? toDecimalERC20(deposit.stake, deposit.stakingErc20)
    : deposit.payout
  deposit.epochUnstaked = deposit.unstaked ? deposit.epochUnstaked : null
  deposit.unstakedAt = deposit.unstaked ? deposit.unstakedAt : null
  deposit.withdrawnAt = deposit.withdrawn ? deposit.withdrawnAt : null

  if (!isEmpty(rewardfunds)) deposit.rewardfunds = rewardfunds

	return deposit

}
