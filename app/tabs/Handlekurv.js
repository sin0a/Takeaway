import React, { Component } from 'react';
import { AppRegistry, AsyncStorage, RefreshControl, TouchableOpacity, ActivityIndicator, Image,FlatList, StyleSheet, Text, View } from 'react-native';
import { List, ListItem, Button } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../style/Styles.js';
import { Expo, Font } from 'expo';

export default class Handlekurv extends React.Component {

	constructor(props){
		state = {
			fontLoaded: false,
		};
		super(props);

		this.state ={
			data: [],
			cart: [],
			total: 0,
			handlekurv: true,
			selected: false,
			dataUpdated: false,
			isFetching: true,
			isLoading: true}
	}
	componentWillReceiveProps(){
		this.refresh();
	}
	// Sammenligner dataTabell mot AsyncTabell
	async checkForUpdate(){
		let keys = await AsyncStorage.getAllKeys();
		let { cart } = this.state;
		var count = 0;
		for(let key of keys){
			count = count + 1;
		}
		if(cart.length < count || cart.length > count){
			let remove = false;
			this.checkAntall();
		}
	}
	// Oppdaterer antall av varer til AsyncStorage
	async checkAntall(){
		let { cart } = this.state;
		let num = 0;
		for(let i=0; i < cart.length; ++i){
			let target = cart[i];
			num = Number.parseInt(target.antall);
			if(num != 1 ){
				var key = target.key;
				target = JSON.stringify(target);
				await AsyncStorage.setItem(key, target);
			}
		}
		this.refresh();
	}
	// Henter data fra AsyncStorage
	async getKurv(){
		let keys = await AsyncStorage.getAllKeys();
		let { total } = this.state;
		let { cart } = this.state;
		let { dataUpdated } = this.state;
		let string;
		let json;
		// Hent all data fra handlekurv
		for(let key of keys){
			string = await AsyncStorage.getItem(key);
			json = JSON.parse(string);
			cart.push(json);
		}
		var merged = [].concat.apply([], cart);
		this.setState({ cart: merged });
		this.regnTotal();
	}
	// Oppdater dataTabell, re-rendrer View
	refresh(){
		let {cart} = this.state;
		this.setState({ cart: []});
		this.getKurv();
	}
	// Sletter en vare fra handlekurven
	 removeFromCart({item, index}){
		let { cart } = this.state;
		let { dataUpdated } = this.state;
		AsyncStorage.removeItem(item.key);
		cart.splice(index,1);
		this.setState({ cart });
		this.regnTotal();
		this.setState({dataUpdated: !dataUpdated});
	}
	// Regn ut totalpris
	regnTotal(){
		let { dataUpdated } = this.state;
		let { cart } = this.state;
		total = 0;
		for(let i=0; i < cart.length; ++i){
			total = total + Number.parseInt(cart[i].pris);
		}
		this.setState({ total });
		this.setState({ dataUpdated: !dataUpdated });
		this.setState({ isFetching: false});
	}
	// Button antall +: Øker antall av en vare
	antallPlus({item, index}){
		let num = Number.parseInt(item.antall);
		let pris = Number.parseInt(item.pris);
		let { cart } = this.state;
		let { dataUpdated } = this.state;
		num = num + 1;
		item.antall = num;
		item.pris = pris + pris/(num-1);
		cart[index] = item;
		this.setState({ cart });
		this.setState({dataUpdated: !dataUpdated});
		this.regnTotal();

	}
	// Button antall -: senker antall av en vare
	antallMinus({item, index}){
		let num = Number.parseInt(item.antall);
		let pris = Number.parseInt(item.pris);
		let { cart } = this.state;
		let { dataUpdated } = this.state;
		if(num > 1){
			num = num - 1;
			item.antall = num;
			item.pris = pris - pris/(num+1);
			cart[index] = item;
			this.setState({ cart });
			this.regnTotal();
			this.setState({dataUpdated: !dataUpdated});
		}
	}
	/*loadVarer(){
		let { cart } = this.state;
		const { item } = this.props.navigation.state.params;
		var data =[{id: item.id, size: item.size,
			navn: item.navn, type: 'pizza', antall: '1', bilde: item.bilde,
			pris: item.pris, key: key}];
			cart.push(cart);
			var merged = [].concat.apply([], cart);
			this.setState({ cart: merged });
	}*/
	async componentDidMount(){
		// fetch data from db
		this.getKurv();
		// Load fonts
		await Font.loadAsync({
      'Montserrat-Regular': global.FONT_MR,
    	'Montserrat-Medium':  global.FONT_MM,
	  });
		// update state
		this.setState({
			fontLoaded: true,
		 	isLoading: false,});
	}

