import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const addonRoot = fileURLToPath(new URL('./addon', import.meta.url));
const rootsAnchor =
  'const addonRoots = await resolveAddons(initialConfig.addons);';
const serveChunkPattern = /\/@slidev\/cli\/dist\/serve-[^/]+\.mjs$/;

registerHooks({
  load: (url, context, nextLoad) => {
    const result = nextLoad(url, context);

    if (!serveChunkPattern.test(url)) {
      return result;
    }

    const source = String(result.source);

    if (!source.includes(rootsAnchor)) {
      throw new Error(
        'Slidevision cannot add its slide overview to this version of Slidev. Install @slidev/cli 53.',
      );
    }

    return {
      ...result,
      source: source.replace(
        rootsAnchor,
        `${rootsAnchor}\naddonRoots.push(${JSON.stringify(addonRoot)});`,
      ),
    };
  },
});

const [bin = '', ...args] = process.argv.slice(2);

process.argv = [process.argv[0] ?? process.execPath, bin, ...args];

await import(pathToFileURL(bin).href);
