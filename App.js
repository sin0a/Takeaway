import React, { Component } from 'react';
import { AppRegistry, ActivityIndicator, Image, SectionList, FlatList, ListView, StyleSheet, Text, View, TextInput } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { TabNavigator, TabBarBottom } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Expo from 'expo';
import { Font } from 'expo';
import Pizza from './app/tabs/Pizza';
import Drikke from './app/tabs/Drikke';
import Saus from './app/tabs/Saus';
import Handlekurv from './app/tabs/Handlekurv';
import Snacks from './app/tabs/Snacks';
import CustomIcon from './CustomIcons.js';
import styles from './app/style/Styles.js';

class Deals extends React.Component {

  constructor(){
    super();
    global.BASE_URL   = 'http://ec2-35-178-132-219.eu-west-2.compute.amazonaws.com';
    global.IMAGE_DRIKKE = require('C:/Users/Sindre/TestProject/app/pictures/soda-bottle.png');
    global.IMAGE_BURGER = require('./app/pictures/burgertirsdag.png');
    global.ERR_BASIC  = 'Det skjedde en feil, vennligst prøv igjen senere';
    global.FONT_MM    = require('C:/Users/Sindre/TestProject/resources/fonts/Montserrat-Medium.ttf');
    global.FONT_MR    = require('C:/Users/Sindre/TestProject/resources/fonts/Montserrat-Regular.ttf');
  }

  async componentDidMount(){
  await Font.loadAsync({
      'Montserrat-Regular': global.FONT_MR,
      'Montserrat-Medium':  global.FONT_MM,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={{
              flex: 1,
                alignSelf: 'stretch',
                width: undefined,
                height: undefined,
                resizeMode: 'contain'
              }}
              source={global.IMAGE_BURGER}
              >
        </Image>
      </View>
    );
  }
}

export default TabNavigator(
  {
    Deals: { screen: Deals },
    Pizza: { screen: Pizza},
    Snacks: { screen: Snacks},
    Dressing: { screen: Saus},
    Drikke: { screen: Drikke},
    Handlekurv: { screen: Handlekurv},

  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Deals') {
          iconName = `star${focused ? '' : '-outline'}`;
        } else if (routeName == 'Pizza') {
        	iconName = 'pizza';
        } else if (routeName == 'Dressing') {
          iconName = 'bowl';
          //return <Icon name{}
          return <Icon name={iconName} size={25} color={tintColor} />;
        }
        else if (routeName == 'Handlekurv') {
        	iconName = `cart${focused ? '' : '-outline'}`;
          return <Icon name={iconName} size={25} color={tintColor} onPress={() => navigation.navigate("Handlekurv", { dataUpdated: true })}/>;
        }
        else if (routeName == 'Drikke') {
        	//iconName = `cup${focused ? '' : '-outline'}`;
          iconName = 'beer';
          //return <Icon name{}
          return <Icon name={iconName} size={25} color={tintColor}/>;
        }
        else if (routeName == 'Snacks') {
          iconName = 'hamburger';
          //return <Icon name{}
          return <Icon name={iconName} size={25} color={tintColor}/>;
        }

        // You can return any component that you like here! We usually use an
        // icon component from react-native-vector-icons
        return <Icon name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#7f1a1a',
      inactiveTintColor: 'gray',
    },
    tabBarComponent: TabBarBottom,
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: true,
  }

);
