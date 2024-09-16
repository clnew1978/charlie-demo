import { readFileSync } from 'fs';
import { join } from 'path';
import lodash from 'lodash';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = JSON.parse(readFileSync(join(__dirname, 'config.json')).toString());

// update configures from environment variables
lodash.forEach(config, (val, key) => {
  lodash.set(config, key, lodash.get(process.env, key, val));
});

export { config }
