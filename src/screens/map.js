import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
  SafeAreaView,
  Button,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, {
  Marker,
  AnimatedRegion,
  PROVIDER_GOOGLE,
  Polyline,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import haversine from 'haversine';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 25.3252981;
const LONGITUDE = 51.5261059;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      driver: props.route.params.driver,
      trip_id: '',
      latitude: LATITUDE,
      longitude: LONGITUDE,
      routeCoordinates: [],
      distanceTravelled: 0,
      prevLatLng: {},
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0,
      }),
    };

    this._startdrive = this._startdrive.bind(this);
    this._enddrive = this._enddrive.bind(this);
  }

  componentDidMount() {
    this.watchLocation();
  }

  watchLocation = () => {
    const {routeCoordinates, distanceTravelled} = this.state;
    const {coordinate} = this.state;

    this.watchID = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;

        const newCoordinate = {
          latitude,
          longitude,
        };

        if (Platform.OS === 'android') {
          if (this.marker) {
            this.marker._component.animateMarkerToCoordinate(
              newCoordinate,
              500, // 500 is the duration to animate the marker
            );
          }
        } else {
          coordinate.timing(newCoordinate).start();
        }
        //console.log('lat:' + latitude + ' ' + 'log:' + longitude);

        this.setState({
          latitude: latitude,
          longitude: longitude,
          routeCoordinates: routeCoordinates.concat([newCoordinate]),
          distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
          prevLatLng: newCoordinate,
        });
        //console.log('km: '+this.state.distanceTravelled);
        //console.log(this.state.latitude+' , '+ this.state.longitude );
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 1,
      },
    );
  };

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  calcDistance = newLatLng => {
    const {prevLatLng} = this.state;
    // console.log('hav '+prevLatLng+'  '+ newLatLng);
    return haversine(prevLatLng, newLatLng, {unit: 'meter'}) || 0;
  };

  _startdrive() {
    fetch('http://localhost:5000/drivers/trip/' + this.state.driver._id, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trip: {
          start_time: new Date(),
          end_time: '',
          kilometers: 0,
          drivepath: [],
        },
        location: {lat: this.state.latitude, lng: this.state.longitude},
      }),
    })
      .then(response => response.json())
      .then(res => {
        console.log(res);
        const trip_id = res.driver.trips[res.driver.trips.length - 1]._id;
        this.setState({
          trip_id: trip_id,
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  _enddrive() {
    fetch('http://localhost:5000/drivers/endtrip/' + this.state.driver._id, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trip_id: this.state.trip_id,
        endtime: new Date(),
        kilometers: this.state.distanceTravelled,
        drivepaths: this.state.routeCoordinates,
        location: {lat: this.state.latitude, lng: this.state.longitude},
      }),
    })
      .then(response => response.json())
      .then(res => {
        console.log(res);
        alert(res.msg);
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
          <MapView
            style={styles.map}
            showUserLocation
            followUserLocation
            loadingEnabled
            region={this.getMapRegion()}>
            <Polyline
              coordinates={this.state.routeCoordinates}
              strokeWidth={5}
            />
            <Marker.Animated
              ref={marker => {
                this.marker = marker;
              }}
              coordinate={this.state.coordinate}
            />
          </MapView>
          <View
            style={{
              position: 'absolute',
              top: '0%',
              alignSelf: 'flex-start',
              backgroundColor: '#c6c6c6',
            }}>
            <Button title="Start New Drive" onPress={this._startdrive} />
          </View>
          <View
            style={{
              position: 'absolute',
              top: '0%',
              alignSelf: 'flex-end',
              backgroundColor: '#c6c6c6',
            }}>
            <Button title="End Drive" onPress={this._enddrive} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.bubble, styles.button]}>
              <Text style={styles.bottomBarContent}>
                {parseFloat(this.state.distanceTravelled).toFixed(2)} km
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 100,
    backgroundColor: 'transparent',
  },
});
