import React, { Component } from 'react';
import { AppRegistry, Alert, AsyncStorage,TouchableOpacity, ActivityIndicator, Image, FlatList, StyleSheet, Text, View,} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Expo, Font } from 'expo';
import styles from '../style/Styles.js';
import GLOBALS from '../config/Config';
import FormData from 'form-data';
import Toast, {DURATION} from 'react-native-easy-toast';
import {fetchData} from '../actions/Action';

export default class Drikke extends React.Component {

	constructor(props){
		super(props);
		this.state ={
			data: [],
			isLoading: true,
			fontLoaded: true,
			count: 0,
			hasErrored: false,
		}
	}
	// TODO: Sjekk om alle metoder kan bli lagret i egen klasse
	// Viktig
	async _addToCart({ item }) {
		let { count} = this.state;
		// Henter alt som er i handlevognen
		let keys = await AsyncStorage.getAllKeys();
		// Teller antall rader
		for (let key of keys){
			count = count + 1;
		}
		count = count + 1;
		key = JSON.stringify(count);
		// Data som skal sendes
		var data =[{pNr: item.pNr, size: item.size,
			name: item.name, type: 'pizza', antall: '1', pic: item.pic,
			price: item.price, key: key}];
		data = JSON.stringify(data);
		try {
			await AsyncStorage.setItem(key, data);
		} catch (error) {
			this.setState({ hasErrored: true});
		} finally {
      this.refs.toast.show(item.name+' til i handlekurv');
    }
		this.setState({count});
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
				<Toast
					ref="toast"
					style={{backgroundColor:'white'}}
					textStyle={{color:'black'}}
				/>
				<FlatList
					data={this.state.data}
					renderItem={({item, index}) =>
						<View style={styles.listItem}>
							<View style={styles.imageWrapper}>
								<Image
									style={{ width: 80, height: 80}}
									source={{ uri: item.pic}}
								/>
							</View>
							<View style={{ flex: 1, width: '46%'}}>
								<Text style={styles.titleSnacks}>
									{item.name}
								</Text>
								<Text style={styles.description}>
									{item.size}
								</Text>
							</View>
							<View style={{flexDirection: 'row', width: '24%', alignItems: 'flex-end'}}>
		          <Text style={styles.price}>
		            {item.price}kr
		            </Text>
		            {item.inStock =="1" &&
		              <Icon
		                name='cart-plus'
		                size={28}
		                color='gray'
		                style={{height:25,width:25,borderRadius:15}}/>
		            }
		            {item.inStock =="0" &&
		              <TouchableOpacity onPress={()=>this._addToCart({ item })}>
		                <Icon
		                  name='cart-plus'
		                  size={28}
		                  color='green'
		                  style={{height:25,width:25,borderRadius:15}}/>
		              </TouchableOpacity>
		            }
		          </View>
					</View>}
					keyExtractor={(item, index) => index}
				/>
			</View>
		);
	}
}
