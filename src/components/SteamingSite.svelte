<script lang="ts">
	import VideoPlayer from '@components/VideoPlayer2.svelte';
	import { uploadImage, getAnalysedImageData } from '@lib/api';

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
		const maxAttempts = 5; // Maximum number of attempts
		const delayMs = 1000; // Delay in milliseconds

		try {
			while (!gotAnalysedImageData && attempts < maxAttempts) {
				analysedImageResponse = await getAnalysedImageData(request_token);
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

	// Function to delay execution for a given amount of time
	function delay(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// Reactive statement to trigger checkImageProcessed when imageUploadResponse is set
	$: if (imageUploadResponse) {
		checkImageProcessed();
	}

	$: console.log(uploadStatus);
</script>

<!-- Main Video Section -->
<VideoPlayer
	on:crop={async (e) => {
		await sendImageBackend(e);
	}}
	bind:analysedImageResponse={analysedImageResponseData}
/>
<div class="flex flex-row lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-4">
	<!-- Related Videos Sidebar -->
	<div class="w-full lg:w-1/3">
		<h2 class="text-lg font-semibold mb-4">Related Videos</h2>
		<ul class="space-y-4">
			{#each relatedVideos as video}
				<li class="flex space-x-4">
					<img src={video.thumbnail} alt={video.title} class="w-24 h-16 object-cover" />
					<div>
						<a href={video.url} class="text-sm font-medium hover:underline">{video.title}</a>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>
