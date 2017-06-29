import React from 'react'
import Debug from 'debug'
import { shell, clipboard } from 'electron'
import { Paper, IconButton, Toggle } from 'material-ui'
import AddCirle from 'material-ui/svg-icons/content/add-circle'
import FlatButton from '../common/FlatButton'
import DialogOverlay from '../common/DialogOverlay'

const debug = Debug('component:control:deviceinfo')

class Market extends React.PureComponent {

  constructor(props) {
    super(props)
    /* CId, id of container; CState, state of container */
    this.state = {
      openURL: '',
      CId: '',
      CState: false
    }

    this.toggleState = (op) => {
      this.setState({ [op]: !this.state[op] })
    }

    this.openDialog = (id, CState) => {
      this.setState({ CId: id, CState })
    }

    this.closeDialog = (op) => {
      this.setState({ [op]: '' })
    }

    this.copyText = () => {
      clipboard.writeText(this.state.openURL)
      this.props.openSnackBar('复制成功')
      this.closeDialog('openURL')
    }
  }

  renderCard(app, containers) {
    const container = containers.find(c => c.Id === app.containerIds[0]) // more than one container ? TODO
    debug('renderCard', app.containerIds[0], containers, this.props)
    const url = 'https://raw.githubusercontent.com/wisnuc/appifi-recipes/release/images/'
    const CState = container.State === 'running'
    return (
      <Paper
        key={app.uuid}
        style={{ float: 'left', margin: 16, height: 266, width: 210 }}
      >
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            height={150}
            width={150}
            src={`${url}${app.recipe.components[0].imageLink}`}
            alt={app.recipe.appname}
            style={{ filter: CState ? '' : 'grayscale(100%)' }}
          />
        </div>
        <div style={{ height: 34, display: 'flex', marginLeft: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: this.state.open ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.54)',
              fontWeight: 500
            }}
          >
            { app.recipe.appname }
          </div>
          <div style={{ flexGrow: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
            <Toggle
              toggled={CState}
              onToggle={() => { this.openDialog(container.Id, CState) }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0px 8px 0px' }}>
          <FlatButton
            style={{ color: CState ? this.props.primaryColor : 'rgba(0,0,0,0.54)' }}
            label={CState ? '打开' : '卸载'}
            onTouchTap={() => this.setState({ openURL: `http://10.10.9.86:${container.Ports[0].PublicPort}/` })}
          />
        </div>
      </Paper>
    )
  }

  render() {
    if (!this.props.docker || !this.props.docker.appstore) return <div>Loading...</div>
    debug('this.props.docker', this.props.docker)
    const { docker } = this.props
    const { installeds, containers } = docker.docker

    // debug('this.props.docker', installeds)
    // return <div>Loading...</div>
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'auto' }}>
        <div style={{ height: 16 }} />
        <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 56px)', overflow: 'auto' }}>
          { installeds.map(app => (this.renderCard(app, containers))) }
        </div>

        {/* toggle start/stop dialog */}
        <DialogOverlay open={!!this.state.CId}>
          <div>
            {
              !!this.state.CId &&
                <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
                  <div style={{ color: 'rgba(0,0,0,0.54)' }}>
                    { this.state.CState ? '关闭后，该应用不可使用。您可随时开启。' : '您确定开启该应用吗？'}
                  </div>
                  <div style={{ height: 24 }} />
                  <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                    <FlatButton label="取消" primary onTouchTap={() => this.closeDialog('CId')} keyboardFocused />
                    <FlatButton
                      label="确定"
                      primary
                      onTouchTap={() => this.closeDialog('CId')}
                    />
                  </div>
                </div>
            }
          </div>
        </DialogOverlay>

        {/* URL dialog */}
        <DialogOverlay open={!!this.state.openURL}>
          {
            !!this.state.openURL &&
            <div style={{ width: 320, padding: '24px 24px 0px 24px' }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: 'rgba(0,0,0,0.87)' }}> 打开应用 </div>
              <div style={{ height: 20 }} />
              <div style={{ color: 'rgba(0,0,0,0.87)' }}>
                { this.state.openURL }
              </div>
              <div style={{ height: 24 }} />
              <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginRight: -24 }}>
                <div style={{ marginLeft: -24 }}>
                  <FlatButton label="复制到剪贴板" primary onTouchTap={this.copyText} />
                </div>
                <div style={{ width: 108 }} />
                <FlatButton
                  label="默认浏览器打开"
                  primary
                  onTouchTap={() => {
                    shell.openExternal(this.state.openURL)
                    this.closeDialog('openURL')
                  }}
                />
              </div>
            </div>
          }
        </DialogOverlay>
      </div>
    )
  }
}

export default Market
