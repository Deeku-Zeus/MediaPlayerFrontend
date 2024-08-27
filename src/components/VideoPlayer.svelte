<script lang="ts">
	import path from 'path';
	import {uploadImage} from '../lib/api'
	import { onMount } from 'svelte';
	//let videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
	let videoUrl = '../../static/sampleVideos/fashion.mp4';
	let videoTitle = 'Sample Video Title';
	let videoDescription = 'This is a sample description for the video player.';

	let videoElement: any;
	let isPaused = true;
	let isEyeOpen = true; // State for the eye visibility
	let uploadStatus = ''

	// Rectangle coordinates
	let rectangles = [
		{ x: 10, y: 10, width: 100, height: 50 } // Default center rectangle
	];

	// Function to handle the play event
	function handlePlay() {
		console.log('Video is playing');
		isPaused = false;
	}

	// Function to handle the pause event
	function handlePause() {
		console.log('Video is paused');
		isPaused = true;
		captureScreenshot();
	}

	// Function to handle the end event
	function handleEnded() {
		console.log('Video has ended');
	}

	// Function to handle time update
	function handleTimeUpdate() {
		console.log('Current time: ', videoElement.currentTime);
	}

	// Function to toggle play/pause
	function togglePlayPause() {
		if (videoElement.paused) {
			videoElement.play();
		} else {
			videoElement.pause();
		}
	}

	//let videoElement;
	let canvasElement: any;
	let context: any;
	let screenshotUrl = '';
	let imageFile: File;

	function captureScreenshot() {
		//debugger;
		if (videoElement && videoElement.paused && canvasElement && context) {
			const width = videoElement.videoWidth;
			const height = videoElement.videoHeight;

			// Set canvas dimensions to match the video frame
			canvasElement.width = width;
			canvasElement.height = height;

			try {
				// Draw the current video frame onto the canvas
				context.drawImage(videoElement, 0, 0, width, height);

				// Convert canvas content to a data URL (image)
				screenshotUrl = canvasElement.toDataURL('image/png');

				// Create a Blob from the canvas data
				canvasElement.toBlob((blob: Blob) => {
					if (blob) {
						// Create a File object from the Blob
						imageFile = new File([blob], 'screenshot.png', { type: 'image/png' });
						console.log('File created:', imageFile);
						drawRectangles();
					}
				}, 'image/png');
			} catch (error) {
				console.error('Error capturing screenshot:', error);
			}
		} else {
			console.log('Video is not paused or canvas/context is undefined');
		}
	}

	function drawRectangles() {
		if (canvasElement && context) {
			const width = canvasElement.width;
			const height = canvasElement.height;

			// Draw current screenshot
			const img = new Image();
			img.src = screenshotUrl;
			img.onload = () => {
				context.drawImage(img, 0, 0, width, height);

				// Draw rectangles
				rectangles.forEach((rect) => {
					context.beginPath();
					context.rect(rect.x, rect.y, rect.width, rect.height);
					context.lineWidth = 1;
					context.strokeStyle = 'blue';
					context.stroke();
				});
			};
		} else {
			console.error('Canvas or context is undefined');
		}
	}

	function handleSearch() {
		console.log('Search icon clicked');
		// Implement search functionality
	}

	function handleCrop() {
		console.log('Crop icon clicked');
		// Implement crop functionality
	}

	function toggleEyeVisibility() {
		isEyeOpen = !isEyeOpen;
		console.log(`Eye visibility: ${isEyeOpen ? 'Open' : 'Closed'}`);
		// Implement eye visibility toggle functionality
	}

	async function handleUpload() {
        // if (!selectedFile) {
        //     uploadStatus = 'Please select a file first.';
        //     return;
        // }

		console.log(imageFile)
        try {
            uploadStatus = 'Uploading...';
            const response = await uploadImage(imageFile, { videoName:"Test Video", timestamp:'2024-08-22T10:00:00Z', username:'ecom_user', profile_name:'deeku' });
            uploadStatus = 'Upload successful!';
        } catch (error) {
            console.error(error);
            uploadStatus = 'Upload failed!';
        }
    }

	$:console.log(uploadStatus)

	// Set up the canvas context on component mount
	onMount(() => {
		if (canvasElement) {
			context = canvasElement.getContext('2d');
		}
	});
</script>

<div class="flex-1">
	<div class="aspect-w-16 aspect-h-9 bg-black container">
		<video
			id="video"
			controls
			class="w-full h-full"
			bind:this={videoElement}
			on:play={handlePlay}
			on:pause={handlePause}
			on:ended={handleEnded}
			on:timeupdate={handleTimeUpdate}
		>
			<source src="{videoUrl}" type="video/mp4" />
			<track kind="captions" src="captions.vtt" srclang="en" label="English" />
			Your browser does not support the video tag.
		</video>
	</div>
	<div>
		<div>Canvas</div>
		<canvas bind:this={canvasElement}></canvas>
		<button on:click={handleUpload}>Upload</button>

		<div>image tag</div>
		<!-- <code class="bg-gray">{screenshotUrl}</code> -->
		{#if screenshotUrl}
			<img src={screenshotUrl} alt="Screenshot of video frame" />
		{/if}
	</div>
	<div class="mt-4">
		<h1 class="text-xl font-semibold">{videoTitle}</h1>
		<p class="text-gray-600 mt-2">{videoDescription}</p>
	</div>
</div>

<style lang="postcss">
</style>
