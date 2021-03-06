import React, { Component } from 'react';
import { AppRegistry, AsyncStorage, Alert, ActivityIndicator, TouchableOpacity, Image, FlatList, StyleSheet, Text, View } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Expo, Font} from 'expo';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../style/Styles.js';
import Toast, {DURATION} from 'react-native-easy-toast';
import {fetchData} from '../actions/Action';


export default class Snacks extends React.Component {
	constructor(props){
		super(props);
		this.state ={
			data: [],
			isLoading: true,
			fontLoaded: true,
			hasErrored: false,
			count: 0,
			value: 1,
		}
	}
// TODO: Sjekk om alle metoder kan bli lagret i egen klasse
// Viktig
async _addToCart({ item }) {
	this.setState({isFetching:true});
	let { count} = this.state;
	var key = JSON.stringify(item.pNr);
	let result = [];
	var storage = await AsyncStorage.getItem(key);
	if(storage != null){
		console.log(storage);
			json = JSON.parse(storage);
			result.push(json);
			var merged = [].concat.apply([], result);
			num = Number.parseInt(merged[0].antall);
			num = num + 1;
			merged[0].antall = num;
		try{
				await AsyncStorage.removeItem(key);
				await AsyncStorage.setItem(key, JSON.stringify(merged));
		} catch(error){
			this.setState({hasErrored: true});
		} finally{
			this.refs.toast.show(item.name+' lagt til i handlekurv');
		}

	} else {
		try{
			var data =[{pNr: item.pNr, size: item.size,
				name: item.name, type: 'snacks', antall: '1', pic: item.pic,
				price: item.price, key: key}];
			data = JSON.stringify(data);
			AsyncStorage.setItem(key, data);
		} catch(error){
			this.setState({hasErrored: true});
		} finally{
			this.refs.toast.show(item.name+' lagt til i handlekurv');
		}
	}
}
	async componentDidMount() {
		// Load fonts
		await Font.loadAsync({
      'Montserrat-Regular': global.FONT_MR,
      'Montserrat-Medium':  global.FONT_MM,
	  });
		// Load data from DB
		var form = new FormData()
		form.append('category', '2');
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
					style={{backgroundColor:'#7f1a1a'}}
					textStyle={{color:'white'}}
				/>
				<FlatList
					data={this.state.data}
					renderItem={({item, index}) =>
						<View style={styles.listItem}>
							<View style={styles.imageWrapper}>
								<Image
									style={{ width: 80, height: 80}}
									source={{uri: item.pic}}
								/>
							</View>
							<View style={{ flex: 1, width: '46%'}}>
								<Text style={styles.titleSnacks}>
									{item.name}
								</Text>
								<Text style={styles.description}>
									{item.description}
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
		              <TouchableOpacity onPress={()=>this._addToCart({ item})}>
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
