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
		var data =[{id: item.id, size: item.size,
			navn: item.navn, type: 'pizza', antall: '1', bilde: item.bilde,
			pris: item.pris, key: key}];
		data = JSON.stringify(data);
		try {
			await AsyncStorage.setItem(key, data);
		} catch (error) {
			this.setState({ hasErrored: true });
		} finally {
			this.refs.toast.show(item.navn+' til i handlekurv');
		}
		this.setState({count});
	}
	async componentDidMount() {
		// Load fonts
		await Font.loadAsync({
      'Montserrat-Regular': global.FONT_MR,
      'Montserrat-Medium':  global.FONT_MM,
	  });
		// Load data from DB
		fetchData(global.ITEM_API,'snacks')
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
									source={{uri: item.bilde}}
								/>
							</View>
							<View style={{ flex: 1, width: '46%'}}>
								<Text style={styles.titleSnacks}>
									{item.navn}
								</Text>
								<Text style={styles.subtitle}>
									{item.innhold}
								</Text>
							</View>
							<View style={{flexDirection: 'row', width: '24%', alignItems: 'flex-end'}}>
		          <Text style={styles.pris}>
		            {item.pris}kr
		            </Text>
		            {item.utsolgt =="1" &&
		              <Icon
		                name='cart-plus'
		                size={28}
		                color='gray'
		                style={{height:25,width:25,borderRadius:15}}/>
		            }
		            {item.utsolgt =="0" &&
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
