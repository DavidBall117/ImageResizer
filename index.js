const yargs = require(`yargs`);
const fs = require(`fs`);
const path = require(`path`);
const sharp = require(`sharp`);

// Settings
const options = yargs
  .usage(`Usage: -i <inputPath> -w <width> -o <outputPath>`)
  .option(`i`, {
    alias: `inputPath`,
    describe: `Path to a folder of images, or path to an image`,
    type: `string`,
    demandOption: true,
  })
  .option(`w`, {
    alias: `width`,
    describe: `Target width for the images`,
    type: `number`,
    demandOption: true,
  })
  .option(`o`, {
    alias: `outputPath`,
    describe: `Path to ouput folder of your resized images (default is ./resized-images/)`,
    type: `string`,
  }).argv;

const INPUT_PATH = options.inputPath;
const MAX_WIDTH = options.width;
const OUTPUT_PATH = options.outputPath || `./resized-images/`;

const isValidFileType = (str, arr) => {
  const fn = str.toLocaleLowerCase();
  for (let i = 0; i < arr.length; i++) {
    if (fn.endsWith(arr[i])) {
      return true;
    }
  }
  return false;
};

const resizeImage = (inputPath, outputPath) => {
  // if the output directory doesn't exist, create it
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH);
  }
  // resize and output image
  sharp(inputPath)
    .resize({ width: MAX_WIDTH })
    .toFile(outputPath)
    .then((newFileInfo) => {
      console.log(`${outputPath} - ${newFileInfo.width}x${newFileInfo.height}`);
    })
    .catch((fileErr) => {
      console.log(fileErr);
    });
};

// Main Script
(() => {
  // detect if path is file or directory
  const stat = fs.statSync(INPUT_PATH);
  if (stat.isDirectory()) {
    // read all images within a folder
    fs.readdir(INPUT_PATH, (err, files) => {
      if (err) {
        console.log(err);
      }
      // filter input files to only include images
      const filteredFiles = files.filter((fileName) =>
        isValidFileType(fileName, [
          `.jpg`,
          `.jpeg`,
          `.png`,
          `.webp`,
          `.tiff`,
          `.gif`,
          `.svg`,
        ])
      );
      // read in each file, resize and output result
      for (let i = 0; i < filteredFiles.length; i++) {
        const inputPath = path.join(INPUT_PATH, filteredFiles[i]);
        const outputPath = path.join(OUTPUT_PATH, filteredFiles[i]);
        resizeImage(inputPath, outputPath);
      }
    });
  } else if (stat.isFile()) {
    const index = INPUT_PATH.lastIndexOf(`/`);
    const fileName = INPUT_PATH.substr(index);
    const outputPath = path.join(OUTPUT_PATH, fileName);
    resizeImage(INPUT_PATH, outputPath);
  }
})();
