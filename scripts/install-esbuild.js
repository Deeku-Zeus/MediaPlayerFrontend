// scripts/install-esbuild.ts

import { execSync } from 'child_process';
import * as os from 'os';

const platform = os.platform();
const arch = os.arch();

if (platform === 'darwin' && arch === 'arm64') {
	execSync('npm install @esbuild/darwin-arm64');
} else if (platform === 'linux' && arch === 'arm64') {
	execSync('npm install @esbuild/linux-arm64');
} else {
	execSync('npm install esbuild-wasm');
}
