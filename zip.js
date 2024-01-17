import {readFileSync} from 'fs';
import {exec} from 'child_process';
import {
  platform,
  exit
} from 'process';

if (platform !== 'linux')
  exit();

const {
  name,
  version
} = JSON.parse(readFileSync('./package.json'));

const PATH = './dist/*';
const FILENAME = `${name}_${version.split('.').join('_')}.zip`;

exec(`zip ./zip/${FILENAME} -r ${PATH}`, (err, stdout, stderr) => {
  if (err)
    throw new Error(err.message);

  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
