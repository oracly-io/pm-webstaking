import React from 'react'
import PropTypes from 'prop-types'
import cn from 'clsx'

import Spinner from '@components/common/Spinner'

import css from './LabeledField.module.scss'

const LabeledField = ({
  className,
  labelClassName,
  contentClassName,
  spinnerClassName,
  label,
  iconRenderer,
  isLoading,
  children,
}) => {
  return (
    <div className={cn(css.container, className)}>
      {iconRenderer && iconRenderer()}
      <div className={cn(css.content, contentClassName)}>
        <span className={cn(css.label, labelClassName)}>{label}</span>
        {isLoading ? <Spinner className={cn(css.spinner, spinnerClassName)} /> : children}
      </div>
    </div>
  )
}

LabeledField.propTypes = {
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  spinnerClassName: PropTypes.string,
  label: PropTypes.string,
  iconRenderer: PropTypes.func,
  isLoading: PropTypes.bool,
  children: PropTypes.node,
}

export default React.memo(LabeledField)