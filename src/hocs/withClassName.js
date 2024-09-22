import React from 'react'
import cn from 'clsx'
import { isFunction } from 'lodash'

const withClassName = (params) => (Cmp) => {

  const WithClassName = (props) => {
    const className = isFunction(params) ? params(props).className : params.className
    return (
      <Cmp className={cn(className, props.className)}>
        {props.children}
      </Cmp>
    )
  }

  return WithClassName
}

export default withClassName