const figlet = require('figlet');
const chalk = require('chalk');

const displayBanner = () => {
    figlet('HostName Hunter', (err, data) => {
        if (err) {
            console.log('Banner generation error:', err);
            return;
        }
        console.log(chalk.cyan(data));
    });
};

module.exports = { displayBanner };
