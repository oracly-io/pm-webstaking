import cn from 'clsx'

import { withClassName } from '@hocs'

import css from './InfoTable.module.scss'

export const Container = withClassName(({ titled }) =>
  ({ className: cn(css.table, { [css.titled]: titled }) })
)('span')
export const Title = withClassName({ className: css.title })('span')
export const Name = withClassName({ className: css.name })('span')
export const Value = withClassName({ className: css.value })('span')
export const Divider = withClassName({ className: css.divider })('div')
