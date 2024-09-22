import React from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { toLower } from 'lodash'

import { ERC20 } from '@constants'
import { InfoTable } from '@components/InfoTable'
import Status from '@components/common/Status'
import AmountField from '@components/common/AmountField'
import ClaimButton from '@components/EpochesTable/ClaimButton'
import Claimed from '@components/EpochesTable/Claimed'
import { connect } from '@state'
import { getPageDataERC20, getActiveAccountAddress } from '@state/getters'

import css from './ClaimModal.module.scss'

const ClaimModal = ({
  erc20,
  epochid,
  status,
  stake,
  collected,
  reward,
  claimable,
  claimed,
  depositid,
  account,
}) => {

  const { stakerid } = useParams()
  const isOwner = account && (account === toLower(stakerid))

  return (
    <div className={css.container}>
      <div className={css.title}>Epoch {epochid}</div>
      <InfoTable.Container className={css.table}>
        <InfoTable.Name>Status</InfoTable.Name>
        <InfoTable.Value><Status status={status} /></InfoTable.Value>

        <InfoTable.Divider />

        <InfoTable.Name>Stake</InfoTable.Name>
        <InfoTable.Value>
          <AmountField
            amountClassName={css.fieldAmount}
            currency={ERC20[erc20]}
            amount={stake}
          />
        </InfoTable.Value>

        <InfoTable.Divider />

        <InfoTable.Name>Collected</InfoTable.Name>
        <InfoTable.Value>
          <AmountField
            amountClassName={css.fieldAmount}
            currency={ERC20[erc20]}
            amount={collected}
          />
        </InfoTable.Value>

        <InfoTable.Divider />

        <InfoTable.Name>Reward</InfoTable.Name>
        <InfoTable.Value>
          <AmountField
            amountClassName={css.fieldAmount}
            currency={ERC20[erc20]}
            amount={reward}
          />
        </InfoTable.Value>

      </InfoTable.Container>

      {isOwner && claimable && (
        <ClaimButton
          className={css.claim}
          buttonClassName={css.claimBtn}
          epochid={epochid}
          depositid={depositid}
          erc20={erc20}
        />
      )}
      {isOwner && claimed && (
        <Claimed
          className={css.claimed}
          contentClassName={css.claimedContent}
          iconClassName={css.claimedIcon}
        />
      )}
    </div>
  )
}

ClaimModal.propTypes = {
  epochid: PropTypes.string.isRequired,
  depositid: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  stake: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  collected: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  reward: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  claimable: PropTypes.bool,
  claimed: PropTypes.bool,
}

export default connect(
  (state) => {
    const erc20 = getPageDataERC20(state)
    const account = getActiveAccountAddress(state)

    return {
      erc20,
      account,
    }
  },
)(ClaimModal)