const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const workDir = path.join(__dirname, 'temp_test');
const sourceFile = path.join(workDir, 'test.cpp');
const binaryFile = path.join(workDir, 'test_bin');

if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir);
}

fs.writeFileSync(sourceFile, '#include <iostream>\nint main() { std::cout << "Hello C++" << std::endl; return 0; }');

console.log('Compiling...');
exec(`g++ ${sourceFile} -o ${binaryFile}`, (err, stdout, stderr) => {
    if (err) {
        console.error('Compilation failed:', err);
        console.error('Stderr:', stderr);
        return;
    }
    console.log('Compilation successful.');
    console.log('Running...');
    exec(`${binaryFile}`, (err, stdout, stderr) => {
        if (err) {
            console.error('Execution failed:', err);
            console.error('Stderr:', stderr);
            return;
        }
        console.log('Output:', stdout.trim());

        // Cleanup
        fs.rmSync(workDir, { recursive: true, force: true });
    });
});
