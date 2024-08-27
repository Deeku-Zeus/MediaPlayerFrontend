// place files you want to import through the `$lib` alias in this folder.

export function base64ToFile(dataUrl: string, filename: string) {
	// Split the data URL to get the base64 string
	const arr = dataUrl.split(',');
	const mime = arr[0].match(/:(.*?);/)[1]; // Extract MIME type
	const bstr = atob(arr[1]); // Decode base64
	let n = bstr.length;
	const u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}

	// Convert to File object
	return new File([u8arr], filename, { type: mime });
}
