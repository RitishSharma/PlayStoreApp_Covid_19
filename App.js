import React, {Component} from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements'

export default class App extends Component {
   constructor(props) {
     super(props);
 
     this.state = {
       data: [],
       search:'',
       isLoading: false,
     };

     this.arrayHolder = [];

     const AbortController = window.AbortController;
     this.controller = new AbortController();
     this.signal = this.controller.signal;
     
    }
   
   async componentDidMount(){
    this.mounted = true;
    const dataRes = await this.fetchData();
    dataRes.forEach((items) => {
      items.districtData.forEach((item) => {
        this.arrayHolder.push({
          district: item.district,
          confirmed: item.confirmed,
          active: item.active
        })
      })
    });

    this.sortArray(this.arrayHolder);

    if (this.mounted) {
      this.setState({data: this.arrayHolder});
    }
  }

  componentWillUnmount(){
    this.mounted = false;
    this.controller.abort();
  }

  sortArray(arr) {
    arr.sort((a,b)=> {
      if (a.district > b.district) {
        return 1;
      }
      if(a.district < b.district){
        return -1;
      }
      return 0;
    });
  }

   clearSearch = () => {
     this.search.clear();
   }

   SearchFilterFunction(text) {
    //passing the inserted text in textinput
    const newData = this.arrayHolder.filter(function(item) {
      //applying filter for the inserted text in search bar
      const itemData = item.district ? item.district.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      //setting the filtered newData on datasource
      //After setting the data it will automatically re-render the view
      data: newData,
      search:text,
    });
   }

   async fetchData(){
    const signal = this.signal;
      try {
         let res = await fetch('https://api.covid19india.org/v2/state_district_wise.json', {signal});
         let resData = await res.json();
         return resData; 
      } catch (err){
         console.log(err);
      }
      finally{
         this.setState({isLoading: false});
      }
   }
 
    render() {
      const dataRes = this.state.data;

     return (
       <>
       <View style = {styles.seachbarDiv}>
        <Text style = {styles.seachDivText}>Search Case In Your District</Text>
      <SearchBar
          round
          searchIcon={{ size: 24 }}
          autoCapitalize = 'none'
          placeholder="Type Here..."
          containerStyle = {{ backgroundColor: 'black' , width: 400, position:'relative', left:-12, top: 6,}}
          inputStyle = {{ color: 'white' }}
          inputContainerStyle = {{ borderBottomWidth: 0, borderColor: 'gray',borderWidth:0 }}
          onChangeText={(text) => this.SearchFilterFunction(text)}
          onClear={(text) => this.SearchFilterFunction('')}
          value={this.state.search.toString()}
          />
       </View>

       <View>
         <FlatList
          data = {dataRes}
          keyExtractor={(item, index) => index.toString()}
          style = {styles.listContainer}
          renderItem = {({item}) => (
            <Text key = {item.district}
          style={styles.listTextcss}> {item.district} ------- {item.confirmed}(Confirmed)
          ---- {item.active}(Active)</Text>
          )}
         />
       </View>
       </>
     );
   }
 };

const styles = StyleSheet.create({
  seachbarDiv:{
    marginTop:30,
    padding: 14,
    backgroundColor:'black',
  },  
    searchBarContainer:{
    backgroundColor: 'black' ,
    width: 400,
    position:'relative',
    left:-12,
    top: 6,
    },
    searchBarInputContainer: {
      borderBottomWidth: 0,
      borderColor: 'gray',
     },
    seachDivText: {
      fontSize: 20,
      color: 'white'
    },
    textInputStyle: {
      color: 'white',
    },
    listContainer: {
      backgroundColor:'cadetblue',
      paddingTop:6,
      paddingBottom:6,
     },
     listTextcss:{
      fontSize: 16,
      padding:10,
      backgroundColor: 'white',
      margin:4,
      borderRadius:14,
      color: 'black', 
    }
})