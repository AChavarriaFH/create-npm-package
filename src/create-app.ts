import { Spinner } from 'cli-spinner';
import fs from 'fs';
import { join } from 'path';
import { bold, cyan, dim, green } from 'colorette';
import { downloadStarter } from './download';
import { Starter } from './starters';
import { unZipBuffer } from './unzip';
import { npm, onlyUnix, printDuration, renameAsync, setTmpDirectory, terminalPrompt } from './utils';
import { replaceInFile } from 'replace-in-file';

const starterCache = new Map<Starter, Promise<undefined | ((name: string) => Promise<void>)>>();

export async function createApp(starter: Starter, projectName: string, autoRun: boolean) {
  if (fs.existsSync(projectName)) {
    throw new Error(`Folder "./${projectName}" already exists, please choose a different project name.`);
  }

  projectName = projectName.toLowerCase().trim();

  if (!validateProjectName(projectName)) {
    throw new Error(`Project name "${projectName}" is not valid. It must be a kebab-case name without spaces.`);
  }

  const loading = new Spinner(bold('Preparing starter'));
  loading.setSpinnerString(18);
  loading.start();

  const startT = Date.now();
  const moveTo = await prepareStarter(starter);
  if (!moveTo) {
    throw new Error('starter install failed');
  }
  await moveTo(projectName);
  loading.stop(true);

  const time = printDuration(Date.now() - startT);
  console.log(`${green('✔')} ${bold('All setup')} ${onlyUnix('🎉')} ${dim(time)}

  ${dim(terminalPrompt())} ${green('npm start')}
    Starts the development server.

  ${dim(terminalPrompt())} ${green('npm run build')}
    Builds your library in production mode.

  ${dim(terminalPrompt())} ${green('npm test')}
    Starts the test runner.


  ${dim('We suggest that you begin by typing:')}

   ${dim(terminalPrompt())} ${green('cd')} ${projectName}
   ${dim(terminalPrompt())} ${green('npm install')}
   ${dim(terminalPrompt())} ${green('npm start')}
${renderDocs(starter)}

  Sunrun
`);

  if (autoRun) {
    await npm('start', projectName, 'inherit');
  }
}

function renderDocs(starter: Starter) {
  const docs = starter.docs;
  if (!docs) {
    return '';
  }
  return `
  ${dim('Further reading:')}

   ${dim('-')} ${cyan(docs)}`;
}

export function prepareStarter(starter: Starter) {
  let promise = starterCache.get(starter);
  if (!promise) {
    promise = prepare(starter);
    // silent crash, we will handle later
    promise.catch(() => {
      return;
    });
    starterCache.set(starter, promise);
  }
  return promise;
}

async function prepare(starter: Starter) {
  const baseDir = process.cwd();
  const tmpPath = join(baseDir, '.tmp-package-starter');
  const buffer = await downloadStarter(starter);
  setTmpDirectory(tmpPath);

  await unZipBuffer(buffer, tmpPath);
  await npm('ci', tmpPath);

  return async (projectName: string) => {
    const filePath = join(baseDir, projectName);
    await renameAsync(tmpPath, filePath);
    await getRefactorCommand(starter.name)(filePath, projectName);
    setTmpDirectory(null);
  };
}

function validateProjectName(projectName: string) {
  return !/[^a-zA-Z0-9-]/.test(projectName);
}

function getRefactorCommand(starterName: string) {
  switch (starterName) {
    case 'library':
      return refactorLibraryTemplate;
  
    default:
      return () => {};
  }
}

/**
  * Rename all files for library template
  * https://github.com/amurilloFH/npm-package-template
  * @param filePath 
  * @param projectName 
  */
async function refactorLibraryTemplate(filePath: string, projectName: string) {
  const clearAndUpper = (text: string) => text.replace(/-/, '').toUpperCase();
  const toCamelCase   = (text: string) => text.replace(/-\w/g, clearAndUpper);
  const toPascalCase  = (text: string) => text.replace(/(^\w|-\w)/g, clearAndUpper);

  // rename default files
  await renameAsync(
    join(filePath, 'src/my-npm-package.ts'),
    join(filePath, `src/${projectName}.ts`),
  );
  await renameAsync(
    join(filePath, 'src/my-npm-package.test.ts'),
    join(filePath, `src/${projectName}.test.ts`),
  );

  // replace imports/classes/variables to match project name
  await replaceInFile({
    files: [join(filePath, 'src/*.ts'), join(filePath, 'package*.json')],
    from: /my-npm-package/g,
    to: projectName,
  });
  await replaceInFile({
    files: join(filePath, 'src/*.ts'),
    from: /MyNpmPackage/g,
    to: toPascalCase(projectName)
  });
  await replaceInFile({
    files: join(filePath, 'src/*.ts'),
    from: /myNpmPackage/g,
    to: toCamelCase(projectName)
  });
}
