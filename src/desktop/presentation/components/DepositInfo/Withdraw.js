import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

import { WITHDRAW } from '@actions'
import Button from '@components/common/Button'
import Spinner from '@components/common/Spinner'
import { connect } from '@state'
import { isCommiting } from '@state/getters'

import css from './DepositInfo.module.scss'

const Withdraw = (props) => {
  const { depositid, commiting } = props

  const handleClick = useCallback(() => {
    props.WITHDRAW({ depositid })
  }, [depositid])

  return (
    <Button
      className={css.withdrawn}
      onClick={handleClick}
      disabled={commiting}
    >
      {commiting ? <Spinner /> : 'Withdraw'}
    </Button>
  )
}

Withdraw.propTypes = {
  depositid: PropTypes.string.isRequired
}

export default connect(
  (state, { depositid }) => ({
    commiting: isCommiting(state, WITHDRAW, [depositid]),
  }),
  ({ command }) => [
    command(WITHDRAW),
  ]
)(Withdraw)