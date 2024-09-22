import { toLower } from 'lodash'
import { toDecimalERC20 } from '@oracly/pm-libs/calc-utils'
import { get, set } from '@oracly/pm-libs/immutable'
import { success } from '@oracly/pm-libs/redux-cqrs'

import config from '@config'
import { ERC20 } from '@constants'

import { SET_ACCOUNT } from '@actions'
import { GET_ALLOWANCE, GET_BALANCE } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE, GET_BLOCKCHAIN_STAKER_PAIDOUT } from '@actions'
import { ORCY_ADDRESS } from '@constants'
import { updateEntitiesFactory } from '../utils'

export default {

  [SET_ACCOUNT]: (state, { account }) => {
    state = set(state, ['active'], toLower(account))
    return state
  },

  [success(GET_ALLOWANCE)]: (state, { account, target, erc20, result, txn: { blockNumber } }) => {

    target = target || config.staking_address

    const prevBlockNumber = get(state, [
      'accounts',
      toLower(account),
      'allowance',
      ERC20[erc20],
      target,
      'blockNumber',
    ])

    if (blockNumber > prevBlockNumber || !prevBlockNumber) {
      state = set(
        state,
        ['accounts', toLower(account), 'allowance', ERC20[erc20], target],
        { amount: toDecimalERC20(result.toString(), erc20), blockNumber }
      )
    }

    return state

  },

  [success(GET_BALANCE)]: (state, { account, erc20, result, txn: { blockNumber } }) => {

    const prevBlockNumber = get(state, [
      'accounts',
      toLower(account),
      'balance',
      ERC20[erc20],
      'blockNumber',
    ])

    if (blockNumber > prevBlockNumber || !prevBlockNumber) {
      state = set(
        state,
        ['accounts', toLower(account), 'balance', ERC20[erc20]],
        { amount: toDecimalERC20(result.toString(), erc20), blockNumber },
      )
    }

    return state

  },

  [success(GET_BLOCKCHAIN_STAKER_STAKE)]: (state, { txn, stakerid, result: staked }) => {

    const updateStakerStake = updateEntitiesFactory(
      stake => toDecimalERC20(stake, ORCY_ADDRESS),
      () => [stakerid, 'staked'],
      () => `${stakerid}.staked`,
    )
    state = updateStakerStake(state, staked, txn.blockNumber)

    return state
  },

  [success(GET_BLOCKCHAIN_STAKER_PAIDOUT)]: (state, { txn, stakerid, erc20, result: payout }) => {

    const updateStakerPayout = updateEntitiesFactory(
      payout => toDecimalERC20(payout, ORCY_ADDRESS),
      () => [stakerid, 'rewardfunds', erc20, 'claimed'],
      () => `${stakerid}.claimed.${erc20}`,
    )
    state = updateStakerPayout(state, payout, txn.blockNumber)

    return state

  },

}
