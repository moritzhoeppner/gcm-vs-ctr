document.addEventListener(
  'DOMContentLoaded',
  function() {
    // Generate a 32 byte (= 256 bit) encryption key and a 12 byte (= 96 bit) IV.
    generateAndDisplayRandomValue(32, 'key');
    generateAndDisplayRandomValue(12, 'iv');

    // Set the first counter block so that the GCM ciphertext can be decrypted.
    document.getElementById('firstCtr').value = document.getElementById('iv').value + '00000002';
    
    document.getElementById('encryptBtn').addEventListener('click', encryptGcm);
    document.getElementById('decryptBtn').addEventListener('click', decryptCtr);
  }
);

function generateAndDisplayRandomValue(bytesCount, domId) {
  const randomValue = new Uint8Array(bytesCount);
  window.crypto.getRandomValues(randomValue);
  document.getElementById(domId).value = bytesToHex(randomValue);
}

async function encryptGcm() {
  const plaintext     = document.getElementById('plaintext').value;
  const plaintextUtf8 = (new TextEncoder()).encode(plaintext);
  const key           = await cryptoKey('AES-GCM');
  const iv            = hexToBytes(document.getElementById('iv').value);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    plaintextUtf8
  );

  document.getElementById('ciphertext').value = bytesToHex(new Uint8Array(ciphertext));
}

async function decryptCtr() {
  const ciphertext = hexToBytes(document.getElementById('ciphertext').value);
  const key        = await cryptoKey('AES-CTR');
  const counter    = hexToBytes(document.getElementById('firstCtr').value);
  const ctrLength  = parseInt(document.getElementById('ctrLen').value) * 8;

  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      counter,
      length: ctrLength
    },
    key,
    ciphertext
  );

  document.getElementById('plaintext').value = (new TextDecoder()).decode(plaintext);
}

function cryptoKey(algName) {
  const rawKey = hexToBytes(document.getElementById('key').value);

  return window.crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: algName },
    false,
    [ 'encrypt', 'decrypt' ]
  );
}

function bytesToHex(bytes) {
  return [...bytes]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex) {
  if (hex.length % 2 !== 0) {
    throw new Error('The length of the hex string must be even.');
  }
  const hexBytes = hex.match(/../g);
  return new Uint8Array(hexBytes.map(hex => parseInt(hex, 16)));
}
