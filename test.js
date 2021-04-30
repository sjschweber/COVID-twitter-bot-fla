const axios = require('axios');
const admin = require('firebase-admin');
const {Firestore} = require('@google-cloud/firestore');
const config = require('./config.js');
var fs = require('fs');
const serviceAccount = require(config.service_account);

var Twitter = require('twitter');

var T = new Twitter(config)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


let local_data = fs.readFileSync('stores.json');
let local_store_arr = JSON.parse(local_data);
let buildTweet = "";

axios.get("https://www.vaccinespotter.org/api/v0/states/FL.json")

  .then(res => {
    let curr_data = res.data.features.filter((location) => location.properties.city.toLowerCase().includes('miami'));
    // let localData = fs.writeFileSync('stores.json', JSON.stringify(data))
    return curr_data
  }).then(curr_data => {

    let sorted_local_arr = sortById(local_store_arr);
    let sorted_curr_data = sortById(curr_data);

    sorted_curr_data.forEach((store, index) => {
      let num_new_appointments = 0;


      if(store.properties.appointments_available){
        console.log(store.properties.appointments.length + " appointments available at " + store.properties.provider_brand_name + ", " + store.properties.address)
      }
      //if appointments available at both local and updated store, check if they are of different length
      if(store.properties.appointments_available && sorted_local_arr[index].properties.appointments_available){
        //console.log(store.properties.appointments.length + ", " + sorted_local_arr[index].properties.appointments.length);

        if(store.properties.appointments.length > sorted_local_arr[index].properties.appointments.length){
          num_new_appointments = store.properties.appointments.length - sorted_local_arr[index].properties.appointments.length
          // tweet(num_new_appointments, store.properties);
          // updateLocalFile(store.properties, sorted_local_arr, index);
        }else{

        }
      }else if(store.properties.appointments_available && !sorted_local_arr[index].properties.appointments_available){
        num_new_appointments = store.properties.appointments.length;
      //  tweet(num_new_appointments, store.properties);
      }else if(!store.properties.appointments_available && sorted_local_arr[index].properties.appointments_available){
        num_new_appointments = 0;
      }
      // if(store.properties.appointments.length > sorted_local_arr[index].properties.appointments.length){
      //   let num_new_appointments = store.properties.appointments.length - sorted_local_arr[index].properties.appointments.length;
      //   console.log(num_new_appointments)
      // }else{
      //
      // }
    })
  })

function tweet(num_new_appointments, store_properties){

  console.log(num_new_appointments + " available at " + store_properties.name);

}

function updateLocalFile(store_properties, sorted_local_arr, index){
  console.log("update arr at index: " + index)
}

function sortById(store_arr){
  return store_arr.sort((a , b) => {
    if(a.properties.id < b.properties.id){
      return -1
    }else if(a.properties.id > b.properties.id){
      return 1;
    }else{
      return 0;
    }
  })
}
  function storeIsInFile(store){
    storeArr.forEach((item, i) => {
      if(store.properties.id === item.properties.id){
        return i;
      }
    })
    return -1;
  }

async function getStoresFromDb(){

  const storeList = db.collection('stores')
  const snapshot = await storeList.get()
  return snapshot;

}

async function filterStoresFromDb(id){
  const storeList = db.collection('stores');
  const snapshot = await storeList.where('id', '==', id).get()
  return snapshot;
}

async function getStoresFromApi(){
  return axios.get("https://www.vaccinespotter.org/api/v0/states/FL.json")
    .then(res =>  res.data.features);
}

function getById (path, ids) {
  return db.get(
    [].concat(ids).map(id => db.doc(`${path}/${id}`))
  )
}


function formatter(str) {
  let isNextCapital = false;
  let retStr = ""
  for(var i = 0; i < str.length; i++){

    if(i == 0 || isNextCapital){
      retStr += str.charAt(i).toUpperCase();
      isNextCapital = false
    }else{
      if(str.charAt(i) === '_'){
        retStr += ' '
      }else{
        retStr += str.charAt(i).toLowerCase();
      }

      isNextCapital = false;
    }

    if(str.charAt(i) === ' ' || str.charAt(i) === '_'){

      isNextCapital = true;
    }
  }
  return retStr;
}

function checkIfNull(val){

  return val === null ? "(Not provided)" : formatter(val);

}
