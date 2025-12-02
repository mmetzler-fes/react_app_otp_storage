const CryptoJS = require('crypto-js');
const OTPAuth = require('otpauth');

const encryptData = (data, key) => {
	return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (ciphertext, key) => {
	const bytes = CryptoJS.AES.decrypt(ciphertext, key);
	const originalText = bytes.toString(CryptoJS.enc.Utf8);
	if (!originalText) {
		throw new Error('Decryption failed');
	}
	return originalText;
};

const hashPassword = (password) => {
	return CryptoJS.SHA256(password).toString();
};

async function test() {
	console.log('--- Testing Crypto Logic ---');
	const masterPassword = 'superSecretMasterPassword';
	const accessPassword = 'myAccessPassword';

	// Test 1: Encrypt/Decrypt Master Password with Access Password
	console.log('Test 1: Encrypt/Decrypt Master Password');
	const encryptedMP = encryptData(masterPassword, accessPassword);
	console.log('Encrypted MP:', encryptedMP);

	try {
		const decryptedMP = decryptData(encryptedMP, accessPassword);
		console.log('Decrypted MP:', decryptedMP);
		if (decryptedMP === masterPassword) {
			console.log('PASS: Master Password decrypted correctly');
		} else {
			console.error('FAIL: Master Password mismatch');
		}
	} catch (e) {
		console.error('FAIL: Decryption threw error', e);
	}

	// Test 2: Wrong Password
	console.log('\nTest 2: Wrong Password');
	try {
		decryptData(encryptedMP, 'wrongPassword');
		console.error('FAIL: Should have thrown error');
	} catch (e) {
		console.log('PASS: Threw error as expected');
	}

	// Test 3: OTP Generation
	console.log('\n--- Testing OTP Logic ---');
	const secret = 'NB2HI4DTHIXS633P'; // Base32 secret
	const totp = new OTPAuth.TOTP({
		secret: OTPAuth.Secret.fromBase32(secret),
		algorithm: 'SHA1',
		digits: 6,
		period: 30,
	});

	const token = totp.generate();
	console.log('Generated Token:', token);
	if (token && token.length === 6) {
		console.log('PASS: Token generated');
	} else {
		console.error('FAIL: Token generation failed');
	}
}

test();
