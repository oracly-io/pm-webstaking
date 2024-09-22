import React from 'react'

import TickIcon from '../SVG/TickIcon'

import css from './Claimed.module.scss'

const Claimed = () => {
  return (
    <div className={css.container}>
      <span className={css.content}>Claimed <span className={css.icon}><TickIcon /></span></span>
    </div>
  )
}

export default Claimed