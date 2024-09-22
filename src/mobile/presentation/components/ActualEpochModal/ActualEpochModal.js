import React from 'react'
import { get } from '@oracly/pm-libs/immutable'

import { GET_BLOCKCHAIN_STAKER_PAIDOUT } from '@actions'
import { GET_BLOCKCHAIN_STAKER_STAKE } from '@actions'
import { ERC20, ORCY_ADDRESS } from '@constants'
import CurrencyLabeledField from '@components/common/CurrencyLabeledField'
import { InfoTable } from '@components/InfoTable'
import AmountField from '@components/common/AmountField'
import { connect } from '@state'
import { getStaker, getActualEpoch } from '@state/getters'
import { isInitialLoading } from '@state/getters'
import { getPageDataERC20 } from '@state/getters'

import css from './ActualEpochModal.module.scss'

const ActualEpochModal = ({
  erc20,
  actualEpoch,
  staker,
  isInitialStakerStakeLoading,
  isInitialStakerPaidoutLoading,
}) => {

  const stakerStake = get(staker, ['staked']) || 0
  const stakerClaimed = get(staker, ['rewardfunds', erc20, 'claimed']) || 0
  const stakerStakingErc20 = get(staker, ['stakingErc20']) || ORCY_ADDRESS
  const epochid = get(actualEpoch, ['id']) || 0
  const stakes = get(actualEpoch, ['stakes']) || 0
  const staked = get(actualEpoch, ['stakefund']) || 0
  const collected = get(actualEpoch, ['rewardfunds', erc20, 'collected']) || 0
  const epochStakingErc20 = get(actualEpoch, ['stakingErc20']) || ORCY_ADDRESS

  return (
    <div className={css.container}>
      <div className={css.fields}>
        <CurrencyLabeledField
          label="Stake"
          amount={stakerStake}
          currency={ERC20[stakerStakingErc20]}
          isLoading={isInitialStakerStakeLoading}
          withIcon
        />
        <CurrencyLabeledField
          label="Claimed"
          amount={stakerClaimed}
          currency={ERC20[erc20]}
          isLoading={isInitialStakerPaidoutLoading}
          withIcon
        />
      </div>
      <InfoTable.Container className={css.table}>
        <InfoTable.Name>Epoch</InfoTable.Name>
        <InfoTable.Value className={css.value}>{epochid}</InfoTable.Value>
        <InfoTable.Divider />
        <InfoTable.Name>Stakes</InfoTable.Name>
        <InfoTable.Value className={css.value}>{stakes}</InfoTable.Value>
        <InfoTable.Divider />
        <InfoTable.Name>Staked</InfoTable.Name>
        <InfoTable.Value>
          <AmountField
            amountClassName={css.fieldAmount}
            currency={ERC20[epochStakingErc20]}
            amount={staked}
          />
        </InfoTable.Value>
        <InfoTable.Divider />
        <InfoTable.Name>Collected</InfoTable.Name>
        <InfoTable.Value>
          <AmountField
            amountClassName={css.fieldAmount}
            amount={collected}
            currency={ERC20[erc20]}
          />
        </InfoTable.Value>
      </InfoTable.Container>
    </div>
  )
}

export default connect(
  (state, { stakerid }) => {
    const erc20 = getPageDataERC20(state)
    const actualEpoch = getActualEpoch(state)
    const staker = getStaker(state, stakerid)
    const isInitialStakerStakeLoading = isInitialLoading(state, GET_BLOCKCHAIN_STAKER_STAKE, [stakerid])
    const isInitialStakerPaidoutLoading = isInitialLoading(state, GET_BLOCKCHAIN_STAKER_PAIDOUT, [stakerid, erc20])

    return {
      erc20,
      actualEpoch,
      staker,
      isInitialStakerStakeLoading,
      isInitialStakerPaidoutLoading,
    }
  },
)(ActualEpochModal)