const fs = require('fs');
const colors = require('colors');

const writeFile = function (fName, dir, content, description, args) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  try {
    fs.writeFileSync(`${dir}/${fName}`, content(args));
  } catch (err) {
    process.stderr.write(err);
  }
  const printDir = (dir === './' || dir === '/' || dir === '') ? '' : `${dir.slice(2)}/`;
  process.stdout.write(colors.grey(`Created ${description}: ./${printDir}${fName}\n`));
};

module.exports = {
  writeFile,
};