	render(){
		if(this.state.isLoading || this.state.isFetching){
			return(
				<View style={styles.activityIndicator}>
					<ActivityIndicator/>
				</View>
			)
		}
		if(this.state.handlekurv){
			return(
				<View style={styles.container}>
					<View style={styles.tabs}>
						<View style={{ width:'50%'}}>
							<Button
								title='Handlekurv'
								onPress={() => this.setState({ handlekurv: true})}
								titleStyle={{fontFamily: 'Montserrat-Medium', fontWeight: '400', color:'black'}}
								buttonStyle={{
									height: 30,
									backgroundColor: 'white',
								}}/>
							</View>
							<View style={{ width:'50%'}}>
		            <Button style={{flex: 1}}
									title='Mine ordre'
									onPress={() => this.setState({ handlekurv: false})}
		              titleStyle={{color:'black', fontFamily: 'Montserrat-Medium', fontWeight: '400'}}
		              buttonStyle={{
		                height: 30,
										backgroundColor: 'white',
		              }}/>
		        </View>
					</View>
					<FlatList
						refreshControl={
							<RefreshControl
								refreshing={this.state.isLoading}
								onRefresh={this.checkForUpdate.bind(this)}/>
						}
						data={this.state.cart}
						extradata={this.state.dataUpdated}
						renderItem={({item, index}) =>
							<View style={styles.listItem}>
								<View style={styles.imageWrapperCart}>
									<Image
										style={{ width: 70, height: 70 }}
										source={{uri: item.bilde}}
									/>
								</View>
								<View style={{ width: '33%', paddingTop: '4%'}}>
									<Text style={styles.titleCart}>{item.navn}</Text>
								<View>
									<Text style={styles.subtitle}>
										{item.size}
									</Text>
								</View>
							</View>
							<View style={{ flexDirection: 'row', margin: 4, alignItems: 'flex-end', paddingBottom: '7%', width:'15%' }}>
								<TouchableOpacity onPress={()=>this.antallPlus({ item, index})}>
									<Ionicons
	            			name='ios-add-circle-outline'
	            			size={20}
	            			color='gray'
	            			style={{borderRadius:15}}/>
								</TouchableOpacity>
	            	<Text> {item.antall} </Text>
								<TouchableOpacity onPress={()=>this.antallMinus({ item, index})}>
	          			<Ionicons
			              name='ios-remove-circle-outline'
			              size={20}
			              color='gray'
			              style={{borderRadius:15}}/>
								</TouchableOpacity>
	          	</View>
							<View style={{flexDirection: 'row', margin: 4, alignItems: 'flex-end', width: '18%', paddingBottom: '5%'}}>
								<Text style={styles.prisCart}>
									{item.pris},-
								</Text>
							</View>
							<View style={{alignItems: 'flex-end', paddingBottom: '5%', flexDirection: 'row', margin: 4, width: '8%'}}>
								<TouchableOpacity onPress={()=>this.removeFromCart({ item, index})}>
									<Ionicons
										name='ios-close-circle-outline'
										size={28}
										color='#7f1a1a'
										style={{borderRadius:15, paddingBottom: '4%'}}/>
								</TouchableOpacity>
							</View>
							</View>
						}
						keyExtractor={(item, index) => index}
						/>
						<View style={{borderTopWidth: 1, paddingTop: '2%', paddingLeft: '3%'}}>
							<Text style={styles.title}>Total: {this.state.total} kr</Text>
						</View>
						<View style={{marginTop: 10, marginBottom: 6, paddingLeft: '5%', paddingRight: '5%'}}>
	            <Button style={{fontFamily: 'Montserrat-Regular', fontWeight: '400', flex: 1}}
	              border='1'
								title='Betal'
	              color='white'
	              buttonStyle={{
	                backgroundColor: '#7f1a1a',
	                height: 50,
									borderRadius: 4,
	              }}/>
	          </View>
				</View>
			);
		}else{
			return(
				<View style={styles.container}>
					<View style={styles.tabs}>
						<View style={{ width:'50%'}}>
							<Button
								title='Handlekurv'
								onPress={() => this.setState({ handlekurv: true})}
								titleStyle={{fontFamily: 'Montserrat-Medium', fontWeight: '400', color:'black'}}
								buttonStyle={{
									height: 50,
									backgroundColor: 'white',
								}}/>
							</View>
							<View style={{ width:'50%'}}>
		            <Button style={{flex: 1}}
									title='Mine ordre'
									onPress={() => this.setState({ handlekurv: false})}
		              titleStyle={{color:'black', fontFamily: 'Montserrat-Medium', fontWeight: '400'}}
		              buttonStyle={{
		                height: 50,
										backgroundColor: 'white',
		              }}/>
		        </View>
					</View>
					<FlatList
						refreshControl={
							<RefreshControl
								refreshing={this.state.isLoading}
								onRefresh={this.checkForUpdate.bind(this)}/>
						}
						data={this.state.cart}
						extradata={this.state.dataUpdated}
						renderItem={({item, index}) =>
							<View style={styles.listItem}>
							</View>
						}
						keyExtractor={(item, index) => index}
					/>
				</View>
			);
		}
	}
}
