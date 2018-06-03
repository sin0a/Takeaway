import React, { Component } from 'react';
import { AppRegistry, Alert, AsyncStorage,TouchableOpacity, ActivityIndicator, Image, FlatList, StyleSheet, Text, View,} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Expo, Font } from 'expo';
import styles from '../style/Styles.js';
import GLOBALS from '../config/Config';
import Toast, {DURATION} from 'react-native-easy-toast';

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
	async _addToCart({ targetPost }) {
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
		var data =[{id: targetPost.id, size: targetPost.size,
			navn: targetPost.navn, type: 'pizza', antall: '1', bilde: targetPost.bilde,
			pris: targetPost.pris, key: key}];
		data = JSON.stringify(data);
		try {
			await AsyncStorage.setItem(key, data);
		} catch (error) {
			this.setState({ hasErrored: true});
		} finally {
      this.refs.toast.show('Lagt til i handlekurv');
    }
		this.setState({count});
	}
	fetchData(url) {
		this.setState({ isLoading: true });
		fetch(url)
				.then((response) => {
						this.setState({ isLoading: false });
						return response;
				})
				.then((response) => response.json())
				.then((data) => this.setState({ data }))
				.catch(() => this.setState({ hasErrored: true }));
	}
	_prompt({item, index}){
		let { data } = this.state;
		let targetPost = data[index];
		Alert.alert(
			'Legg til vare',
			targetPost.navn ,
			[
				{text: 'Avbryt', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
				{text: 'Legg til', onPress: () => this._addToCart({targetPost})},
			],
			{ cancelable: false }
		)
	}
	async componentDidMount(){
		await Font.loadAsync({
	      'Montserrat-Regular': global.FONT_MR,
	      'Montserrat-Medium':  global.FONT_MM,
	    });
			this.fetchData(global.BASE_URL + '/drikke_api.php');
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
					style={{backgroundColor:'gray'}}
					textStyle={{color:'black'}}
				/>
				<FlatList
					data={this.state.data}
					renderItem={({item, index}) =>
						<View style={styles.listItem}>
							<View style={styles.imageWrapper}>
								<Image
									style={{ width: 80, height: 80}}
									source={{ uri: item.bilde}}
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
		              <TouchableOpacity onPress={()=>this._prompt({ item, index})}>
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
