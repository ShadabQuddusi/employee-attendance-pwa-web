let session='';
let employee=null;
let pendingEmployeeId='';

const $=id=>document.getElementById(id);
function show(id){$(id).classList.remove('hidden')}
function hide(id){$(id).classList.add('hidden')}
function msg(id,t,cls=''){ $(id).textContent=t; $(id).className='msg '+cls; }

async function login(){
  const employeeId=$('employeeId').value.trim();
  if(!employeeId)return msg('loginMsg','Enter Employee ID.');
  try{
    const r=await api('deviceLogin',{employeeId,deviceToken:getDeviceToken(),userAgent:deviceFingerprintHint()});
    session=r.session;
    employee=r.employee;
    localStorage.setItem('attendance_session',session);
    hide('loginView'); show('dashboardView');
    renderEmployee();
    await refresh();
  }catch(e){
    msg('loginMsg',e.message);
  }
}

async function startEnrollment(){
  pendingEmployeeId=$('employeeId').value.trim();
  if(!pendingEmployeeId)return msg('loginMsg','Enter Employee ID first.');
  try{
    await api('sendOtp',{employeeId:pendingEmployeeId});
    hide('loginView'); show('otpView');
    msg('otpMsg','OTP sent to the registered email.','ok');
    $('otp').focus();
  }catch(e){msg('loginMsg',e.message)}
}

async function verifyOtp(){
  const otp=$('otp').value.trim();
  if(!/^\d{6}$/.test(otp))return msg('otpMsg','Enter the 6-digit OTP.');
  try{
    const r=await api('verifyOtp',{employeeId:pendingEmployeeId,otp,userAgent:deviceFingerprintHint()});
    saveDeviceToken(r.deviceToken);
    session=r.session; employee=r.employee;
    localStorage.setItem('attendance_session',session);
    hide('otpView'); show('dashboardView');
    renderEmployee(); await refresh();
  }catch(e){msg('otpMsg',e.message)}
}

function renderEmployee(){
  $('employeeName').textContent=employee.name;
  $('employeeMeta').textContent=`${employee.employeeId}${employee.department?' • '+employee.department:''}`;
}

async function refresh(){
  try{
    const r=await api('status',{session});
    $('statusCard').textContent=r.open
      ? `Attendance OPEN • Check-in: ${r.checkInSiteName} at ${r.checkInTime}`
      : 'No open attendance session';
    renderHistory(r.history||[]);
  }catch(e){msg('actionMsg',e.message)}
}

function renderHistory(items){
  if(!items.length){$('history').textContent='No attendance records.';return}
  $('history').innerHTML='<table><thead><tr><th>Action</th><th>Site</th><th>Time</th></tr></thead><tbody>'+
    items.map(x=>`<tr><td>${x.type}</td><td>${x.siteName}</td><td>${x.timestamp}</td></tr>`).join('')+
    '</tbody></table>';
}

async function mark(type){
  try{
    msg('actionMsg','Getting precise location...','warn');
    const loc=await getLocation();
    $('locationText').textContent=`${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)} • accuracy ${Math.round(loc.accuracy)}m`;
    const r=await api(type,{session,location:loc});
    msg('actionMsg',`${type==='checkIn'?'Check-in':'Check-out'} successful at ${r.siteName} (${Math.round(r.distance)}m).`,'ok');
    await refresh();
  }catch(e){msg('actionMsg',e.message)}
}

$('deviceLogin').onclick=login;
$('enroll').onclick=startEnrollment;
$('verifyOtp').onclick=verifyOtp;
$('backLogin').onclick=()=>{hide('otpView');show('loginView')};
$('checkIn').onclick=()=>mark('checkIn');
$('checkOut').onclick=()=>mark('checkOut');
$('logout').onclick=async()=>{
  try{if(session)await api('logout',{session})}catch(e){}
  session='';localStorage.removeItem('attendance_session');
  location.reload();
};

window.addEventListener('load',async()=>{
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js');
  const saved=localStorage.getItem('attendance_session');
  if(saved){
    try{
      const r=await api('resume',{session:saved});
      session=saved;employee=r.employee;
      hide('loginView');show('dashboardView');renderEmployee();await refresh();
    }catch(e){localStorage.removeItem('attendance_session')}
  }
});
