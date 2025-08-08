import figlet from 'figlet';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


function getAppVersion() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const packagePath = path.resolve(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}


export const displayBanner = () => { 
  return new Promise((resolve, reject) => {
    const colors = [chalk.cyan, chalk.magenta, chalk.yellow, chalk.blue];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const version = getAppVersion();

    figlet('HostName Hunter', { font: 'Standard' }, (err, data) => {
      if (err) {
        console.log('Banner generation error:', err);
        return reject(err);
      }


      console.log(randomColor(data));
      console.log(chalk.white.bold(`                          v${version}`));
      console.log(chalk.gray('      A tool for DNS, SSL, and HTTP header analysis.\n'));

      resolve();
    });
  });
};