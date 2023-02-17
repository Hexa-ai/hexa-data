import path from 'path';
import fs from 'fs-extra';

let assetsData: any = null;

const loadAssets = async () => {
  if (assetsData) {
    return assetsData;
  }

  assetsData = { found: false, css: [], js: [] };
  const manifestPath = path.resolve('./public/assets/manifest.json');
  try {
    await fs.access(manifestPath);
    const manifestText = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestText);
    assetsData.found = true;
    const pageImports = manifest['index.html'];

    for(const css of pageImports.css){
      assetsData.css.push(`/${css}`)
    }
    for(const imp of pageImports.file){
      assetsData.js.push(`/${imp}`)
    }
    assetsData.js.push(`/${pageImports.file}`);
  } catch (e) {
    if (!e.errno || e.errno !== -4058) {
      console.error(e);
    }
  }
  return assetsData;
};

export default loadAssets;
