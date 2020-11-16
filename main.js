let lat, lng;


//converTime
function timeConverter(timestamp){
  let date = {};
  let a = new Date(timestamp * 1000);
  let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
   date.year = a.getFullYear();
   date.month = months[a.getMonth()];
   date.day = a.getDate();
   date.hour = a.getHours();
   date.min = a.getMinutes();
   return date;
}

//deteils daily
function dailyMore(daily, result, i, date){
  if(document.querySelector("table") != null){
    document.querySelector("table").remove();
  }

  let table = document.createElement("table");
  table.innerHTML = `<tr>
                      <th>${date[i].day} ${date[i].month}</th>
                      <th>Morning</th>
                      <th>Evening</th>
                      <th>Night</th>
                    </tr>
                    <tr>
                      <th>Temp (°)</th>
                      <td>${daily[i].temp.morn}</td>
                      <td>${daily[i].temp.eve}</td>
                      <td>${daily[i].temp.night}</td>
                    </tr>
                    <tr>
                      <th>Feel like (°)</th>
                      <td>${daily[i].feels_like.morn} </td>
                      <td>${daily[i].feels_like.eve} </td>
                      <td>${daily[i].feels_like.night} </td>
                    </tr>
                    <tr>
                      <th>Humidity (%)</th>
                      <td colspan="3">${daily[i].humidity}</td>
                    </tr>`;
  result.appendChild(table);
  table.scrollIntoView({behavior: "smooth", block: "end"});
}


//deteiled first 48 Hours
function more(hourly, result, i, date){
  if(document.querySelector("table") != null){
    document.querySelector("table").remove();
  }

  let table = document.createElement("table");
  table.innerHTML = `<thead><tr>
                      <th>${date[i].day} ${date[i].month}</th>
                      <th>Temp (°) (Feel)</th>
                      <th>Hum (%)</th>
                      <th>Time</th>
                    </tr></thead><tbody id="tbody${i}"></tbody>`;
  result.appendChild(table);
  let hour= timeConverter(hourly[0].dt);
  let len, j;
  if(i === 0){
    j = 0;
    len = -(hour.hour-24);
  }else if(i === 1){
    j = -(hour.hour-24);
    len = j+24;
  }
  while(j<len){
     hour = timeConverter(hourly[j].dt);
    document.querySelector("#tbody"+i).innerHTML +=  `<tr><td><img src="http://openweathermap.org/img/wn/${hourly[j].weather[0].icon}@2x.png"><p>${hourly[j].weather[0].main}</p></td>
                            <td>${hourly[j].temp} (${hourly[j].feels_like})</td>
                            <td>${hourly[j].humidity}</td>
                            <td>${hour.hour}:00</td>
                        </tr>` ;
    j++;
  }
  table.scrollIntoView({behavior: "smooth"});
}


//create all the weather visualization
function getForecast(){
    let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon="+ lng +"&exclude=alert&appid=76821bd709baa3f392084c8d0059facc&units=metric";
    fetch(url).then(d=>{return d.json()}).then(res => {
      let result = document.querySelector(".result");
      result.innerHTML = "";
      let w = document.createElement("div");
      w.classList.add("weatherWindow");
      result.appendChild(w);
      let day, daydate, div, date= [];
      for (let i = 0; i < res.daily.length; i++) {
        day = res.daily[i].weather[0];
        date[i] = timeConverter(res.daily[i].dt);
        div = document.createElement("div");
        div.classList.add("day");
        div.innerHTML = `<img src="https://openweathermap.org/img/wn/${day.icon}@2x.png"><p>${date[i].day} ${date[i].month}</p>`;

        w.appendChild(div);

        //current day
        if(i === 0){
          div.addEventListener("click", function(){
           more(res.hourly, result, i, date);
         });
       }else if(i === 1){//tommorow
         div.addEventListener("click", function(){
          more(res.hourly, result, i, date);
        });
      }else{
        div.addEventListener("click", function(){
          dailyMore(res.daily, result, i, date);
        });
      }
    }
    div.scrollIntoView({behavior: "smooth", block: "end"});
  }).catch(() => {
    let err = document.createElement("h1")
    err.textContent = "we are sorry seems like there is a problem";
    document.querySelector(".result").appendChild(err);
  });
}

//add city name
function addResult(r){
  let div = document.createElement("div");
  div.innerHTML= `<h5> ${r.results[0].locations[0].adminArea5}  ${r.results[0].locations[0].adminArea3}  ${r.results[0].locations[0].adminArea1} </h5>`  ;

  let cityInfo = document.querySelector(".cityInfo");
  cityInfo.style.marginTop = "20px";
  cityInfo.innerHTML = "";
  cityInfo.appendChild(div);
}




//from city to latlng
function city(){
    let url = "https://www.mapquestapi.com/geocoding/v1/address?key=DxiwSO9Bjtlpl0AkG2AEcylut6xYYlhA&location=" + search.value;
    fetch(url).then(d=>{return d.json()}).then(res => {
      lat = res.results[0].locations[0].latLng.lat;
      lng = res.results[0].locations[0].latLng.lng;
      addResult(res);
      getForecast();
    }).catch(() => {
      let err = document.createElement("h1")
      err.textContent = "cant detect where you are";
      document.querySelector(".result").appendChild(err);
    });
}

//from lat lng to city
function reverseCity(){
    let url = "http://www.mapquestapi.com/geocoding/v1/reverse?key=DxiwSO9Bjtlpl0AkG2AEcylut6xYYlhA&location="+lat+","+lng+"&includeRoadMetadata=false&includeNearestIntersection=false";
    fetch(url).then(d=>{return d.json()}).then(res => {
      addResult(res);
      getForecast();
    }).catch(() => {
      let err = document.createElement("h1")
      err.textContent = "cant detect where you are";
      document.querySelector(".result").appendChild(err);
    });
}


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position){
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      reverseCity();
      getForecast();
    });
  } else {
      alert("Geolocation is not supported by this browser.");
  }
}


let search = document.querySelector("#city");
search.addEventListener("keypress", function(event){
  if(event.keyCode === 13 && search.value.length > 0){
    city();
    search.value = "";
  }
});
 document.querySelector("#search").addEventListener("click", function(){
  if(search.value.length > 0){
    city();
    search.value = "";
  }
});



document.getElementById("locateMe").addEventListener("click", function(){getLocation();});
