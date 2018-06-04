import React, { Component } from 'react';
import { Alert, AsyncStorage, ActivityIndicator, Image, TouchableOpacity, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Font } from 'expo';
import styles from '../style/Styles.js';
import checkForUpdate from './Handlekurv';
import GLOBALS from '../config/Config';
import Toast, {DURATION} from 'react-native-easy-toast';


export default class Pizza extends React.Component {

  constructor(props){
    state = {
      fontLoaded: false,
    };
    super(props);

    this.state ={
      data: [],
      ekstradata: [],
      cart: [],
      count: 0,
      value: 1,
      isFetching: false,
      selected: false,
      isLoading: true}
  }

  _likePost({ item, index }) {
    // Data
    let { dataSource } = this.state;
    let { selected } = this.state;
    // sekundær dataset
    let { ekstradata } = this.state;
    // Target
    let targetPost = dataSource[index];
    let replacement = ekstradata[index];
    // endre informasjon
    var pris =  targetPost.pris;
    var size = targetPost.size;
    var id = targetPost.id;
    targetPost.pris = replacement.pris;
    targetPost.size = replacement.size;
    targetPost.id = replacement.id;
    replacement.pris = pris;
    replacement.size = size;
    replacement.id = id;
    // Then update targetPost in 'posts'
    dataSource[index] = targetPost;
    // Then reset the 'state.posts' property
    this.setState({ dataSource });
    //this.setState({ refresh: !refresh});
    this.setState({ selected: !selected});
  }
  async _addToCart({ item }) {
    this.setState({isFetching:true});
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
      this.serState({hasErrored: true});
    } finally {
      this.refs.toast.show(item.navn+' til i handlekurv');
    }
    this.setState({count});
  }
  async componentDidMount(){
    // Load custom fonts
    await Font.loadAsync({
      'Montserrat-Regular': global.FONT_MR,
      'Montserrat-Medium':  global.FONT_MM,
	  });
    // fetch data from DB
    var array = [];
    var utsolgt = [];
    this.setState({ fontLoaded: true });
    return fetch(global.BASE_URL + '/pizza_api.php')
      .then((response) => response.json())
      .then((responseJson) => {
        for (i=0; i < responseJson.length; ++i) {
          if (responseJson[i]["id"] % 2 != 0) {
            array.push(responseJson[i]);
            responseJson.splice(i, 1);
          }
        }

    this.setState({
      isLoading: false,
      dataSource: responseJson,
      utsolgt: utsolgt,
      ekstradata: array,
        }, function(){
        });
      })
      .catch((error) =>{
        this.setState({hasErrored: true});
      });
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
          data={this.state.dataSource}
          ekstradata={this.state.selected}
          renderItem={({item, index}) =>
          <View style={styles.listItem}>
            <View style={styles.imageWrapper}>
              <Image
                style={{ width: 80, height: 80 }}
                source={{uri: item.bilde}}
                />
            </View>
          <View style={{ width: '46%' }}>
            {item.utsolgt =="1" && <Text> <Text style={styles.title}>{item.navn}</Text><Text style={{fontSize: 12,
            fontFamily: 'Montserrat-Regular',
            textAlign: 'left',
            color: 'red'}}>(Utsolgt)</Text> </Text>}
            {item.utsolgt =="0" && <Text> <Text style={styles.title}>{item.navn}</Text> </Text>}
          <View>
              <Text style={styles.subtitle}>
                {item.topping}
              </Text>
          </View>
          <View style={{marginTop: 10, marginBottom: 6, width: '70%'}}>
            <Button style={{fontFamily: 'Montserrat-Regular', fontWeight: '400'}}
              border='1'
              onPress={() => this._likePost({ item, index })}
              color='white'
              buttonStyle={{
                backgroundColor: '#7f1a1a',
                borderRadius: 5,
                height: 30
              }}
              title={item.size}
            />
          </View>
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
