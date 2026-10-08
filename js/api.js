async function api(action,payload={}){
  const res=await fetch(API_URL,{
    method:'POST',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({action,...payload})
  });
  if(!res.ok) throw new Error('Server error');
  const data=await res.json();
  if(!data.ok) throw new Error(data.message||'Request failed');
  return data;
}
