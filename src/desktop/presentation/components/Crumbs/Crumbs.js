import { isEmpty } from 'lodash'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useValidateParams, useCrumbs } from '@hooks'

import css from './Crumbs.module.scss'

const Crumbs = () => {
  const params = useParams()
  const isValid = useValidateParams()
  const crumbs = useCrumbs()

  if (!isValid || isEmpty(crumbs)) return null

  return (
    <>
      {crumbs.map((crumb, index) => (
        <div key={index} className={css.crumb}>{crumb({ params })}</div>
      ))}
    </>
  )
}

export default Crumbs