import React from 'react'
import PropTypes from 'prop-types'
import { get } from '@oracly/pm-libs/immutable'

import { GET_BLOCKCHAIN_STAKER_STAKE } from '@actions'
import { ERC20, ORCY_ADDRESS } from '@constants'
import Button from '@components/common/Button'
import ActualEpochModal from '@components/ActualEpochModal'
import CurrencyLabeledField from '@components/common/CurrencyLabeledField'
import StatisticsChartIcon from '@components/SVG/StatisticsChartIcon'
import { useModal } from '@hooks'
import { connect } from '@state'
import { getStaker, isInitialLoading } from '@state/getters'

import css from './DepositsPageHeader.module.scss'

const DepositsPageHeader = ({
  stakerid,
  staker,
  isInitialStakerStakeLoading,
}) => {
  const stakerStake = get(staker, ['staked']) || 0
  const stakerStakingErc20 = get(staker, ['stakingErc20']) || ORCY_ADDRESS

  const { modal, open: openActualEpochModal } = useModal({
    type: 'secondary',
    Content: ActualEpochModal,
    stakerid,
  })

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
      <Button
        className={css.statisticsBtn}
        onClick={openActualEpochModal}
      >
        <StatisticsChartIcon />
      </Button>
      {modal}
    </div>
  )
}

DepositsPageHeader.propTypes = {
  stakerid: PropTypes.string.isRequired
}

export default connect(
  (state, { stakerid }) => {
    const staker = getStaker(state, stakerid)
    const isInitialStakerStakeLoading = isInitialLoading(state, GET_BLOCKCHAIN_STAKER_STAKE, [stakerid])

    return {
      staker,
      isInitialStakerStakeLoading,
    }
  }
)(DepositsPageHeader)