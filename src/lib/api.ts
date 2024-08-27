// src/lib/api.ts
const API_URL = 'http://api.awesomemediaplayer.local';

// image upload from ui
export async function uploadImage(imageFile: File, queryParams: unknown): Promise<Response> {
	const { videoName, timestamp, username, profile_name } = queryParams;
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

	formData.append('image', imageFile, 'test123.png');
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

	return response;
}
