import config from 'config';
import { AppConfig } from "@/lib/models/config"

export const appConfig = config.util.toObject() as AppConfig;
