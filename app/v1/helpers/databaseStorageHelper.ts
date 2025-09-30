import { Model } from "sequelize";

let instances = {} as { [key: string]: Model };

export function addInstance(instanceName: string, instance: Model) {
  instances[instanceName] = instance;
}

export function getInstance(instanceName: string) {
  return instances[instanceName];
}

export function removeInstance(instanceName: string) {
  delete instances[instanceName];
}
