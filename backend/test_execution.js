const { runCode, runWithTests } = require('./src/services/execution/execution.service');

async function test() {
  console.log('--- Testing C++ Single Run ---');
  const cpp = await runCode('#include <iostream>\nint main(){ std::cout<<"Hello C++"; return 0; }', '', 'cpp');
  console.log(cpp);

  console.log('--- Testing C++ Multi-Testcase (1x Compile, 3x Run) ---');
  const cppTests = await runWithTests(
    '#include <iostream>\nint main(){ int a, b; if (std::cin >> a >> b) std::cout << (a + b); return 0; }',
    [
      { input: '2 3', expectedOutput: '5' },
      { input: '10 20', expectedOutput: '30' },
      { input: '-5 5', expectedOutput: '0' }
    ],
    'cpp'
  );
  console.log(cppTests);

  console.log('--- Testing Python Multi-Testcase ---');
  const pyTests = await runWithTests(
    'a, b = map(int, input().split())\nprint(a * b)',
    [
      { input: '4 5', expectedOutput: '20' },
      { input: '3 7', expectedOutput: '21' }
    ],
    'python'
  );
  console.log(pyTests);

  console.log('--- Testing JS Multi-Testcase ---');
  const jsTests = await runWithTests(
    'const fs = require("fs"); const input = fs.readFileSync(0, "utf-8").trim().split(" "); console.log(Number(input[0]) + Number(input[1]));',
    [
      { input: '1 2', expectedOutput: '3' },
      { input: '100 200', expectedOutput: '300' }
    ],
    'javascript'
  );
  console.log(jsTests);
}

test().catch(console.error);
