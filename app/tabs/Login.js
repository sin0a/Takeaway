import React, { Component } from 'react';
import { AppRegistry, Alert, AsyncStorage,TouchableOpacity, ActivityIndicator, Image, FlatList, StyleSheet, Text, View,} from 'react-native';
import { List, ListItem, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Expo, Font } from 'expo';
import styles from '../style/Styles.js';
import GLOBALS from '../config/Config';
import FormData from 'form-data';
import {fetchData} from '../actions/Action';

export default class Drikke extends React.Component {

	constructor(props){
		super(props);
		this.state ={
			data: [],
		}
	}
	async componentDidMount(){
		// load custom fonts
		await Font.loadAsync({
			'Montserrat-Regular': global.FONT_MR,
			'Montserrat-Medium':  global.FONT_MM,
		});
			var form = new FormData()
			form.append('category', '3');
			fetch(global.ITEM_API, {
				method: 'POST',
				body: form
			})
			.then((response) => response.json())
			.then((data) => this.setState({ data }))
			.catch(() => this.setState({ hasErrored: true }));
			this.setState({isLoading: false});
	}
	render(){
		if(this.state.isLoading){
			return(
				<View style={styles.activityIndicator}>
					<ActivityIndicator/>
				</View>
			)
		} if(this.state.hasErrored){
				return(
					<View style={styles.activityIndicator}>
						<Text>{global.ERR_BASIC}</Text>
					</View>
				)
		}
		return(
			<View style={styles.container}>
        <FormLabel >Brukernavn</FormLabel>
        <FormInput/>
        <FormValidationMessage>Error message</FormValidationMessage>
        <FormLabel>Passord</FormLabel>
        <FormInput/>
        <FormValidationMessage>Error message</FormValidationMessage>
			</View>
		);
	}
}
