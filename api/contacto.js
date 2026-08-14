const MAX={nombre:100,telefono:30,email:160,modelo:120,mensaje:3000};
const clean=(v,max)=>String(v??'').trim().slice(0,max);const escapeHtml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const base64url=s=>Buffer.from(s,'utf8').toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const encodeHeader=s=>`=?UTF-8?B?${Buffer.from(s,'utf8').toString('base64')}?=`;
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Método no permitido'});
  try{
    const body=req.body||{};if(body.website)return res.status(200).json({ok:true});
    const nombre=clean(body.nombre,MAX.nombre),telefono=clean(body.telefono,MAX.telefono),email=clean(body.email,MAX.email),modelo=clean(body.modelo,MAX.modelo),mensaje=clean(body.mensaje,MAX.mensaje);
    if(!nombre||!telefono||!email||!mensaje)return res.status(400).json({error:'Completa todos los campos obligatorios.'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:'Introduce un email válido.'});
    const clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET,refreshToken=process.env.GOOGLE_REFRESH_TOKEN,from=process.env.GOOGLE_EMAIL,to=process.env.CONTACT_EMAIL;
    if(!clientId||!clientSecret||!refreshToken||!from||!to){console.error('Faltan variables de entorno Gmail API');return res.status(500).json({error:'El formulario no está configurado correctamente.'})}
    const tokenResp=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refreshToken,grant_type:'refresh_token'})});
    const tokenData=await tokenResp.json();if(!tokenResp.ok||!tokenData.access_token){console.error('OAuth token error',tokenData?.error);return res.status(502).json({error:'No se pudo autenticar el envío del formulario.'})}
    const safe={nombre:escapeHtml(nombre),telefono:escapeHtml(telefono),email:escapeHtml(email),modelo:escapeHtml(modelo||'No indicado'),mensaje:escapeHtml(mensaje).replace(/\n/g,'<br>')};
    const subject=`Nueva consulta Top Computer - toppcusados.com.es | ${modelo||'Ordenador reacondicionado'}`;
    const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#060726"><h2 style="color:#01A583">Nueva consulta desde Top Computer</h2><p><strong>Nombre:</strong> ${safe.nombre}</p><p><strong>Teléfono:</strong> ${safe.telefono}</p><p><strong>Email:</strong> ${safe.email}</p><p><strong>Categoría de interés:</strong> ${safe.modelo}</p><p><strong>Qué busca:</strong><br>${safe.mensaje}</p><hr><p style="font-size:12px;color:#57626B">Enviado desde el formulario de toppcusados.com.es</p></div>`;
    const mime=[`From: Top Computer <${from}>`,`To: ${to}`,`Reply-To: ${email}`,`Subject: ${encodeHeader(subject)}`,'MIME-Version: 1.0','Content-Type: text/html; charset="UTF-8"','Content-Transfer-Encoding: 8bit','',html].join('\r\n');
    const sendResp=await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send',{method:'POST',headers:{Authorization:`Bearer ${tokenData.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({raw:base64url(mime)})});
    const sendData=await sendResp.json();if(!sendResp.ok){console.error('Gmail send error',sendData?.error?.message||sendData);return res.status(502).json({error:'No se pudo enviar la consulta. Inténtalo de nuevo más tarde.'})}
    return res.status(200).json({ok:true});
  }catch(err){console.error('Contact API error',err);return res.status(500).json({error:'Se produjo un error al enviar la consulta.'})}
}
