import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import { UNSTAKE } from '@actions'
import Button from '@components/common/Button'
import Spinner from '@components/common/Spinner'
import { connect } from '@state'
import { isCommiting } from '@state/getters'

import css from './DepositPageHeader.module.scss'

const Unstake = (props) => {
  const { depositid, epochid, commiting } = props

  const handleClick = useCallback(() => {
    props.UNSTAKE({ depositid, epochid })
  }, [depositid, epochid])

  return (
    <Button
      className={css.unstake}
      onClick={handleClick}
      disabled={commiting}
    >
      {commiting ? <Spinner /> : 'Unstake'}
    </Button>
  )
}

Unstake.propTypes = {
  depositid: PropTypes.string.isRequired,
  epochid: PropTypes.string.isRequired
}

export default connect(
  (state, { depositid }) => ({
    commiting: isCommiting(state, UNSTAKE, [depositid])
  }),
  ({ command }) => [
    command(UNSTAKE),
  ]
)(Unstake)