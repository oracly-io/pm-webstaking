import { gte, lt } from '@oracly/pm-libs/calc-utils'
import { get } from '@oracly/pm-libs/immutable'

import { getActiveAccountAllowanceERC20, getActiveAccountBalanceERC20 } from '@state/getters'

function getPageData(state) {
  const data = get(state, ['pageData'])
  return data
}

export function getPageDataERC20(state) {
  return get(getPageData(state), 'erc20')
}

export function getPageDataStake(state) {
  return get(getPageData(state), 'stake')
}

export function getPageDataStakingErc20(state) {
  return get(getPageData(state), 'stakingErc20')
}

export function isInsufficientAllowance(state, erc20) {
  const allowance = getActiveAccountAllowanceERC20(state, erc20)
  const balance = getActiveAccountBalanceERC20(state, erc20)
  const stake = getPageDataStake(state)

  return !!Number(stake) && (!allowance || lt(allowance, stake)) && gte(balance, stake)
}