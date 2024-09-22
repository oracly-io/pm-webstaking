import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import { usePopper } from 'react-popper'

import { ERC20 } from '@constants'
import DropdownIcon from '@components/SVG/DropdownIcon'
import Spinner from '@components/common/Spinner'
import AmountField from '@components/common/AmountField'
import { connect } from '@state'
import { getPageDataERC20 } from '@state/getters'
import { getStakingStatERC20, getStakingStatsBlockNumber } from '@state/getters'

import css from './Statistics.module.scss'

const Row = ({ name, isLoading, children }) => {
  return (
    <div className={css.row}>
      <div className={css.name}>{name}</div>
      {isLoading ? <Spinner /> : children}
    </div>
  )
}

const Statistics = (props) => {

  const { erc20, isLoading, stat, blockNumber } = props

  const { claimed = 0, unclaimed = 0, collected = 0 } = stat || {}

  const [isOpen, setIsOpen] = useState(false)
  const containerElement = useRef(null)
  const [referenceElement, setReferenceElement] = useState(null)
  const [popperElement, setPopperElement] = useState(null)
  const modifiers = useMemo(() => [
    {
      name: 'toggle',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn: ({ state }) => {
        state.styles.popper.visibility = isOpen ? 'visible' : 'hidden'
        state.styles.popper.pointerEvents = isOpen ? 'all' : 'none'
      },
    },
    { name: 'offset', options: { offset: [0, 8] } },
  ], [isOpen])
  const { styles, attributes } = usePopper(referenceElement, popperElement, { modifiers, placement: 'bottom-start' })

  useEffect(() => {
    const handler = (e) => {
      if (containerElement.current && !containerElement.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    window.addEventListener('click', handler)
    return () => {
      window.removeEventListener('click', handler)
    }
  }, [])

  const handleClick = useCallback(() => {
    setIsOpen((isOpen) => !isOpen)
  }, [])

  return (
    <div ref={containerElement} className={css.container}>
      <div className={css.header} ref={setReferenceElement} onClick={handleClick}>
        <div className={css.label}>Statistics</div>
        <div className={css.icon}><DropdownIcon fill="#EDE7F5" /></div>
      </div>

      <div className={css.body} ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        <div className={css.title}>Contract stats</div>
        <div className={css.content}>

          <Row name="Collected" isLoading={isLoading}>
            <AmountField
              iconClassName={css.amountIcon}
              currency={ERC20[erc20]}
              amount={collected}
            />
          </Row>

          <div className={css.divider} />

          <Row name="Claimed" isLoading={isLoading}>
            <AmountField
              iconClassName={css.amountIcon}
              currency={ERC20[erc20]}
              amount={claimed}
            />
          </Row>

          <div className={css.divider} />

          <Row name="Unclaimed" isLoading={isLoading}>
            <AmountField
              iconClassName={css.amountIcon}
              currency={ERC20[erc20]}
              amount={unclaimed}
            />
          </Row>

          <div className={css.divider} />

          <Row name="Block Number" isLoading={isLoading}>
            <span className={css.value}>{blockNumber}</span>
          </Row>

        </div>
      </div>
    </div>
  )
}

export default connect(
  (state) => {
    const erc20 = getPageDataERC20(state)
    const stat = getStakingStatERC20(state, erc20)
    const blockNumber = getStakingStatsBlockNumber(state, stat?.id)

    return {
      erc20,
      stat,
      blockNumber,
    }
  }
)(Statistics)