import { DeviceStatus } from '../enum/device-status.enum';

export type Device = string;

export interface DeviceEvent {
  timestamp: number;
  partsPerMinute: number;
  status: DeviceStatus;
  deviceId: string;
  order: string;
}
