const DEVICE_KEY='attendance_device_token';

function getDeviceToken(){
  return localStorage.getItem(DEVICE_KEY)||'';
}
function saveDeviceToken(token){
  localStorage.setItem(DEVICE_KEY,token);
}
function clearDeviceToken(){
  localStorage.removeItem(DEVICE_KEY);
}
function deviceFingerprintHint(){
  // This is only a non-security hint for audit; never use browser UA as device identity.
  return navigator.userAgent.slice(0,240);
}
