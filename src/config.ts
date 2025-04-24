import config from 'config';
import AppConfig from "@/lib/models/config"
// import c from '@/../config/default';

const appConfig = config.util.toObject() as AppConfig;
// const appConfig = c;
export default appConfig;
