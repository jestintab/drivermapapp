import React, {Component} from 'react';
import {View, Text, StyleSheet, Button, TextInput, Icon} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      alertmsg: ''
    };

    this._authenticate=this._authenticate.bind(this);
  }
  _authenticate(){
    //alert("loggin");
    //console.log(this.state.username)
   fetch('http://localhost:5000/drivers/login',{
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            username: this.state.username.toLowerCase(),
            password: this.state.password
            }),
          })
          .then((response) => response.json())
          .then((res) =>{
            console.log(res);
            if(res.isAuth === 1){
              console.log('login success');
              this.props.navigation.navigate('Map',{
                driver: res.driver
              });
            }else{
             alert(res.alertmsg);
            }
               
             })
             .catch((error) => {
              console.error(error);
            });
          

   // this.props.navigation.navigate('Map');
  }
  render() {
    
    return (
      <View style={{flex: 1, alignItems: 'center', paddingTop:100,backgroundColor: 'white'}}>
        <Text> LOGIN HERE</Text>
        <View style={styles.container}>
          <TextInput
            value={this.state.username}
            onChangeText={username => this.setState({username})}
            placeholder={'Username'}
            style={styles.input}
            underlineColorAndroid="rgba(131,157,182,.7)"
            autoCapitalize="none"
            placeholderTextColor="rgba(131,157,182,.7)"
          />
        </View>
        <View style={styles.container}>
          <TextInput
            value={this.state.password}
            onChangeText={password => this.setState({password})}
            placeholder={'Password'}
            secureTextEntry={true}
            style={styles.input}
            underlineColorAndroid="rgba(131,157,182,.7)"
            autoCapitalize="none"
            placeholderTextColor="rgba(131,157,182,.7)"
          />
        </View>
        <Button style={styles.button}
          title="Login"
          width= "100%"
          height= {50}
          color= "#000"
          alignItems= "center"
          justifyContent= "center"
   
          onPress={ this._authenticate}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',

    // backgroundColor: '#ecf0f1',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor:"#3BD1DF"
  },

  input: {
    margin: 15,
    width: 200,
    height: 40,
    borderBottomColor: "#d2dde8",
    color: 'rgba(131,157,182,.7)',
    borderBottomWidth: 1,
    backgroundColor:'#e8f0fe',
    fontSize: 13,
  },
  
});
