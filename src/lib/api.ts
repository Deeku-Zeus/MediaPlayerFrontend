// src/lib/api.ts
const API_URL = 'http://api.awesomemediaplayer.local';
const ECOM_API_URL = 'http://api.ecom.local';

// image upload from ui
export async function uploadImage(imageFile: File, queryParams: unknown): Promise<Response> {
	const { videoName, timestamp, username, profile_name, image_name } = queryParams;
	//const imageFileBase64 = await fileToBase64(imageFile);
	const formData = new FormData();
	// let payload = {
	// 	videoName: videoName,
	// 	timestamp: timestamp,
	// 	username: timestamp,
	// 	profile_name: timestamp,
	// 	image: imageFileBase64
	// };
	//console.log(imageFile);

	let filename = 'test.png';
	if (image_name) {
		filename = image_name;
	}

	formData.append('image', imageFile, filename);
	//formData.append('file', imageFile);
	if (videoName) {
		formData.append('videoName', videoName);
	}
	if (timestamp) {
		formData.append('timestamp', timestamp);
	}
	if (username) {
		formData.append('username', username);
	}
	if (profile_name) {
		formData.append('profile_name', profile_name);
	}

	const response = await fetch(`${API_URL}/api/v1/get/imageAnalyzer`, {
		method: 'POST',
		body: formData,
		redirect: 'follow'
	});

	if (!response.ok) {
		throw new Error('Failed to upload image');
	}
	const responseData = await response.json();
	return responseData;
}

// get analysed data of image
export async function getAnalysedImageData(
	request_token: string,
	uid: string[] = []
): Promise<Response> {
	const formData = new FormData();
	if (request_token) {
		formData.append('request_token', request_token);
	}

	if (uid.length > 0) {
		formData.append('uid', uid.join(','));
	}

	const response = await fetch(`${API_URL}/api/v1/get/getDetectionResponse`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('Failed to check if image is analysed');
	}
	const responseData = await response.json();
	return responseData;
}
