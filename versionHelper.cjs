// A node helper script that
// * checks that the parent package and all workspaces have the same version
// * sets the root and packages version if provided as an argument

const fs = require('node:fs');

function updatePackageVersion(filepath, oldVersion, newVersion) {
  console.log(`Updating ${filepath}`);
  let data = fs.readFileSync(filepath, 'utf-8');
  let result = data.replace(`  "version": "${oldVersion}"`, `  "version": "${newVersion}"`);
  fs.writeFileSync(filepath, result, 'utf8')
}

const rootVersion = require('./package.json').version
console.log(`Checking package versions match root version (${rootVersion})`)
let files = fs.readdirSync("./packages")
let check = files.reduce((success, file) => {
  let packageVersion = require("./packages/"+file+"/package.json").version;
  if (packageVersion != rootVersion) {
    console.error(`* ${file} (${packageVersion}) - FAILED`)
  } else {
    console.log(`* ${file} (${packageVersion}) - OK`)
  }
  return success && (packageVersion == rootVersion);
}, true);

if (process.argv.length==2) {
  console.log(`\nVersion check ${check ? "OK" :  "FAILED" }`);
  // exitCode = 0 if all package versions match root package
  process.exit(check ? 0 : 1);
} else {
  // set package version numbers
  let newVersion = process.argv[2]
  // TODO: check newVersion with semver
  // * does it look like a verison number?
  // * is it bigger than the existing version number?
  console.log(`Updating versions ${rootVersion} -> ${newVersion}`)
  updatePackageVersion("./package.json", rootVersion, newVersion);
  fs.readdir("./packages", (err, files) => {
    if (!err) {
      files.forEach((file) => {
        let existingVersion = require("./packages/"+file+"/package.json").version;
        updatePackageVersion(`./packages/${file}/package.json`, existingVersion, newVersion);
      });
    }
  });
}
