require('dotenv').config();
const config = require('./config.js');
const axios = require('axios')
const local_link = config.local_link;
const live_link = config.live_link;
const link = (process.argv[2] === "test" ? local_link : live_link)
const cheerio = require('cheerio')

const now = Date.now();

var Twitter = require('twitter');

var T = new Twitter(config)

console.log(now);
console.log(process.argv)

//gets html vaccine page, and then slices the script which has a param
axios.get(`${live_link}`)

.then(res => {

  const html = res.data;
  const $ = cheerio.load(html);

  let str = $('script').slice(12).toString();
  console.log(str);
})

 setInterval(() => {

  axios.get(`${config.source_link}${now}`)

  .then( (res) => {

    data = res.data.toString(16);

    let x = data.split('\n').map((line, index) => {


      if(index === 0){

        return line.slice(2).split('').filter((char, index) => {

          if(char === '\x00'){
            return false;
          }
          if(char === '\r'){
            return false;
          }

          return true;
        }).join('')

      }else{

        return line.split('').filter((char, index) => {

          if(char === '\r'){
            return false
          }
          if(char == '\''){
            return false;
          }
          if(char === '\x00'){
            return false;
          }
          return true;
        }).join('')
      }
    })

    let finalArr = x.map((item) => {
      return item.replace('|', '-');
    })

    return finalArr;

  }).then((data) => {

       let countiesByRegion = mapCountiesToRegion(data);

       let northStatus = (buildTweetText(countiesByRegion, "North"));
       let southStatus = buildTweetText(countiesByRegion, "South");
       let centralEastStatus = buildTweetText(countiesByRegion, "Central East");
       let centralWestStatus = buildTweetText(countiesByRegion, "Central West");
       let panhandleStatus = buildTweetText(countiesByRegion, "Panhandle");

       T.post('statuses/update', { status: `${panhandleStatus}` + "\n#COVID19 #vaccine #Florida"}, function (err, res, data){

           if(err){
             console.log("error")
           }else{
             console.log("success")
           }
       })
       T.post('statuses/update', { status: `${northStatus}` + "\n#COVID19 #vaccine #Florida"}, function (err, res, data){
         if(err){
           console.log(err)
         }else{
           console.log("success")
         }
       })
       T.post('statuses/update', { status: `${centralEastStatus}` + "\n#COVID19 #vaccine #Florida"}, function (err, res, data){
         if(err){
           console.log(err)
         }else{
           console.log("success")
         }
       })
       T.post('statuses/update', { status: `${centralWestStatus}` + "\n#COVID19 #vaccine #Florida"}, function (err, res, data){
         if(err){
           console.log(err)
         }else{
           console.log("success")
         }
       })

       T.post('statuses/update', { status: `${southStatus}` + "\n#COVID19 #vaccine #Florida"}, function (err, res, data){
         if(err){
           console.log(err)
         }else{
           console.log("success")
         }
       })
  })


}, 600000)


function mapCountiesToRegion(data){

  var regions = {
    North: [],
    South: [],
    Central_West: [],
    Central_East: [],
    Panhandle: [],
  }


  data.forEach((item) => {
    let countyName = item.substring(0, item.indexOf('-'));
    let availability = item.substring(item.indexOf('-')+1);

    if(countyName.includes("Miami")){
      countyName = "Miami-Dade";
      availability = item.substring(11);
    }

    switch(countyName){
      case "Okaloosa":
      case "Walton":
      case "Santa Rosa":
      case "Leon":
      case "Bay":
        regions.Panhandle.push(buildCountyObj(countyName, availability));
        break;
      case "Lafayette":
      case "Dixie":
      case "Suwannee":
      case "Alachua":
      case "Clay":
      case "Duval":
      case "Nassau":
      case "St. Johns":
      case "Columbia":
        regions.North.push(buildCountyObj(countyName, availability))
        break;
      case "Citrus":
      case "Polk":
      case "Pasco":
      case "Marion":
      case "Sumter":
      case "Hernando":
      case "Hillsborough":
      case "Pinellas":
        regions.Central_West.push(buildCountyObj(countyName, availability));
        break;
      case "Volusia":
      case "Seminole":
      case "Lake":
      case "Orange":
      case "Brevard":
      case "Osceola":
      case "Okeechobee":
      case "St. Lucie":
      case "Martin":
      case "Indian River":
      case "Flagler":
        regions.Central_East.push(buildCountyObj(countyName, availability))
        break;
      case "Manatee":
      case "Sarasota":
      case "Desoto":
      case "Highlands":
      case "Charlotte":
      case "Lee":
      case "Collier":
      case "Palm Beach":
      case "Broward":
      case "Monroe":
      case "Miami-Dade":
        regions.South.push(buildCountyObj(countyName, availability));
        break;
      default:
        break;
    }
  })
  return regions;
}

function buildCountyObj(countyName, availability){

  let countyObj = {
    isBooked: false,
    county: countyName,
    percentAvailable: null,
  }
  if(availability.includes("Fully")){
    countyObj.isBooked = true;
  }else if(availability.includes("Less")){
    countyObj.percentAvailable = 1;
  }else if(availability.includes("None")){
    countyObj.isBooked = true;
  }
  else{
    countyObj.percentAvailable = parseFloat(availability);
  }

  return countyObj
}

function buildTweetText(countiesByRegion, region){

  let header = `% of ${config.service} COVID Vaccine appts. remaining in ${region} Florida:\n\n`;
  let bookedCounties = [];
  let booked = "";
  let tmp = null;
  let tweet = "";
  switch(region){
    case "North":
      tmp = countiesByRegion.North;
      break;
    case "Central West":
      tmp = countiesByRegion.Central_West
      break;
    case "Central East":
      tmp = countiesByRegion.Central_East
      break;
    case "Panhandle":
      tmp = countiesByRegion.Panhandle;
      break;
    default:
      tmp = countiesByRegion.South;
      break;
  }
  tweet += header
  tmp.sort((a, b) => {

    if(a.percentAvailable < b.percentAvailable){
      return 1;
    }else{
      return -1;
    }

  }).forEach((item) => {
    if(item.isBooked){
      bookedCounties.push(item);
    }else{
      tweet += item.county + " - " + item.percentAvailable + "%\n";
    }
  })

  bookedCounties.forEach((item, i) => {
    if(i >= 1){
      booked += ', ' + item.county;
    }else{
      booked += "Booked: " + item.county;
    }
  })
  tweet += "\n" + booked;
  return tweet
}

exports.mapCountiesToRegion = mapCountiesToRegion;
