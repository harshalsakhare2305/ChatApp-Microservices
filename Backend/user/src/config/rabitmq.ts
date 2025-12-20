import amqplib from 'amqplib'

let channel:amqplib.Channel;

export const ConnectToRabbitMQ = async ()=>{
    try {
        const connection =await amqplib.connect({
            protocol:"amqp",
            port:5672,
            hostname:process.env.RabbitMQ_HOSTNAME,
            username:process.env.RabbitMQ_USERNAME,
            password:process.env.RabbitMQ_PASSWORD,
        });

        channel=await connection.createChannel();
        console.log("✅ The RabbitMQ connected Successfully");
    } catch (error) {
        console.log("❌Failed to Connect to RabbitMQ");
        console.log(error);
    }
}

export const publishToQueue = async (queueName : string,message : any)=>{
      if(!channel){
        console.log("RabbitMQ channel is not inititalized");
        return;
      }

      await channel.assertQueue(queueName,{durable:true});

     channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{persistent:true});
}

