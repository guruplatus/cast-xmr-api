#!/usr/bin/env node

const { exec } = require('child_process')
const mqtt = require('mqtt')
const config = require('config')
require('colors')

const apiHost = config.get('api_host')
const apiPort = config.get('api_port')
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
  try {
    const command = exec(`curl ${apiHost}:${apiPort}`)
    command.stderr.on('data', stderr => console.log(`stderr: ${stderr}`))

    command.stdout.on('data', (stdout) => {
      const json = JSON.parse(stdout)
      const payload = JSON.stringify({ rig_uuid: rigUuid, payload: json })
      const time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

      console.log(`[${time}] ${topic}: `.yellow + payload)
      client.publish(topic, payload)
    })
  } catch (e) {
    console.log(`An error ocurred: ${e}`)
  }
}

setInterval(() => publish(), delay)
