const fs = require("fs");
const path = require("path");

async function main() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.error("Installing sharp...");
    require("child_process").execSync("npm install --no-save sharp", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit"
    });
    sharp = require("sharp");
  }

  const assetsDir = path.join(__dirname, "..", "assets");
  const iconSvg = path.join(assetsDir, "icon-source.svg");
  const adaptiveSvg = path.join(assetsDir, "adaptive-icon-source.svg");
  const iconPng = path.join(assetsDir, "icon.png");
  const adaptivePng = path.join(assetsDir, "adaptive-icon.png");

  await sharp(iconSvg).resize(1024, 1024).png({ compressionLevel: 9 }).toFile(iconPng);
  await sharp(adaptiveSvg).resize(1024, 1024).png({ compressionLevel: 9 }).toFile(adaptivePng);

  const iconSize = fs.statSync(iconPng).size;
  const adaptiveSize = fs.statSync(adaptivePng).size;
  console.log(`Generated ${iconPng} (${Math.round(iconSize / 1024)} KB)`);
  console.log(`Generated ${adaptivePng} (${Math.round(adaptiveSize / 1024)} KB)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
