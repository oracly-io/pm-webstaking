import React, { useCallback } from 'react'
import { isEmpty } from 'lodash'
import { useNavigate } from 'react-router-dom'

// import Statistics from '@components/Statistics'
import Crumbs from '@components/Crumbs'
import RouteBackIcon from '@components/SVG/RouteBackIcon'
import { useCrumbs } from '@hooks'

import css from './HeaderContent.module.scss'

const HeaderContent = () => {
  const crumbs = useCrumbs()
  const navigate = useNavigate()

  const handleGoback = useCallback(() => navigate('..', { relative: 'path' }), [navigate])

  return (
    <div className={css.header}>
      {!isEmpty(crumbs) && (
        <div
          className={css.goback}
          onClick={handleGoback}
        >
          <RouteBackIcon />
        </div>
      )}
      <p className={css.title}>Staking</p>
      <div className={css.content}>
        <div><Crumbs /></div>
        {/* <div className={css.dropdowns}>
          <Statistics />
        </div> */}
      </div>
    </div>
  )
}

export default React.memo(HeaderContent)
