import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import { CLAIM_REWARD } from '@actions'
import Button from '@components/common/Button'
import Spinner from '@components/common/Spinner'
import { connect } from '@state'
import { getActiveAccountAddress, isCommiting } from '@state/getters'
import { toDepositRewardfundKey } from '@state/mappers'

import css from './ClaimButton.module.scss'

const ClaimButton = (props) => {
  const { erc20, depositid, epochid, commiting, account } = props

  const handleClick = useCallback(() => {
    props.CLAIM_REWARD({ epochid, depositid, erc20, stakerid: account })
  }, [erc20, depositid, epochid, account])

  return (
    <div className={css.container}>
      <Button
        className={css.button}
        onClick={handleClick}
        disabled={commiting}
      >
        {commiting ? <Spinner /> : 'Claim'}
      </Button>
    </div>
  )
}

ClaimButton.propTypes = {
  depositid: PropTypes.string,
  epochid: PropTypes.string,
  erc20: PropTypes.string,
}

export default connect(
  (state, { erc20, depositid, epochid }) => {
    const depositRewardfundKey = toDepositRewardfundKey({ erc20, depositid, epochid })
    return {
      account: getActiveAccountAddress(state),
      commiting: isCommiting(state, CLAIM_REWARD, [depositRewardfundKey])
    }
  },
  ({ command }) => [command(CLAIM_REWARD)]
)(ClaimButton)