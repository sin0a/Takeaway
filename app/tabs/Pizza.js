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
    var price =  targetPost.price;
    var size = targetPost.size;
    var pNr = targetPost.pNr;
    targetPost.price = replacement.price;
    targetPost.size = replacement.size;
    targetPost.pNr = replacement.pNr;
    replacement.price = price;
    replacement.size = size;
    replacement.pNr = pNr;
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
          name: item.name, type: 'pizza', antall: '1', pic: item.pic,
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
  async componentDidMount(){
    // Load custom fonts
    await Font.loadAsync({
      'Montserrat-Regular': global.FONT_MR,
      'Montserrat-Medium':  global.FONT_MM,
	  });
    // fetch data from DB
    var array = [];
    var inStock = [];
    this.setState({ fontLoaded: true });
    var form = new FormData()
    form.append('category', '1');
    fetch(global.ITEM_API, {
      method: 'POST',
      body: form
    })
      .then((response) => response.json())
      .then((responseJson) => {
        for (i=0; i < responseJson.length; ++i) {
          if (responseJson[i]["pNr"] % 2 != 0) {
            array.push(responseJson[i]);
            responseJson.splice(i, 1);
          }
        }

    this.setState({
      isLoading: false,
      dataSource: responseJson,
      inStock: inStock,
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
        style={{backgroundColor:'#7f1a1a'}}
        textStyle={{color:'white'}}
      />
        <FlatList
          data={this.state.dataSource}
          ekstradata={this.state.selected}
          renderItem={({item, index}) =>
          <View style={styles.listItem}>
            <View style={styles.imageWrapper}>
              <Image
                style={{ width: 80, height: 80 }}
                source={{uri: item.pic}}
                />
            </View>
          <View style={{ width: '46%' }}>
            {item.inStock =="1" && <Text> <Text style={styles.title}>{item.name}</Text><Text style={{fontSize: 12,
            fontFamily: 'Montserrat-Regular',
            textAlign: 'left',
            color: 'red'}}> (utsolgt)</Text> </Text>}
            {item.inStock =="0" && <Text> <Text style={styles.title}>{item.name}</Text> </Text>}
          <View>
              <Text style={styles.description}>
                {item.description}
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
