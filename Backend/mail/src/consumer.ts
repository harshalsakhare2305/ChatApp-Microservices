import amqp from 'amqplib'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config();

export const startSendotpConsumer = async ()=>{
    try {
        const connection =await amqp.connect({
            protocol:"amqp",
            port:5672,
            hostname:process.env.RabbitMQ_HOSTNAME,
            username:process.env.RabbitMQ_USERNAME,
            password:process.env.RabbitMQ_PASSWORD,
        });

        const queueName="send-otp";

        const channel=connection.createChannel();

        (await channel).assertQueue(queueName,{durable:true});

        console.log("✅ Mail Service consumer started ,listening for otp emails");

       (await channel).consume(queueName,async(msg)=>{
         if(msg){
            try {
                const {to,subject,body}=JSON.parse(msg.content.toString());
                const transporter =nodemailer.createTransport({
                    host:"smtp.gmail.com",
                    port:465,
                    auth:{
                        user:process.env.USER_NODEMAILER,
                        pass:process.env.PASSWORD_NODEMAILER
                    }
                });

                await transporter.sendMail({
                    from:"Chat-App",
                    to,
                    subject,
                    text:body,
                });

                console.log(`otp is send to ${to}`);
                (await channel).ack(msg);
            } catch (error) {
                
            }
         }
       })
    } catch (error) {
        console.log("Failed to start the RabbitMQ consumer");
    }
}

