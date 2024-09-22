import { isEmpty } from 'lodash'
import { get } from '@oracly/pm-libs/immutable'

import config from '@config'
import { ERC20 } from '@constants'

import { getLastDepositByAddress } from '../deposits'
import { getActualEpochId } from '../epoches'

function getStakers(state) {
  const stakers = get(state, ['stakers', 'collection'])
  return stakers
}

export function getAccountByAddress(state, address) {
  const account = get(state, ['stakers', 'accounts', address])
  return account
}

export function getActiveAccountAddress(state) {
  const address = get(state, ['stakers', 'active'])
  return address
}

export function getActiveAccountBalanceERC20(state, erc20) {
  return getActiveAccountBalance(state, ERC20[erc20])
}

export function getActiveAccountBalance(state, currency) {
  const address = getActiveAccountAddress(state)
  const account = getAccountByAddress(state, address)
  const balance = get(account, ['balance', currency, 'amount'])
  return balance
}

export function getActiveAccountAllowanceERC20(state, erc20, target) {
  return getActiveAccountAllowance(state, ERC20[erc20], target)
}

export function getActiveAccountAllowance(state, currency, target) {
  target = target || config.staking_address
  const address = getActiveAccountAddress(state)
  const account = getAccountByAddress(state, address)
  const allowance = get(account, ['allowance', currency, target, 'amount'])
  return allowance
}

export function getStaker(state, stakerid) {
  const stakers = getStakers(state)
  const staker = get(stakers, [stakerid])

  return staker
}

export function hasUnstakedActualDeposit(state, stakerid) {
  const lastDeposit = getLastDepositByAddress(state, stakerid)
  const actualEpochId = getActualEpochId(state)

  if (isEmpty(lastDeposit)) return false
  if (isEmpty(actualEpochId)) return false

  if (
    lastDeposit.epochUnstaked === actualEpochId &&
    lastDeposit.epochStaked === actualEpochId
  ) return true

  return false
}