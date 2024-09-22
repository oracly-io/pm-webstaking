import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import TickIcon from '../SVG/TickIcon'

import css from './Claimed.module.scss'

const Claimed = ({
  className,
  contentClassName,
  iconClassName,
  size,
}) => {
  return (
    <div className={cn(css.container, className)}>
      <span
        className={cn(css.content, contentClassName)}
      >
        Claimed
        <span className={cn(css.icon, iconClassName)}>
          <TickIcon size={size} />
        </span>
      </span>
    </div>
  )
}

Claimed.propTypes = {
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  size: PropTypes.number
}

export default Claimed