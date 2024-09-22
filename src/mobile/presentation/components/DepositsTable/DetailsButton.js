import React from 'react'

import Button from '@components/common/Button'

import css from './DetailsButton.module.scss'

const DetailsButton = () => (
  <div className={css.container}>
    <Button className={css.button}>
      Details
    </Button>
  </div>
)

export default DetailsButton