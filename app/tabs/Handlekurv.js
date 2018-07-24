import React, { Component } from 'react';
import { AppRegistry, Alert, AsyncStorage, RefreshControl, TouchableOpacity, ActivityIndicator, Image,FlatList, StyleSheet, Text, View } from 'react-native';
import { List, ListItem, Button } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../style/Styles.js';
import { Expo, Font } from 'expo';
import Toast, {DURATION} from 'react-native-easy-toast';

export default class Handlekurv extends React.Component {

	constructor(props){
		state = {
			fontLoaded: false,
		};
		super(props);

		this.state ={
			data: [],
			cart: [],
			orders: [],
			history: [],
			details: [],
			compare: [],
			total: 0,
			oNr: 0,
			handlekurv: true,
			selected: false,
			dataUpdated: false,
			isLoading: true}
	}
	async componentWillReceiveProps(props){
		this.setState({dataUpdated: props})
		this.refresh();
	}
	// Sammenligner dataTabell mot AsyncTabell
	async checkForUpdate(){
		let keys = await AsyncStorage.getAllKeys();
		let { cart } = this.state;
		let { compare } = this.state;
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
	// Henter data fra AsyncStorage*/
	async getKurv(){
		let keys = await AsyncStorage.getAllKeys();
		let { total } = this.state;
		let { cart } = this.state;
		let { orders } = this.state;
		let { dataUpdated } = this.state;
		let string;
		let json;
		// Hent all data fra handlekurv
		try {
			for(let key of keys){
				string = await AsyncStorage.getItem(key);
				if(parseInt(key) >= 50){
					json = JSON.parse(string);
					orders.push(json);
				} else{
					json = JSON.parse(string);
					cart.push(json);
				}
			}
			var merged = [].concat.apply([], cart);
			var mergedOrders = [].concat.apply([], orders);
		}catch(error) {
			console.error(error);
		}finally{
				this.setState({ cart: merged });
				this.setState({ orders: mergedOrders});
				this.regnTotal();
				if(orders != null){
				}
		}
	}
	// Oppdater dataTabell, re-rendrer View
	refresh(){
		let {cart} = this.state;
		this.setState({ cart: []});
		this.getKurv();
		this.getOrders();
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
	// Regn ut totalprice
	regnTotal(){
		let { dataUpdated } = this.state;
		let { cart } = this.state;
		total = 0;
		for(let i=0; i < cart.length; ++i){
			antall = Number.parseInt(cart[i].antall);
			item = Number.parseInt(cart[i].price);
			total = total + (antall * item);
		}
		this.setState({ total });
		this.setState({ dataUpdated: !dataUpdated });
		this.setState({ isFetching: false});
	}
	// Button antall +: Øker antall av en vare
	antallPlus({item, index}){
		let num = Number.parseInt(item.antall);
		let price = Number.parseInt(item.price);
		let { cart } = this.state;
		let { dataUpdated } = this.state;
		num = num + 1;
		item.antall = num;
		this.setState({ cart: cart });
		this.setState({dataUpdated: !dataUpdated});
		this.regnTotal();
	}
	// Button antall -: senker antall av en vare
	antallMinus({item, index}){
		let num = Number.parseInt(item.antall);
		let price = Number.parseInt(item.price);
		let { cart } = this.state;
		let { dataUpdated } = this.state;
		if(num > 1){
			num = num - 1;
			item.antall = num;
			this.setState({ cart });
			this.regnTotal();
			this.setState({dataUpdated: !dataUpdated});
		}
	}
	loadVarer(){
		//let { cart } = this.state;
		const { item } = this.props.navigation.state.params;
		console.log(item.name);
		/*var data =[{id: item.id, size: item.size,
			name: item.name, type: 'pizza', antall: '1', pic: item.pic,
			price: item.price, key: key}];
			cart.push(cart);
			var merged = [].concat.apply([], cart);
			this.setState({ cart: merged });*/
	}
	async saveOrder(data){
		let count = 50;
		key = JSON.stringify(count);
    try {
       let value = "value";
       while (value != null){
          count = count + 1;
					key = JSON.stringify(count);
					value = await AsyncStorage.getItem(key);
       }
			 AsyncStorage.setItem(key, data);
    } catch (error) {
      // Error retrieving data
    }
}
	async order(){
		let { cart}  = this.state;
		let onr = 0;
		try{
			var form = new FormData()
			form.append('unr', '1');
			form.append('order_status', 'aktiv');
			form.append('table', 'orders');
			await fetch(global.ORDER_API, {
				method: 'POST',
				body: form
			}).then(r => r.json())
			.then(data => {
				onr = data;
			});
		} catch(error){
			console.log(error);
		}finally{
		 try{
			for (var item of cart){
				var formData = new FormData()
				formData.append('pnr',item.pNr);
				formData.append('table', 'else');
				formData.append('onr', onr);
				formData.append('quantity', item.antall);
				await fetch(global.ORDER_API, {
				  method: 'POST',
				  body: formData
				});
			}
		} catch(error){
			console.log(error);
		}finally{
			this.refs.toast.show('Din bestilling er registrert');
			for (var item of cart){
				await AsyncStorage.removeItem(JSON.stringify(item.pNr));
			}
			this.refresh();
		}
	}
}
async getDetails({item}){
	var details = [];
	try{
		var form = new Formdata()
		form.append('table', 'get_details');
		form.append('onr', item.oNr);
	  await fetch(global.ORDER_API, {
	  method: 'POST',
	  body: form
	  }).then((response) => response.json())
	  .then((responseJson) => {
	    for (i=0; i < responseJson.length; ++i) {
	      details.push(responseJson[i]);
	    }});
	  this.setState({
	    details: details });
	}catch(error){
	    console.log(error);
	}finally{
		return <Text>Test</Text>
		this.setState({ dataUpdated: true});
	}
}
async getOrders(){
	var form = new FormData()
	var array = [];
	form.append('unr', '1');
	form.append('table', 'get_orders');
	try{
	  await fetch(global.ORDER_API, {
	  method: 'POST',
	  body: form
	  }).then((response) => response.json())
	  .then((responseJson) => {
	    for (i=0; i < responseJson.length; ++i) {
				responseJson[i].order_time = responseJson[i].order_time.slice(0,-3);
	      array.push(responseJson[i]);
	    }});
	  this.setState({
	    history: array
	  });
	}catch(error){
	    console.log(error);
	}finally{
	}
}
	async componentDidMount(){
		// fetch data from db
		this.getKurv();
		this.getOrders();
		//console.log(this.props.navigation.sta);
		//this.loadVarer();
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
					<Toast
		        ref="toast"
		        style={{backgroundColor:'#7f1a1a'}}
		        textStyle={{color:'white'}}
		      />
					<View style={styles.tabs}>
						<View style={{ width:'50%'}}>
							<Button
								title='Handlekurv'
								onPress={() => this.setState({ handlekurv: true})}
								titleStyle={{fontFamily: 'Montserrat-Medium', fontWeight: '400', color:'white'}}
								buttonStyle={{
									height: 50,
									backgroundColor: '#7f1a1a',
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
								onRefresh={this.refresh.bind(this)}/>
						}
						data={this.state.cart}
						extradata={this.state}
						renderItem={({item, index}) =>
							<View style={styles.listItem}>
								<View style={styles.imageWrapperCart}>
									<Image
										style={{ width: 70, height: 70 }}
										source={{uri: item.pic}}
									/>
								</View>
								<View style={{ width: '33%', paddingTop: '4%'}}>
									<Text style={styles.titleCart}>{item.name}</Text>
								<View>
									<Text style={styles.description}>
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
								<Text style={styles.priceCart}>
									{Number.parseInt(item.price) * Number.parseInt(item.antall)},-
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
								title='Bestill'
								onPress={() => this.order({})}
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
		              titleStyle={{color:'white', fontFamily: 'Montserrat-Medium', fontWeight: '400'}}
		              buttonStyle={{
		                height: 50,
										backgroundColor: '#7f1a1a',
		              }}/>
		        </View>
					</View>
					<FlatList
						refreshControl={
							<RefreshControl
								refreshing={this.state.isLoading}
								onRefresh={this.checkForUpdate.bind(this)}/>
						}
						data={this.state.history}
						extradata={this.state}
						renderItem={({item, index}) =>
							<View style={styles.listItem}>
								<View style={{ marginTop: 10, width: '46%' }}>
								<Text style={styles.description}>ONr: {item.oNr}</Text>
							</View>
							<View style={{marginTop: 10, marginBottom: 6, width: '70%'}}>
								<Text style={styles.description}>{item.order_date} {item.order_time} </Text>
								<Text style={styles.description}>{item.order_status}</Text>
							</View>
						</View>
						}
						keyExtractor={(item, index) => index}
					/>
				</View>
			);
		}
	}
}
