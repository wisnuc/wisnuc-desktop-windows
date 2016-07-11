/**
 * @component Index
 * @description 首页组件
 * @time 2016-4-5
 * @author liuhua
 **/
 'use strict';
// require core module
import React, { findDOMNode, Component, PropTypes } from 'react';
import { connect, bindActionCreators } from 'react-redux'
import Base from '../../utils/Base';
// require action
import Login from'../../actions/action';
//require material
import { Paper, TextField, FlatButton, CircularProgress, Snackbar, Tabs, Tab } from 'material-ui'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

// require common mixins
import ImageModules from '../Mixins/ImageModules'; 
//import CSS
import css  from  '../../../assets/css/login';
//import Action
import Action from '../../actions/action';
//import component
import Device from './Device'

// define Index component
class Index extends React.Component {

	mixins: [ImageModules]

	getChildContext() {
		const muiTheme = getMuiTheme(darkBaseTheme);
		return {muiTheme};
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.login.state == 'LOGGEDIN') {
			// this.props.dispatch(Login.cleanSnack());
			window.location.hash = '/main';
		}
	}

	componentDidMount() {
		ipc.on('loggedin',(err,user,allUser)=>{
			this.props.dispatch(Login.login(user));
		});

		ipc.on('loginFailed',()=>{
			this.props.dispatch(Login.loginFailed());
		})
		ipc.on('message',(err,message,code)=>{
			this.props.dispatch(Login.setSnack(message,true));
			if (code == 0 ) {
				this.props.dispatch(Login.loginFailed());		
			}
		});

		ipc.on('device',(err,device)=>{
			this.props.dispatch(Login.setDevice(device));
		});
	}

	submit() {
		let username = this.refs.username.input.value;
		let password = this.refs.password.input.value;
		this.props.dispatch({
		      type: "LOGIN"
		})
		// ipc.send('login',username,password);
		ipc.send('login','admin','123456');
		// ipc.send('login','a','a');
	}

	render() {
		var _this = this;
		const paperStyle = {
			display : 'flex',
			flexDirection : 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: 170,
			width: 300,
			padding: 10
		}
		let busy = (this.props.login.state ==='BUSY');
		let findDevice = this.props.login.findDevice;
		let device = this.props.login.device; 
		let findDeviceContent = (
				<Paper className='find-device-container'>
					<Tabs>
						<Tab label="自动匹配">
							<Paper>
							{this.props.login.device.map(item=>(
								<Device key={item.addresses[0]} item={item}></Device>
								))}
							</Paper>
						</Tab>
						<Tab label="手动匹配">
							<Paper className='setting-serverIP-container'>
								<TextField  ref='serverIP' hintText='serverIP'/>
								<FlatButton style={{marginTop: 10}} label='提交' onTouchTap={this.submitServer.bind(this)} />
							</Paper>
						</Tab>
					</Tabs>
				</Paper>
			);
		let loginContent = (
				<Paper style={paperStyle} zDepth={4}>
				{ !!busy && <CircularProgress /> }
				{ !busy && <TextField ref='username'  stype={{marginBottom: 10}} hintText="username" type="username" fullWidth={true} />}
				{ !busy && <TextField onKeyDown={this.kenDown.bind(this)} ref='password' stype={{marginBottom: 10}} hintText="password" type="password" fullWidth={true} />}
				{ !busy && <FlatButton style={{marginTop: 10}} label='UNLOCK' onTouchTap={this.submit.bind(this)} />}
				</Paper>
			);
		return (
			<div className='index-frame' key='login'>
				<div className='toggle-device' onClick={this.toggleDevice.bind(this)}>查找设备</div>
				{!!findDevice && findDeviceContent}
				{!findDevice && loginContent}
			<Snackbar open={this.props.snack.open} message={this.props.snack.text} autoHideDuration={3000} onRequestClose={this.cleanSnack.bind(this)}/>
			</div>
			);
	}

	kenDown(e) {
		if (e.nativeEvent.which == 13) {
			this.submit();
		}
	}

	//close snackbar
	cleanSnack() {
		this.props.dispatch(Action.cleanSnack());
	}

	toggleDevice() {
		this.props.dispatch(Action.toggleDevice());
	}

	submitServer() {

	}

	serverKeyDown() {

	}
};

Index.childContextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

function mapStateToProps (state) {
	return {
		login: state.login,
		snack: state.snack
	}
}
	
export default connect(mapStateToProps)(Index);
