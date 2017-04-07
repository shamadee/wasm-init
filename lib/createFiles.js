const fs = require('fs');
const colors = require('colors');
/**
 * Creates a template file with fs, according to the content parameter.
 * This process uses the fs.writeFileSync function because some files need
 * other files to exist prior
 * @param {String} fName 
 * @param {String} dir 
 * @param {String} content 
 * @param {String} description 
 * @param {String} args 
 */
const writeFile = function (fName, dir, content = `// ${fName}`, description, args) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  try {
    fs.writeFileSync(`${dir}/${fName}`, content(args));
  } catch (err) {
    process.stderr.write(err);
  }
  // notify the console that the file has been created
  const printDir = (dir === './' || dir === '/' || dir === '') ? '' : `${dir.slice(2)}/`;
  process.stdout.write(colors.grey(`Created ${description}: ./${printDir}${fName}\n`));
};

module.exports = {
  writeFile,
};
