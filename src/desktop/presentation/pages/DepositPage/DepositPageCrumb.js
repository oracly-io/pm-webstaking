import React from 'react'
import PropTypes from 'prop-types'

import HTMLAddress from '@components/common/HTMLAddress'

import css from './DepositPageCrumb.module.scss'

const DepositPageCrumb = ({ depositid }) => {
  return (
    <>
      <span className={css.title}>Deposit</span>
      <HTMLAddress address={depositid} className={css.id} />
    </>
  )
}

DepositPageCrumb.propTypes = {
  depositid: PropTypes.string
}

export default DepositPageCrumb