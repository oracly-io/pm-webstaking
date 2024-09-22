import React from 'react'
import PropTypes from 'prop-types'
import { htmlTransaction, htmlTransactionHref } from '@oracly/pm-libs/html-utils'

import Copy from '@components/common/Copy'

import css from './TransactionLink.module.scss'

const TransactionLink = ({ hash }) => {
  return (
    <Copy
      iconClassName={css.icon}
      text={hash}
      offsetX={-52.5}
    >
      <a
        className={css.link}
        href={htmlTransactionHref(hash)}
        target="_blank"
        rel="noreferrer"
      >
        {htmlTransaction(hash)}
      </a>
    </Copy>
  )
}

TransactionLink.propTypes = {
  hash: PropTypes.string
}

export default TransactionLink