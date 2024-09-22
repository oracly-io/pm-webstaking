import { isFunction } from 'lodash'
import { web3client } from '@oracly/pm-libs/crypto-wallet'
import { DEFAULT_WEB3_PROVIDER } from '@oracly/pm-libs/crypto-wallet'
import { nowUnixTS, formatUnixTS } from '@oracly/pm-libs/date-utils'
import { UserApi } from '@oracly/pm-libs/pm-api-client'
import { toHex, replace } from '@oracly/pm-libs/hash-utils'
import { ChatSocket } from '@oracly/pm-libs/pm-socket-client'

import config from '@config'
import IERC20 from '@abis/@openzeppelin/IERC20.json'
import MentoringOraclyV1 from '@abis/@oracly/MentoringOraclyV1.json'
import StakingOraclyV1 from '@abis/@oracly/StakingOraclyV1.json'
import OraclyV1 from '@abis/@oracly/OraclyV1.json'

import { GET_BALANCE, GET_ALLOWANCE, APPROVE_ACCOUNT_ALLOWANCE } from '@actions'
import { STAKE, CLAIM_REWARD } from '@actions'
import { AWAIT_TRANSACTION, WITHDRAW, UNSTAKE } from '@actions'
import { RESOVLE_ADDRESS_TO_NICKNAME } from '@actions'
import { GET_BLOCKCHAIN_TABLE_DEPOSITS } from '@actions'
import { READ_BLOCKCHAIN_BLOCK_NUMBER } from '@actions'
import { REQUEST_AUTHENTICATION_PSIG } from '@actions'
import { CHAT_SEND, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID } from '@actions'
import { GET_BLOCKCHAIN_EPOCH, GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE, GET_BLOCKCHAIN_STAKER_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_DEPOSIT, GET_BLOCKCHAIN_DEPOSIT_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_LAST_DEPOSIT } from '@actions'
import { BUY_FOR_STAKE } from '@actions'
import { GET_BLOCKCHAIN_BUY_4_STAKEPOOL } from '@actions'
import { GET_BLOCKCHAIN_MENTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS } from '@actions'
import { GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS } from '@actions'

import { AUTH } from '@constants'

