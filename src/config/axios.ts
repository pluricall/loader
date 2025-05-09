import axios from 'axios'
import { Agent } from 'node:https'

export const uAgentWeb = axios.create({
  baseURL: 'https://pluricall.altitudecloud.com/uAgentWeb8',
  httpsAgent: new Agent({
    rejectUnauthorized: false,
  }),
})
