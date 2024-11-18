const figlet = require('figlet');
const chalk = require('chalk');

const displayBanner = () => {
    const colors = [chalk.blue, chalk.magenta, chalk.yellow, chalk.cyan, chalk.white];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    figlet('HostName Hunter', (err, data) => {
        if (err) {
            console.log('Banner generation error:', err);
            return;
        }
        console.log(randomColor(data));
    });
};

module.exports = { displayBanner };
