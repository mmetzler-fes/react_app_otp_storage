const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude src-tauri from being watched to avoid errors with temporary build files
config.resolver.blockList = [
	...(config.resolver.blockList || []),
	new RegExp(`${path.resolve(__dirname, 'src-tauri').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`),
];

config.watchFolders = [
	path.resolve(__dirname),
];

module.exports = config;
