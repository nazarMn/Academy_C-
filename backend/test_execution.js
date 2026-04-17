const { runCode } = require('./src/services/execution/execution.service');
const { isWindows } = require('./src/services/sandbox.service');

async function test() {
  console.log('--- Testing C++ ---');
  const cpp = await runCode('#include <iostream>\nint main(){ std::cout<<"Hello C++"; return 0; }', '', 'cpp');
  console.log(cpp);

  console.log('--- Testing Python ---');
  // Need to make sure python works on Windows or Linux
  const py = await runCode('print("Hello from Python")\n', '', 'python');
  console.log(py);

  console.log('--- Testing JS ---');
  const js = await runCode('console.log("Hello from JS");', '', 'javascript');
  console.log(js);

  console.log('--- Testing Infinite Loop (JS) ---');
  const loop = await runCode('while(true){}', '', 'javascript');
  console.log(loop);
}

test().catch(console.error);
