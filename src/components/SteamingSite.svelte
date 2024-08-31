<script lang="ts">
	import VideoPlayer from '@components/VideoPlayer2.svelte';
	import {
		uploadImage,
		fetchAnalysedImageData,
		fetchEcomProducts,
		fetchResponseHistory,
		updateAnalysedImageData
	} from '@lib/api';
	import EcomSite from '@components/EcomSite.svelte';
	import { selectedProduct } from '@src/stores/index';

	let relatedVideos = [
		{ title: 'Related Video 1', url: '#', thumbnail: 'https://via.placeholder.com/120x90' },
		{ title: 'Related Video 2', url: '#', thumbnail: 'https://via.placeholder.com/120x90' },
		{ title: 'Related Video 3', url: '#', thumbnail: 'https://via.placeholder.com/120x90' }
	];

	const profile_name: string = 'Deeku';
	const username: string = 'DeekuZeus';
	let uploadStatus = '';
	let imageUploadResponse: any = [];
	let analysedImageResponse: any = [];
	let analysedImageResponseData: any = [];
	let productListResponseData: any = [];
	let showEcomDetail = false;
	let productIndex: number;

	async function sendImageBackend(event: any) {
		const { videoDimentions, box, image, videoName, timestamp } = event.detail;
		uploadStatus = '';
		console.log('sendImageBackend');
		console.log(image);
		let imageName = videoName.split(' ').join('-') + '_' + timestamp + '_' + username + '.png';

		try {
			uploadStatus = 'Uploading...';
			console.log(imageName);
			imageUploadResponse = await uploadImage(image, {
				videoName,
				timestamp,
				username,
				profile_name,
				image_name: imageName
			});
			uploadStatus = 'Upload successful!';
		} catch (error) {
			console.error(error);
			uploadStatus = 'Upload failed!';
		}
	}

	async function checkImageProcessed() {
		console.log('checkImageProcessed');
		const { request_token } = imageUploadResponse;
		console.log('request_token ', request_token);
		if (!request_token) {
			return;
		}
		uploadStatus = '';
		let gotAnalysedImageData = false;
		let attempts = 0;
		const maxAttempts = 10; // Maximum number of attempts
		const delayMs = 500; // Delay in milliseconds

		try {
			while (!gotAnalysedImageData && attempts < maxAttempts) {
				analysedImageResponse = await fetchAnalysedImageData(request_token);
				gotAnalysedImageData = analysedImageResponse.result;
				analysedImageResponseData = analysedImageResponse.data?.analyzed_response ?? [];
				if (!gotAnalysedImageData) {
					attempts++;
					await delay(delayMs); // Wait for 500 ms before the next attempt
				}
			}

			if (gotAnalysedImageData) {
				console.log('analysedImageResponse:', analysedImageResponse);
				uploadStatus = 'image analysed';
			} else {
				uploadStatus = 'image analysis failed after maximum attempts';
			}
		} catch (error) {
			console.error(error);
			uploadStatus = 'image analysis failed!';
		}
	}

	async function fetchProductList(event: any) {
		const { uid, color, tags } = event.detail;
		//fetchEcomProducts();
		console.log('fetchProductList');
		// let attempts = 0;
		// const maxAttempts = 10; // Maximum number of attempts
		// const delayMs = 500; // Delay in milliseconds
		let response: any = [];

		try {
			//while (attempts < maxAttempts) {
			response = await fetchEcomProducts(color, tags);
			// 	if (!response) {
			// 		attempts++;
			// 		await delay(delayMs); // Wait for 500 ms before the next attempt
			// 	}
			// }
			productListResponseData = { uid, ...response };
			if (response) {
				console.log('fetchEcomProductsResponse:', response);
			}

			selectedProduct.set(response.data);
			// else {
			// 	console.log('fetchEcomProducts API failed after maximum attempts');
			// }
		} catch (error) {
			console.error(error);
			console.log('fetchEcomProducts failed!');
		}
	}

	async function fetchImageHistory(event: any) {
		const { videoName, page } = event.detail;
		console.log('fetchImageHistory');
		let response: any = [];

		try {
			response = await fetchResponseHistory(videoName, page);
			if (response) {
				console.log('fetchResponseHistory:', response);
			}
		} catch (error) {
			console.error(error);
			console.log('fetchResponseHistory failed!');
		}
	}

	// function to update result of analyses
	async function updateMLResponse(event: any) {
		const { uid, color, tags } = event.detail;
		console.log('updateMLResponse');
		let response: any = [];

		try {
			response = await updateAnalysedImageData(uid, { color: color, category: tags });
			if (response) {
				console.log('updateAnalysedImageData:', response);
			}
		} catch (error) {
			console.error(error);
			console.log('updateAnalysedImageData failed!');
		}
	}

	// Function to delay execution for a given amount of time
	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Reactive statement to trigger checkImageProcessed when imageUploadResponse is set
	$: if (imageUploadResponse) {
		checkImageProcessed();
	}

	$: console.log(uploadStatus);

	$: console.log('$selectedProduct ', $selectedProduct);
</script>

<!-- Main Video Section -->
<VideoPlayer
	on:crop={async (e) => {
		await sendImageBackend(e);
	}}
	on:search={fetchProductList}
	on:history={fetchImageHistory}
	on:update={updateMLResponse}
	analysedImageResponse={analysedImageResponseData}
	{productListResponseData}
	bind:showEcomDetail
	bind:productIndex
/>
{#if showEcomDetail}
	<EcomSite product={$selectedProduct[productIndex]} />
{/if}
