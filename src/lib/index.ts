// place files you want to import through the `$lib` alias in this folder.

// Convert a base64 string to a File object
export function base64ToFile(base64: string, filename: string): File {
	const [header, data] = base64.split(',');
	const mime = header.match(/:(.*?);/)[1];
	const binary = atob(data);
	const array = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		array[i] = binary.charCodeAt(i);
	}
	return new File([array], filename, { type: mime });
}
