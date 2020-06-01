const debug = require('debug')('karaoker:KaraokerController');
const path = require('path');
const fs = require('./../utils/fsPromise');
const { exec } = require("child_process");

const KaraokerController = {

  tmp: '/tmp',
  serve: '/tmp',

  tmpDir() {
    return path.join(__dirname, '/../', KaraokerController.tmp)
  },

  serveDir() {
    return path.join(__dirname, '/../', KaraokerController.serve)
  },

  parseURL: url => {
    const matches = url.match(/\?v=([^&]+)/);
    if(matches)
      return matches[1];
    else
      return false;
  },

  download: url => {
    const id = KaraokerController.parseURL(url);

    return new Promise((resolve, reject) => {
      if(!id) {
        debug('URL %s rejected', url);
        return reject(new Error('Invalid URL'));
      }

      const file = path.join(KaraokerController.tmpDir(), `${id}.mp3`);
      const cmd = `youtube-dl --extract-audio --audio-format mp3 ${id} -o ${file}`;

      debug('Downloading audio from %s', url);
      exec(cmd, err => {
        if(err) {
          reject(new Error('Error processing file'));
        } else {
          resolve({ id, file });
        }
      })      
    });
  },

  process: file => {
    debug('Splitting file %s', file);

    return new Promise((resolve, reject) => {
      const output = KaraokerController.tmpDir();
      const cmd = `conda run spleeter separate -i ${file} -p spleeter:2stems -o ${output} -c mp3`;

      exec(cmd, err => {
        //Output dir is filename minus extension (.mp3)
        const outputDir = file.substr(0, file.length - 4);

        //Remove original file
        fs.unlink(file);
          
        if(err) {
          reject(new Error('Error processing file'));
        } else {
          const newFile = path.basename(file);

          //Remove vocals file
          fs.unlink(`${outputDir}/vocals.mp3`);

          //Rename instrumental track and empty directory
          fs
            .rename(`${outputDir}/accompaniment.mp3`, `${KaraokerController.serveDir()}/${newFile}`)
            .then(() => fs.rmdirSync(outputDir));

          resolve(newFile);
          debug('Splitting file %s complete', file);
        }
      })      
    });
  },

  cleanup: files => {
    //Remove old served files
    files.forEach(file => {
      fs.unlink(`${KaraokerController.serveDir()}/${file}`);
      debug('Removed old file %s', file);
    });
  }

}

module.exports = KaraokerController;