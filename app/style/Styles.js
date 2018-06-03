'use strict';
import Expo from 'expo';
var React = require('react-native');
export default React.StyleSheet.create({
	container: {
    flex: 1,
		marginTop: Expo.Constants.statusBarHeight,
  },
	activityIndicator: {
		flex: 1,
		padding: 20,
		paddingTop: '48%',
		alignItems: 'center',
	},
  listItem: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d6d7da',
    padding: 5,
  },
	tabs: {
		flexDirection: 'row',
  },
  imageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '25%',
    marginRight: 9
  },
	imageWrapperCart:{
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '18%',
    marginRight: 9
  },
  title: {
    fontSize: 25,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'left',
    color: 'black',
    margin: 2,
    paddingBottom: 3,
  },
	titleCart: {
    fontSize: 19,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'left',
    color: 'black',
    margin: 2,
    paddingBottom: 3,
  },
	titleSnacks: {
    fontSize: 22,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'left',
    color: 'black',
    margin: 2,
    paddingBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    margin: 2,
    paddingBottom: 3,
    paddingLeft: 3,
  },
  utsolgt: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    color: 'red',
    margin: 2,
    paddingBottom: 3,
  },
  pris:{
    fontSize: 15,
    textAlign: 'right',
    paddingRight: 15,
  },
	prisCart:{
    fontSize: 15,
		paddingBottom: '10%',
    textAlign: 'right',
    paddingRight: 15,
  },
});