function bcreadST(method, ...params) {
  const [,options = {}] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(config.staking_address, StakingOraclyV1.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcwriteST(method, ...params) {
  const client = web3client.get(config.staking_address, StakingOraclyV1.abi)
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcreadERC(method, erc20, ...params) {
  const [,options] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(erc20, IERC20.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcwriteERC(method, erc20, ...params) {
  const client = web3client.get(erc20, IERC20.abi)
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcreadMT(method, ...params) {
  const [,options = {}] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(config.mentoring_address, MentoringOraclyV1.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

function bcreadOraclyV1(method, ...params) {
  const [,options] = params
  if (!options.blockTag) delete options.blockTag
  const client = web3client.get(config.oraclyv1_address, OraclyV1.abi, { readonly: true })
  if (isFunction(client[method])) return client[method](...params)
  return Promise.reject('Method Not Found')
}

export default {

  // CDN nickname resolution
  [RESOVLE_ADDRESS_TO_NICKNAME]: ({ address }) => UserApi.getNickname({ address }),

  // web3
  // web3auth
  [REQUEST_AUTHENTICATION_PSIG]: ({ from, nickname }) => web3client.request({ method: 'personal_sign', params: [toHex(replace(config.sig_requests[AUTH], [nickname || from, from, formatUnixTS(nowUnixTS(), 'MMM dd yyyy')])), from] }),

  // erc20

  [GET_BALANCE]: ({ erc20, account, txn: { blockNumber } = {} }) => bcreadERC('balanceOf', erc20, account, { blockTag: blockNumber }),
  [GET_ALLOWANCE]: ({ erc20, account, txn: { blockNumber } = {} }) => bcreadERC('allowance', erc20, account, config.staking_address, { blockTag: blockNumber }),
  [APPROVE_ACCOUNT_ALLOWANCE]: ({ erc20, amount }) => bcwriteERC('approve', erc20, config.staking_address, amount, { gasLimit: 150_000 }),

  // await TXN
  [AWAIT_TRANSACTION]: ({ txn: { hash } }) => web3client.waitForTransaction(hash),

  // staking write
  [STAKE]: ({ epochid, amount }) => bcwriteST('stake', epochid, amount, { gasLimit: 2_000_000 }),
  [UNSTAKE]: ({ depositid, epochid }) => bcwriteST('unstake', epochid, depositid, { gasLimit: 750_000 }),
  [WITHDRAW]: ({ depositid }) => bcwriteST('withdraw', depositid, { gasLimit: 750_000 }),
  [CLAIM_REWARD]: ({ depositid, epochid, erc20 }) => bcwriteST('claimReward', epochid, depositid, erc20, { gasLimit: 750_000 }),
  [BUY_FOR_STAKE]: ({ epochid, erc20, amount }) => bcwriteST('buy4stake', erc20, epochid, amount, { gasLimit: 750_000 }),

  // staking read
  [READ_BLOCKCHAIN_BLOCK_NUMBER]: () => DEFAULT_WEB3_PROVIDER.getBlockNumber(),
  [GET_BLOCKCHAIN_DEPOSIT]: ({ depositid, txn: { blockNumber } }) => bcreadST('getDeposit', depositid, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_DEPOSIT_PAIDOUT]: ({ depositid, erc20, txn: { blockNumber } }) => bcreadST('getDepositPaidout', depositid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_DEPOSIT_EPOCH_PAIDOUT]: ({ depositid, epochid, erc20, txn: { blockNumber } }) => bcreadST('getDepositEpochPaidout', depositid, erc20, epochid, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_TABLE_DEPOSITS]: ({ stakerid, offset, txn: { blockNumber } }) => bcreadST('getStakerDeposits', stakerid, offset || 0, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_LAST_DEPOSIT]: ({ stakerid, txn: { blockNumber } }) => bcreadST('getStakerDeposits', stakerid, 0, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_EPOCH]: ({ epochid, erc20, txn: { blockNumber } }) => bcreadST('getEpoch', epochid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_ACTUAL_EPOCH_ID]: ({ txn: { blockNumber } }) => bcreadST('ACTUAL_EPOCH_ID', { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_BUY_4_STAKEPOOL]: ({ txn: { blockNumber } }) => bcreadST('BUY_4_STAKEPOOL', { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_STAKE]: ({ stakerid, txn: { blockNumber } }) => bcreadST('getStakeOf', stakerid, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_PAIDOUT]: ({ stakerid, erc20, txn: { blockNumber } }) => bcreadST('getStakerPaidout', stakerid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_STAKE_STATISTICS]: ({ stakerid, txn: { blockNumber } }) => bcreadST('getStakeOf', stakerid, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_PAIDOUT_STATISTICS]: ({ stakerid, erc20, txn: { blockNumber } }) => bcreadST('getStakerPaidout', stakerid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_LAST_ACTIVITY_STATISTICS]: ({ stakerid, txn: { blockNumber } }) => bcreadST('getStakerDeposits', stakerid, 0, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_STAKER_JOINED_STATISTICS]: ({ stakerid, offset, txn: { blockNumber } }) => bcreadST('getStakerDeposits', stakerid, offset || 0, { blockTag: blockNumber }),

  // oracly read
  [GET_BLOCKCHAIN_BETTOR_STATISTICS]: ({ bettorid, erc20, txn: { blockNumber } }) => bcreadOraclyV1('getBettor', bettorid, erc20, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_BETTOR_LAST_ACTIVITY_STATISTICS]: ({ bettorid, txn: { blockNumber } }) => bcreadOraclyV1('getBettorPredictions', bettorid, 0, 0, { blockTag: blockNumber }),
  [GET_BLOCKCHAIN_BETTOR_JOINED_STATISTICS]: ({ bettorid, offset, txn: { blockNumber } }) => bcreadOraclyV1('getBettorPredictions', bettorid, 0, offset, { blockTag: blockNumber }),

  // mentoring read
  [GET_BLOCKCHAIN_MENTOR_STATISTICS]: ({ mentorid, erc20, txn: { blockNumber } }) => bcreadMT('getMentor', mentorid, erc20, { blockTag: blockNumber }),

  // chat
  [CHAT_SEND]: (params) => ChatSocket.send(params),
}