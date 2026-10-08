function getLocation(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation)return reject(new Error('GPS is not supported.'));
    navigator.geolocation.getCurrentPosition(
      p=>resolve({
        lat:p.coords.latitude,
        lon:p.coords.longitude,
        accuracy:p.coords.accuracy
      }),
      e=>reject(new Error(e.code===1?'Location permission was denied.':'Unable to get a reliable GPS location.')),
      {enableHighAccuracy:true,timeout:15000,maximumAge:0}
    );
  });
}
