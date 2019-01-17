#!/usr/bin/env node

const { exec } = require('child_process')
const mqtt = require('mqtt')
const request = require('request')
const config = require('config')
require('colors')

const apiUrl = config.get('api_url')
const mqttUrl = config.get('mqtt_url')
const mqttUsername = config.get('mqtt_username')
const mqttPassword = config.get('mqtt_password')
const topic = config.get('mqtt_topic')
const rigUuid = config.get('rig_uuid')
const delay = 10000

const options = { clientId: rigUuid, username: mqttUsername, password: mqttPassword }

const client = mqtt.connect(mqttUrl, options)

console.log(`Connecting to: ${mqttUrl} with username: ${mqttUsername}`.yellow)

client.on('connect', () => console.log(`Connected to: ${mqttUrl}`.green))

const publish = () => {
  request(apiUrl, (error, response, body) => {
    const time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

    if(error) {
      console.log(`[${time}] ${topic}: `.red + error)
      return
    }

    if(!response) {
      console.log(`[${time}] ${topic}: No response`.red)
      return
    }

    if(response.statusCode == 200) {
      const payload = JSON.stringify({ rig_uuid: rigUuid, payload: JSON.parse(body) })
      console.log(`[${time}] ${topic}: `.yellow + payload)
      client.publish(topic, payload)
    } else {
      console.log(`[${time}] ${topic}: `.red + response.statusCode)
    }
  })
}

setInterval(() => publish(), delay)
