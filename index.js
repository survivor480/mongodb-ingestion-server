const mqtt = require("mqtt");
require('dotenv').config();
const mongoose = require('mongoose')

const server_room_topic = "/dist/nkda/server_room/sens";

const Broker_URL = "mqtt://3.6.181.48";
const options = {
    clientId: "",
    port: 1883,
    username: "distronix",
    password: "distronix",
    keepalive: 60,
};

const client = mqtt.connect(Broker_URL, options);
client.on("connect", mqtt_connect);
client.on("reconnect", mqtt_reconnect);
client.on("error", mqtt_error);
client.on("message", mqtt_messsageReceived);
client.on("close", mqtt_close);

function mqtt_connect() {
    console.log("Connecting MQTT");

    client.subscribe(server_room_topic, mqtt_subscribe);
}

function mqtt_subscribe(err, granted) {
    if (err) {
        console.error(err);
    } else {
        console.log("Subscribed to " + server_room_topic);
    }
}

function mqtt_reconnect(err) {
    console.log("Reconnect MQTT");
    if (err) {
        console.error(err);
    }
    client = mqtt.connect(Broker_URL, options);
}

function mqtt_error(err) {
    console.error("Error!");
    if (err) {
        console.log(err);
    }
}

function mqtt_close() {
    console.log("Close MQTT");
}

mongoose.connect('mongodb://learning:qwerty78@172.17.0.1:8000/learning').then(() => console.log('Connected!')).then(() => {
    console.log("MongoDB connected successfully")
}).catch(err => {console.log(err)});

const deviceDataSchema = new mongoose.Schema({
    dev_id: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    },
    temperature: {
      type: Number,
      required: true
    },
    humidity: {
      type: Number,
      required: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
});

const DeviceData = mongoose.model('DeviceData', deviceDataSchema);

const insertSampleData = async (device_id, timestamp, temperature, humidity) => {
    const sampleData = new DeviceData({
        dev_id: device_id,
        timestamp: timestamp,
        temperature: temperature,
        humidity: humidity,
    });

    await sampleData.save();
    console.log('Sample data inserted:', sampleData);
}

const readData = async () => {
    const allData = await DeviceData.find();
    console.log('All data:', allData);
  
    const filteredData = await DeviceData.find({
      timestamp: { $gt: new Date('1970-01-01T00:00:00Z') }
    });
    console.log('Filtered data:', filteredData);
};

async function mqtt_messsageReceived(topic, message, packet) {
    if(topic.includes(server_room_topic)){
        console.log("The Device Sent Data for Temperature and Humidity");
        ingest_temperature_and_humidity(message.toString());
    }
}


async function ingest_temperature_and_humidity(message) {
    try {
        let data = JSON.parse(message);

        console.log(message);

        await insertSampleData(data.dev_id, data.timestamp, data.temp, data.humi);

        await readData();

    } catch(err){
        console.log("error: ", err);
    }
}
