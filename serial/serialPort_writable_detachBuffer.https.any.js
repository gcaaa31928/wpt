// META: script=/resources/test-only-api.js
// META: script=/serial/resources/common.js
// META: script=resources/automation.js

function detachBuffer(buffer) {
  window.postMessage('', '*', [buffer]);
}

serial_test(async (t, fake) => {
  const {port, fakePort} = await getFakeSerialPort(fake);
  await port.open({baudRate: 9600, bufferSize: 64});

  const writer = port.writable.getWriter();
  const data = new Uint8Array(64);
  detachBuffer(data.buffer);
  await promise_rejects_dom(t, 'InvalidStateError', writer.write(data));

  await port.close();
}, 'Cannot write a detached buffer');

serial_test(async (t, fake) => {
  const {port, fakePort} = await getFakeSerialPort(fake);
  // Select a buffer size smaller than the amount of data transferred.
  await port.open({baudRate: 9600, bufferSize: 64});

  const writer = port.writable.getWriter();
  const data = new Uint8Array(1024);  // Much larger than bufferSize above.
  const promise = writer.write(data);
  writer.releaseLock();

  detachBuffer(data.buffer);
  await promise_rejects_dom(t, 'InvalidStateError', promise);

  await port.close();
}, 'Write fails if buffer detached while writing');
