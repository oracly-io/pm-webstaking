import 'react-virtualized/styles.css'
import React, { useEffect } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import cn from 'clsx'

import config from '@config'
import { DARK_THEME } from '@constants'
import GlobalHeader from '@components/GlobalHeader'
import DataLoader from '@components/DataLoader'
import NotificationsWidget from '@components/NotificationsWidget'
import DataSyncModal from '@components/DataSyncModal'
import Notfound from '@pages/notfound'
import { useValidateParams } from '@hooks'
import { connect } from '@state'
import { getActiveAccountAddress } from '@state/getters'
import { getTheme } from '@state/getters/application'

import '@styles/app.scss'
import css from './Master.module.scss'

const Master = (props) => {
  const { account } = props

  const isValid = useValidateParams()
  const { stakerid } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const isConnected = !!window.localStorage.getItem('__connector')
    if (isConnected && account && !stakerid) {
      navigate(account, { replace: true })
    }
  }, [account, stakerid])

  return (
    <div
      className={cn(css.master, { dark: props.theme === DARK_THEME })}
    >
      <DataLoader />
      <GlobalHeader>
        <div className={css.webstaking}>
          {isValid ? <Outlet/> : <Notfound />}
        </div>
      </GlobalHeader>
      <NotificationsWidget />
      <DataSyncModal />
      <div id={config.modal_id} />
    </div>
  )
}

export default connect(
  state => ({
    theme: getTheme(state),
    account: getActiveAccountAddress(state),
  })
)(React.memo(Master))
