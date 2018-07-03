#!/usr/bin/env node

const _ = require("lodash");
const path = require("path");
const mkdirp = require('mkdirp');
const fs = require('fs');
const dp = require("./libs/deployer");
const log = require("./libs/log");

const defaultCongigData = dp.readFile('../default/toixe.conf', true);
const defaultJsData = dp.readFile('../default/toixe.js', true);
const defaultSolData = dp.readFile('../default/toixe.sol', true);

const version = require("./package").version;

function binCommands(cmds) {
  log.header('   𝕋𝕆𝕀𝕏𝔼  ');

  if (_.isArray(cmds) && cmds.length === 1 && cmds[0] === 'init') {
    init(process.cwd() + '/toixe');
  }

  if (_.isArray(cmds) && cmds.length === 1 && cmds[0] === 'deploy') {
    deployer(process.cwd() + '/toixe');
  }

  if (_.isArray(cmds) && cmds.length === 1 &&
    (
      cmds[0] === '-v' ||
      cmds[0] === 'version' ||
      cmds[0] === '--v' ||
      cmds[0] === '--version'
    )) {
    getVersion();
  }
}


function init(initPath) {
  log.header('    𝕀𝕟𝕚𝕥    ');

  mkdirp(initPath, function (err) {
    if (err) {
      log.failed('Init error: ', err);
      return err;
    }
    log.completed('Created \"/toixe\" directory.');
    writeFile(initPath + '/toixe.js', defaultJsData);
    writeFile(initPath + '/toixe.sol', defaultSolData);
    writeFile(initPath + '/toixe.conf', JSON.stringify(JSON.parse(defaultCongigData), null, 4));
  });
}

function deployer(scriptPath) {
  var script;
  try {
    var transformedPath = _.map(String(__dirname).split(path.sep).splice(1), function (item) {
      return '..';
    }).join(path.sep);
    transformedPath = transformedPath + scriptPath + '/toixe';
    script = require(transformedPath);
  } catch (e) {
    log.failed('Error of deployer load script: ', e);
    return;
  }

  script(dp);
}

binCommands(process.argv.slice(2));

function writeFile(filePath, data) {
  fs.writeFile(filePath, data, function (err, res) {
    if (err) {
      log.failed('Got error on file writing (' + filePath + '): ', err);
      return err;
    }
    const aFilePath = filePath.split('/');
    log.completed('Created \"/' + aFilePath[aFilePath.length - 1] + '\" file');
  });
}

function getVersion() {
  log.print('𝕍𝕖𝕣𝕤𝕚𝕠𝕟 ( 𝕥𝕠𝕚𝕩𝕖): ' + version + '\n', true);
}