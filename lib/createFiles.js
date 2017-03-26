const fs = require('fs');
const colors = require('colors');

const writeFile = function (fName, dir, content, description) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(`${dir}/${fName}`, content, (err) => {
    if (err) process.stderr.write(err);
  });
  const printDir = (dir === './' || dir === '/' || dir === '') ? '' : `${dir.slice(2)}/`;
  process.stdout.write(colors.cyan(`Created ${description}: ${printDir}${fName}\n`));
};

module.exports = {
  writeFile,
};
