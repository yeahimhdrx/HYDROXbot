// Helper to check if canvas is available
let canvasAvailable = false;
let canvas = null;

try {
    canvas = require('canvas');
    canvasAvailable = true;
    console.log('✅ Canvas module loaded successfully');
} catch (error) {
    console.warn('⚠️ Canvas module not available - welcome cards will be disabled locally');
    console.warn('   This is normal for local development. Canvas is available on Railway.');
}

module.exports = {
    isAvailable: () => canvasAvailable,
    getCanvas: () => canvas
};
