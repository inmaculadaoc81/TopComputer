const nodemailer=require("nodemailer");

const clean=(v,max=4000)=>String(v??"").replace(/[<>]/g,"").trim().slice(0,max);

module.exports=async(req,res)=>{
  if(req.method==="GET"){
    const keys=["SMTP_HOST","SMTP_PORT","SMTP_SECURE","SMTP_USER","SMTP_PASS","CONTACT_EMAIL"];
    return res.status(200).json({
      ok:true,
      service:"Top Computer contacto API",
      environment:Object.fromEntries(keys.map(k=>[k,Boolean(process.env[k])]))
    });
  }

  if(req.method!=="POST"){
    res.setHeader("Allow","GET, POST");
    return res.status(405).json({ok:false,code:"METHOD_NOT_ALLOWED"});
  }

  try{
    const required=["SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS"];
    const missing=required.filter(k=>!process.env[k]);

    if(missing.length){
      return res.status(500).json({ok:false,code:"MISSING_SMTP_ENV",missing});
    }

    const b=req.body||{};
    const nombre=clean(b.nombre,120);
    const telefono=clean(b.telefono,60);
    const email=clean(b.email,180);
    const equipo=clean(b.equipo,180);
    const mensaje=clean(b.mensaje,4000);

    if(!nombre||!telefono||!email||!equipo||!mensaje){
      return res.status(400).json({ok:false,code:"INVALID_FORM_DATA"});
    }

    const port=Number(process.env.SMTP_PORT||465);
    const secure=String(process.env.SMTP_SECURE??(port===465?"true":"false"))==="true";

    const transporter=nodemailer.createTransport({
      host:process.env.SMTP_HOST,
      port,
      secure,
      auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS},
      connectionTimeout:15000,
      greetingTimeout:15000,
      socketTimeout:20000
    });

    await transporter.verify();

    await transporter.sendMail({
      from:`"Top Computer" <${process.env.SMTP_USER}>`,
      to:process.env.CONTACT_EMAIL||process.env.SMTP_USER,
      replyTo:email,
      subject:"Nueva consulta Top Computer - Ordenadores de segunda mano",
      text:`Nueva consulta Top Computer

Nombre: ${nombre}
Teléfono: ${telefono}
Email: ${email}
Tipo de equipo: ${equipo}

Consulta:
${mensaje}`
    });

    return res.status(200).json({ok:true});

  }catch(error){
    console.error("Top Computer SMTP error",{
      message:error?.message,
      code:error?.code,
      response:error?.response,
      command:error?.command
    });

    return res.status(500).json({
      ok:false,
      code:"SMTP_SEND_FAILED",
      detail:error?.code||"UNKNOWN"
    });
  }
};