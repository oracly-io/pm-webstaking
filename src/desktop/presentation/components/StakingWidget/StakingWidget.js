import React from 'react'
import { isEmpty, toLower } from 'lodash'
import PropTypes from 'prop-types'
import { useWallet } from '@oracly/pm-libs/crypto-wallet'
import { get } from '@oracly/pm-libs/immutable'

import { GET_BLOCKCHAIN_ACTUAL_EPOCH_ID } from '@actions'
import { GET_BLOCKCHAIN_EPOCH, GET_BLOCKCHAIN_STAKER_STAKE } from '@actions'
import { GET_BLOCKCHAIN_STAKER_PAIDOUT } from '@actions'
import { ERC20, ORCY_ADDRESS, LT } from '@constants'
import CurrencyLabeledField from '@components/common/CurrencyLabeledField'
import { useScheduledQuery } from '@hooks'
import { connect } from '@state'
import { getStaker, getActualEpoch, getLatestbcBlockNumber } from '@state/getters'
import { isNeverPerformed, getActualEpochId } from '@state/getters'
import { isInitialLoading } from '@state/getters'
import { getPageDataERC20 } from '@state/getters'

import General from './General'
import ProfileForm from './ProfileForm'

import css from './StakingWidget.module.scss'

const StakingWidget = ({
  actualEpochId,
  actualEpoch,
  erc20,
  staker,
  stakerid,
  is_bc_blockNumberExist,
  isInitialStakerStakeLoading,
  isInitialStakerPaidoutLoading,
  isInitialActualEpochLoading,
}) => {

  const wallet = useWallet()

  const stakerStake = get(staker, ['staked']) || 0
  const stakerClaimed = get(staker, ['rewardfunds', erc20, 'claimed']) || 0
  const stakerStakingErc20 = get(staker, ['stakingErc20']) || ORCY_ADDRESS
  const epochid = get(actualEpoch, ['id'])
  const stakes = get(actualEpoch, ['stakes'])
  const staked = get(actualEpoch, ['stakefund'])
  const collected = get(actualEpoch, ['rewardfunds', erc20, 'collected'])
  const epochStakingErc20 = get(actualEpoch, ['stakingErc20']) || ORCY_ADDRESS
  const showForm = wallet.ready && wallet.account && toLower(wallet.account) === stakerid

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, [LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_ACTUAL_EPOCH_ID, { loadType, txn: { blockNumber } }, { schedule: 300 })
  }, [is_bc_blockNumberExist])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return
    if (isEmpty(actualEpochId)) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_EPOCH, [actualEpochId, erc20, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_EPOCH, { epochid: actualEpochId, erc20, loadType, txn: { blockNumber } }, { schedule: 300 })
  }, [is_bc_blockNumberExist, actualEpochId, erc20])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return
    if (!stakerid) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_STAKE, [stakerid, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_STAKER_STAKE, { stakerid, loadType, txn: { blockNumber } }, { schedule: 30 })
  }, [is_bc_blockNumberExist, stakerid])

  useScheduledQuery((query, state) => {
    if (!is_bc_blockNumberExist) return
    if (!stakerid) return

    const blockNumber = getLatestbcBlockNumber(state)
    const loadType = isNeverPerformed(state, GET_BLOCKCHAIN_STAKER_PAIDOUT, [stakerid, erc20, LT.INITIAL])
      ? LT.INITIAL : LT.UPDATE
    query(GET_BLOCKCHAIN_STAKER_PAIDOUT, { stakerid, erc20, loadType, txn: { blockNumber } }, { schedule: 30 })
  }, [is_bc_blockNumberExist, stakerid, erc20])

  return (
    <div className={css.container}>
      <CurrencyLabeledField
        spinnerClassName={css.spinner}
        label="Stake"
        amount={stakerStake}
        currency={ERC20[stakerStakingErc20]}
        isLoading={isInitialStakerStakeLoading}
        withIcon
      />
      <div className={css.divider} />
      <CurrencyLabeledField
        spinnerClassName={css.spinner}
        label="Claimed"
        amount={stakerClaimed}
        currency={ERC20[erc20]}
        isLoading={isInitialStakerPaidoutLoading}
      />
      <div className={css.divider} />
      {showForm && (
        <ProfileForm />
      )}
      <General
        className={css.general}
        splitted={!showForm}
        epoch={epochid}
        stakes={stakes}
        staked={staked}
        collected={collected}
        erc20={erc20}
        stakingErc20={epochStakingErc20}
        isLoading={isInitialActualEpochLoading && isEmpty(actualEpoch)}
        isLoadingCollected={isInitialActualEpochLoading}
      />
    </div>
  )
}

StakingWidget.propTypes = {
  stakerid: PropTypes.string.isRequired
}

export default connect(
  (state, { stakerid }) => {
    const erc20 = getPageDataERC20(state)
    const actualEpochId = getActualEpochId(state)
    const actualEpoch = getActualEpoch(state)
    const staker = getStaker(state, stakerid)
    const is_bc_blockNumberExist = !!getLatestbcBlockNumber(state)
    const isInitialStakerStakeLoading = isInitialLoading(state, GET_BLOCKCHAIN_STAKER_STAKE, [stakerid])
    const isInitialStakerPaidoutLoading = isInitialLoading(state, GET_BLOCKCHAIN_STAKER_PAIDOUT, [stakerid, erc20])
    const isInitialActualEpochIdLoading = isInitialLoading(state, GET_BLOCKCHAIN_ACTUAL_EPOCH_ID)
    const isInitialActualEpochLoading = isInitialActualEpochIdLoading || isInitialLoading(state, GET_BLOCKCHAIN_EPOCH, [actualEpochId, erc20])

    return {
      erc20,
      actualEpochId,
      actualEpoch,
      staker,
      isInitialStakerStakeLoading,
      isInitialStakerPaidoutLoading,
      isInitialActualEpochLoading,
      is_bc_blockNumberExist,
    }
  }
)(StakingWidget)