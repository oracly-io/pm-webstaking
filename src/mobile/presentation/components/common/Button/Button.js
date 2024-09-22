import React, { useCallback } from 'react'
import cn from 'clsx'

import css from './Button.module.scss'

const Button = (props) => {

  const handleClick = useCallback(() => {
    if (props.disabled) return
    props.onClick()
  }, [props.onClick, props.disabled])

  return (
    <a
      className={cn(css.button, { [css.disabled]: props.disabled }, props.className)}
      onClick={handleClick}
      href={props.href}
    >
      {props.children}
    </a>
  )

}

export default React.memo(Button)
