import React from 'react'
import Debug from 'debug'
import UploadIcon from 'material-ui/svg-icons/file/cloud-upload'
import ErrorIcon from 'material-ui/svg-icons/alert/error'
import ContainerOverlay from './ContainerOverlay'
import RenderListByRow from './RenderListByRow'
import GridView from './GridView'

const debug = Debug('component:file:FileContent:')

class FileContent extends React.Component {
  constructor(props) {
    super(props)

    this.state = { contextMenu: false }

    /* cathc key action */
    this.keyDown = (e) => {
      if (this.props.select) { this.props.select.keyEvent(e.ctrlKey, e.shiftKey) }
    }

    this.keyUp = (e) => {
      if (this.props.select) { this.props.select.keyEvent(e.ctrlKey, e.shiftKey) }
    }

    /* touchTap file */
    this.onRowTouchTap = (e, index) => {
      /*
       * using e.nativeEvent.button instead of e.nativeEvent.which
       * 0 - left
       * 1 - middle
       * 2 - right
       * e.type must be mouseup
       * must be button 1 or button 2 of mouse
       */

      e.preventDefault()  // important, to prevent other event
      e.stopPropagation()

      const type = e.type
      const button = e.nativeEvent.button
      if (type !== 'mouseup' || !(button === 0 || button === 2)) return

      /* just touch */
      this.props.select.touchTap(button, index)

      /* right click */
      if (button === 2) {
        this.props.showContextMenu(e.nativeEvent.clientX, e.nativeEvent.clientY)
      }
    }

    this.onRowDoubleClick = (e, index) => {
      if (index === -1) return
      debug('rowDoubleClick', this.props, index)
      const entry = this.props.entries[index]
      this.props.listNavBySelect()
      if (entry.type === 'file') {
        this.setState({ seqIndex: index, preview: true })
      }
    }

    this.onRowMouseEnter = (e, index) => {
      this.props.select.mouseEnter(index)
    }

    this.onRowMouseLeave = (e, index) => {
      this.deferredLeave = setTimeout(() => this.props.select.mouseLeave(index), 1)
    }

    /* handle files */
    this.drop = (e) => {
      const files = []
      for (const item of e.dataTransfer.files) files.push(item.path)
      const dir = this.props.home.path
      const dirUUID = dir[dir.length - 1].uuid
      const driveUUID = this.props.home.path[0].uuid
      debug('drop files!!', files, dirUUID, driveUUID)
      this.props.ipcRenderer.send('DRAG_FILE', { files, dirUUID, driveUUID })
    }

    this.openFile = (file) => {
      this.props.ipcRenderer.send('OPEN_FILE', { file, path: this.props.home.path })
    }
  }

  componentDidMount() {
    /* bind keydown event */
    document.addEventListener('keydown', this.keyDown)
    document.addEventListener('keyup', this.keyUp)
  }

  componentWillUnmount() {
    /* remove keydown event */
    document.removeEventListener('keydown', this.keyDown)
    document.removeEventListener('keyup', this.keyUp)
  }

  renderNoFile() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
        onDrop={this.drop}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <UploadIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 24, color: 'rgba(0,0,0,0.27)' }}> { '将文件拖到此处' } </div>
          <div style={{ color: 'rgba(0,0,0,0.27)' }}> { '或点击上传按钮' } </div>
        </div>
      </div>
    )
  }

  renderOffLine() {
    return (
      <div
        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onTouchTap={e => this.onRowTouchTap(e, -1)}
        onDrop={this.drop}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#FAFAFA'
          }}
        >
          <ErrorIcon style={{ height: 64, width: 64, color: 'rgba(0,0,0,0.27)' }} />
          <div style={{ fontSize: 20, color: 'rgba(0,0,0,0.27)' }}> { '网络连接已断开，请检查网络设置' } </div>
        </div>
      </div>
    )
  }

  render() {
    // debug('render FileContent', this.props, this.state)

    /* not get list yet */
    if (!this.props.home.path.length) return (<div />)

    /* dir is empty */
    if (this.props.entries && !this.props.entries.length) return this.renderNoFile()

    /* lost connection to wisnuc */
    if (!window.navigator.onLine) return this.renderOffLine()

    /* got list */
    return (
      <div style={{ width: '100%', height: '100%' }}>
        {/* render list */}
        {
          this.props.gridView ?
            <GridView
              {...this.props}
              onRowTouchTap={this.onRowTouchTap}
              onRowMouseEnter={this.onRowMouseEnter}
              onRowMouseLeave={this.onRowMouseLeave}
              onRowDoubleClick={this.onRowDoubleClick}
              drop={this.drop}
            />
            :
            <RenderListByRow
              {...this.props}
              onRowTouchTap={this.onRowTouchTap}
              onRowMouseEnter={this.onRowMouseEnter}
              onRowMouseLeave={this.onRowMouseLeave}
              onRowDoubleClick={this.onRowDoubleClick}
              drop={this.drop}
            />
        }

        {/* preview file */}
        <ContainerOverlay
          onRequestClose={() => this.setState({ preview: false })}
          open={this.state.preview}
          items={this.props.entries}
          seqIndex={this.state.seqIndex}
          ipcRenderer={this.props.ipcRenderer}
          setAnimation={this.props.setAnimation}
          memoize={this.props.memoize}
          download={this.props.download}
          primaryColor={this.props.primaryColor}
          path={this.props.home.path}
          select={this.props.select.touchTap}
        />
      </div>
    )
  }
}

export default FileContent
