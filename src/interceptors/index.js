import { isString, has, get, concat, gte } from 'lodash'
import { findAction, query, command, success, fails } from '@oracly/pm-libs/redux-cqrs'

import { AWAIT_TRANSACTION, GET_BALANCE } from '@actions'
import { CLAIM_REWARD } from '@actions'
import { UNSTAKE, WITHDRAW } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE } from '@actions'
import { STAKE, BUY_FOR_STAKE } from '@actions'
import { APPROVE_ACCOUNT_ALLOWANCE, GET_ALLOWANCE } from '@actions'
import { GET_BLOCKCHAIN_LAST_DEPOSIT } from '@actions'
import { GET_BLOCKCHAIN_BUY_4_STAKEPOOL } from '@actions'
import { LT, TXN_COMMITED, ORCY_ADDRESS, USDC_ADDRESS } from '@constants'
import { getActiveAccountAddress } from '@state/getters'

export default {
  cryptoTXN: {
    detect: (action) => {
      const path = ['args', 'result']
      return (
        has(action, concat(path, 'hash')) &&
        has(action, concat(path, 'blockNumber')) &&
        has(action, concat(path, 'blockHash'))
      )
    },
    intercept: (action, store) => {
      const txn = get(action, ['args', 'result'])
      if (isString(txn.hash) && Number(txn.hash)) {
        store.dispatch(query(
          AWAIT_TRANSACTION,
          { txn },
          { origin: action }
        ))
      }
    }
  },
  updateBalance: {
    detect: (action) => {
      const txnStatus = get(action, ['args', 'result', 'status'])
      return action.type === success(AWAIT_TRANSACTION) && txnStatus === TXN_COMMITED
    },
    intercept: (action, store) => {
      const account = getActiveAccountAddress(store.getState())
      const blockNumber = get(action, ['args', 'result', 'blockNumber'])

      const action_STAKE = findAction(action, success(STAKE))
      if (action_STAKE) {
        store.dispatch(query(
          GET_BALANCE,
          { account, erc20: ORCY_ADDRESS, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))
      }

      const action_WITHDRAW = findAction(action, success(WITHDRAW))
      if (action_WITHDRAW) {
        store.dispatch(query(
          GET_BALANCE,
          { account, erc20: ORCY_ADDRESS, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))
      }

      const action_CLAIM_REWARD = findAction(action, success(CLAIM_REWARD))
      if (action_CLAIM_REWARD) {
        const erc20 = get(action_CLAIM_REWARD, ['args', 'erc20'])
        store.dispatch(query(
          GET_BALANCE,
          { account, erc20, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))
      }

      const action_BUY_FOR_STAKE = findAction(action, success(BUY_FOR_STAKE))
      if (action_BUY_FOR_STAKE) {
        const erc20 = get(action_BUY_FOR_STAKE, ['args', 'erc20'])
        store.dispatch(query(
          GET_BALANCE,
          { account, erc20, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))
      }
    }
  },
  commitTXN: {
    detect: (action) => {
      const txnStatus = get(action, ['args', 'result', 'status'])
      return action.type === success(AWAIT_TRANSACTION) && txnStatus === TXN_COMMITED
    },
    intercept: (action, store) => {
      const blockNumber = get(action, ['args', 'result', 'blockNumber'])

      const action_STAKE = findAction(action, success(STAKE))
      if (action_STAKE) {

        const { stakerid } = action_STAKE.args
        store.dispatch(query(
          GET_BLOCKCHAIN_STAKER_STAKE,
          { stakerid, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))

        const account = getActiveAccountAddress(store.getState())
        store.dispatch(query(
          GET_ALLOWANCE,
          { account, erc20: ORCY_ADDRESS, txn: { blockNumber } },
          { origin: action }
        ))

        store.dispatch(query(
          GET_BLOCKCHAIN_LAST_DEPOSIT,
          { stakerid: account, txn: { blockNumber } },
          { origin: action }
        ))
      }

      const action_BUY_FOR_STAKE = findAction(action, success(BUY_FOR_STAKE))
      if (action_BUY_FOR_STAKE) {

        const { stakerid } = action_BUY_FOR_STAKE.args
        store.dispatch(query(
          GET_BLOCKCHAIN_STAKER_STAKE,
          { stakerid, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))

        store.dispatch(query(
          GET_BLOCKCHAIN_LAST_DEPOSIT,
          { stakerid, txn: { blockNumber } },
          { origin: action }
        ))

        const account = getActiveAccountAddress(store.getState())
        store.dispatch(query(
          GET_ALLOWANCE,
          { account, erc20: USDC_ADDRESS, txn: { blockNumber } },
          { origin: action }
        ))

        store.dispatch(query(
          GET_BLOCKCHAIN_BUY_4_STAKEPOOL,
          { loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))
      }

      const action_CLAIM_REWARD = findAction(action, success(CLAIM_REWARD))
      if (action_CLAIM_REWARD) {
        const { epochid, depositid, erc20, stakerid } = action_CLAIM_REWARD.args

        store.dispatch(query(
          GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT,
          { depositid, epochid, erc20, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))

        store.dispatch(query(
          GET_BLOCKCHAIN_DEPOSIT_PAIDOUT,
          { depositid, erc20, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))

        store.dispatch(query(
          GET_BLOCKCHAIN_STAKER_PAIDOUT,
          { stakerid, erc20, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))

      }

      const action_UNSTAKE = findAction(action, success(UNSTAKE))
      if (action_UNSTAKE) {
        const { depositid } = action_UNSTAKE.args
        store.dispatch(query(
          GET_BLOCKCHAIN_DEPOSIT,
          { depositid, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))
      }

      const action_WITHDRAW = findAction(action, success(WITHDRAW))
      if (action_WITHDRAW) {
        const { depositid } = action_WITHDRAW.args
        store.dispatch(query(
          GET_BLOCKCHAIN_DEPOSIT,
          { depositid, loadType: LT.UPDATE, txn: { blockNumber } },
          { origin: action }
        ))
      }

      const action_APPROVE_ACCOUNT_ALLOWANCE = findAction(action, success(APPROVE_ACCOUNT_ALLOWANCE))
      if (action_APPROVE_ACCOUNT_ALLOWANCE) {
        const erc20 = get(action_APPROVE_ACCOUNT_ALLOWANCE, ['args', 'erc20'])
        const account = getActiveAccountAddress(store.getState())
        store.dispatch(query(
          GET_ALLOWANCE,
          { account, erc20, txn: { blockNumber } },
          { origin: action }
        ))
      }
    }
  },

  stakeAfterApprovedAllowance: {
    detect: (action) => {
      if (findAction(action.metadata.origin, success(GET_ALLOWANCE))) return false
      if (findAction(action.metadata.origin, fails(GET_ALLOWANCE))) return false
      return action.type === success(GET_ALLOWANCE)
    },
    intercept: (action, store) => {

      const action_APPROVE_ACCOUNT_ALLOWANCE = findAction(action, success(APPROVE_ACCOUNT_ALLOWANCE))
      if (action_APPROVE_ACCOUNT_ALLOWANCE) {
        const erc20 = get(action_APPROVE_ACCOUNT_ALLOWANCE, ['args', 'erc20'])
        const stakeArgs = get(action_APPROVE_ACCOUNT_ALLOWANCE, ['args', 'stakeArgs'])
        const allowance = get(action, ['args', 'result'])
        const amount = get(stakeArgs, ['amount'])

        if (gte(allowance, amount)) {
          const is_USDC_Staking = erc20 === USDC_ADDRESS
          const is_ORCY_Staking = erc20 === ORCY_ADDRESS

          if (is_USDC_Staking) store.dispatch(command(BUY_FOR_STAKE, stakeArgs, { origin: action }))
          if (is_ORCY_Staking) store.dispatch(command(STAKE, stakeArgs, { origin: action }))
        }
      }

    }
  }
}
