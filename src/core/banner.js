const figlet = require('figlet');
const chalk = require('chalk');

const displayBanner = () => {
    figlet('HostName Hunter', (err, data) => {
        if (err) {
            console.log(chalk.red('Banner generation error:', err));
            console.log(chalk.cyan('HostName Hunter')); // Fallback text
            return;
        }
        console.log(chalk.cyan(data));
    });
};

module.exports = { displayBanner };
