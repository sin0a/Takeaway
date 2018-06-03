import React, { Component } from 'react';
import Alert from 'react-native';

export default class Action extends React.component{

  constructor(){
		super();
		state = {
      fontLoaded: false,
    };
		this.state ={ data: [], isLoading: true}
	}
  componentDidMount(){
  }
  render(){

  }
  _prompt({item, index}){
  	Alert.alert(
  		'Legg til vare',
  		item.navn ,
  		[
  			{text: 'Avbryt', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
  			{text: 'Legg til', onPress: () => _addToCart({item})},
  		],
  		{ cancelable: false }
  	)
  }

}
