export interface AppConfig {
  availableLanguages: string[];
  environment: string;
  environmentColour: string;
  environmentName: string;
  endpoints: AppEndpoints;
}

export interface AppEndpoints {
  config: string;
  devices: string;
  events: string;
  order: string;
}
