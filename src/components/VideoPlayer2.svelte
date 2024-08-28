<script lang="ts">
	import { onMount } from 'svelte';
	import { base64ToFile } from '@lib/index';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	const videoUrl = '../../static/sampleVideos/';
	let videoElement: HTMLVideoElement | null = null;
	let isPlaying = false;
	let isMuted = false;
	let volume = 1;
	let isFullscreen = false;
	let currentTime = 0;
	let duration = 0;
	let isSearchOpen = false;
	let canvasElement: HTMLCanvasElement | null = null;
	export let videoFileName = 'fashion2.mp4';
	export let poster = '../../static/1280x720.png';
	export let videoDescription = 'This is a sample description for the video player.';

	let sampleResponse = [
		{
			obj: {
				confidence: 0.95,
				coordinates: [127, 773, 163, 809],
				uid: 'b0764dcfb39c78f7f8b28568ca960a1caa69d6a53bc9cf41be890c5bdd019058',
				color: 'grey',
				tags: ['shoe']
			}
		},
		{
			obj: {
				confidence: 0.91,
				coordinates: [127, 771, 165, 810],
				uid: '3d262efd1f9e83d30c2ee52d678eae5a2e7fe94b299519d9bdadb29f6f48c8b2',
				color: 'grey',
				tags: ['shoe']
			}
		},
		{
			obj: {
				confidence: 0.63,
				coordinates: [162, 90, 237, 364],
				uid: '240d6b3717c10062bf80c457ba7371da663d498095fd1efe3ca8a512c2bcbdf4',
				color: 'grey',
				tags: ['shirt', 'blouse']
			}
		},
		{
			obj: {
				confidence: 0.56,
				coordinates: [155, 23, 242, 57],
				uid: '4b92a6dfcfc2f8dd2e015f483bf9e05ad8f2ec14afdf3bea4e4d0cd3732f6e29',
				color: 'grey',
				tags: ['glasses']
			}
		},
		{
			obj: {
				confidence: 1.0,
				coordinates: [199, 699, 239, 793],
				uid: '290d2def5b17e240f881d2a554e0f27c6a6bc8a691f9dbf35d6b9daf31acce9c',
				color: 'grey',
				tags: ['shoe']
			}
		}
	];

	// Crop variables
	let isCropping = false;
	let cropStartX = 0;
	let cropStartY = 0;
	let cropEndX = 0;
	let cropEndY = 0;
	let cropImage = '';
	let croppedImageFile: File | null = null;
	let croppedImageUrl: string | null = null;
	let isDragging = false;

	function handleKeydown(event: KeyboardEvent) {
		if (event.code === 'Space') {
			event.preventDefault();
			togglePlayPause();
		}
	}

	function togglePlayPause() {
		if (videoElement) {
			if (videoElement.paused) {
				videoElement.play();
				isPlaying = true;
			} else {
				videoElement.pause();
				isPlaying = false;
			}
		}
	}

	function toggleMute() {
		if (videoElement) {
			videoElement.muted = !videoElement.muted;
			isMuted = videoElement.muted;
		}
	}

	// function toggleFullscreen() {
	// 	if (videoElement) {
	// 		if (!document.fullscreenElement) {
	// 			videoElement.requestFullscreen();
	// 			isFullscreen = true;
	// 		} else {
	// 			document.exitFullscreen();
	// 			isFullscreen = false;
	// 		}
	// 	}
	// }

	function updateProgress() {
		if (videoElement) {
			currentTime = videoElement.currentTime;
		}
	}

	function seekVideo(event: MouseEvent) {
		if (videoElement) {
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			const offsetX = event.clientX - rect.left; // Click position within the progress bar
			const width = rect.width; // Width of the progress bar

			// Calculate the new time based on the click position
			const newTime = (offsetX / width) * duration;

			// Set the video currentTime
			videoElement.currentTime = Math.max(0, Math.min(duration, newTime));

			console.log(
				JSON.stringify(
					`{offsetX: ${offsetX}, width: ${width}, videoElement.currentTime: ${videoElement.currentTime}, newTime: ${newTime}}`
				)
			);
		}
	}

	let isDraggingVideoProgressBar = false;

	function startDraggingProgressBar(event: MouseEvent) {
		isDraggingVideoProgressBar = true;
		seekVideo(event);
	}

	function onDragProgressBar(event: MouseEvent) {
		if (isDraggingVideoProgressBar) {
			seekVideo(event);
		}
	}

	function stopDraggingProgressBar() {
		isDraggingVideoProgressBar = false;
	}

	// function toggleSearchPanel() {
	// 	isSearchOpen = !isSearchOpen;
	// }

	function handleCroppedImage() {
		const croppedImageBase64 = getCroppedImage(); // Assuming this is the function returning the base64 data URL
		croppedImageFile = base64ToFile(croppedImageBase64, 'cropped-image.png');

		// Create a URL for the File object
		if (croppedImageFile) {
			croppedImageUrl = URL.createObjectURL(croppedImageFile);
		}
	}

	function enterCropMode() {
		if (videoElement && !isCropping) {
			videoElement.pause();
			isCropping = true; // Enable crop mode
		}
	}

	function handleCropMouseDown(event: MouseEvent) {
		if (isCropping) {
			isDragging = true;
			const rect = videoElement!.getBoundingClientRect();
			cropStartX = event.clientX - rect.left;
			cropStartY = event.clientY - rect.top;
			cropEndX = cropStartX;
			cropEndY = cropStartY;
		}
	}

	function handleCropMouseMove(event: MouseEvent) {
		if (isCropping && isDragging) {
			const rect = videoElement!.getBoundingClientRect();
			cropEndX = event.clientX - rect.left;
			cropEndY = event.clientY - rect.top;
		}
	}

	function handleCropMouseUp() {
		if (isCropping && isDragging) {
			isDragging = false;
			//captureCroppedImage(); // Capture the cropped image
			prepareDatatoSearchCrop();
			isCropping = false; // Exit crop mode
		}
	}

	function captureCroppedImage() {
		if (canvasElement && videoElement) {
			const context = canvasElement.getContext('2d');
			if (context) {
				const videoRect = videoElement.getBoundingClientRect();
				const canvasRect = canvasElement.getBoundingClientRect();

				const videoWidth = videoElement.videoWidth;
				const videoHeight = videoElement.videoHeight;

				const cropX = (cropStartX / videoRect.width) * videoWidth;
				const cropY = (cropStartY / videoRect.height) * videoHeight;
				const cropWidth = (Math.abs(cropEndX - cropStartX) / videoRect.width) * videoWidth;
				const cropHeight = (Math.abs(cropEndY - cropStartY) / videoRect.height) * videoHeight;

				canvasElement.width = cropWidth;
				canvasElement.height = cropHeight;

				context.drawImage(
					videoElement,
					cropX,
					cropY,
					cropWidth,
					cropHeight,
					0,
					0,
					cropWidth,
					cropHeight
				);

				cropImage = canvasElement.toDataURL('image/png');
			}
		}
	}

	function getCroppedImage() {
		return cropImage;
	}

	function handleClickOutside(event: MouseEvent) {
		const searchPanel = document.querySelector('.search-panel');
		const searchButton = event.target as HTMLElement;

		if (
			isSearchOpen &&
			searchPanel &&
			!searchPanel.contains(event.target as Node) &&
			!searchButton.closest('.search-btn')
		) {
			isSearchOpen = false;
		}
	}

	function prepareDatatoSearchCrop() {
		captureCroppedImage(); // Capture the cropped image
		handleCroppedImage(); // make image to File
		let data = {
			videoDimentions: [videoElement?.videoWidth, videoElement?.videoHeight],
			box: [cropStartX, cropStartY, cropEndX, cropEndY],
			image: croppedImageFile,
			videoName: videoFileName.split('.')[0],
			timestamp: currentTime
		};
		dispatch('crop', data);
	}

	onMount(() => {
		if (videoElement) {
			duration = videoElement.duration;
			videoElement.volume = volume;
			document.addEventListener('keydown', handleKeydown);
			document.addEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="relative max-w-5xl mx-auto bg-black">
	<!-- Video Element -->
	<!-- svelte-ignore a11y-media-has-caption -->
	<video
		bind:this={videoElement}
		class="w-full h-auto"
		on:timeupdate={updateProgress}
		on:loadedmetadata={() => (duration = videoElement?.duration || 0)}
		on:click={togglePlayPause}
		{poster}
		controls={false}
	>
		<source src={videoUrl + videoFileName} type="video/mp4" />
		Your browser does not support the video tag.
	</video>

	<!-- Cropping Overlay -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	{#if isCropping}
		<div
			class="absolute inset-0 cropping-overlay"
			on:mousedown={handleCropMouseDown}
			on:mousemove={handleCropMouseMove}
			on:mouseup={handleCropMouseUp}
		>
			{#if isCropping && isDragging}
				<div
					class="absolute border-2 border-red-500"
					style="left: {Math.min(cropStartX, cropEndX)}px; top: {Math.min(
						cropStartY,
						cropEndY
					)}px; width: {Math.abs(cropEndX - cropStartX)}px; height: {Math.abs(
						cropEndY - cropStartY
					)}px;"
				></div>
			{/if}
		</div>
	{/if}

	<!-- Custom Controls -->
	<div
		class="absolute bottom-0 left-0 w-full p-4 bg-opacity-75 bg-black flex items-center justify-between space-x-4 text-white"
		class:fullscreen={isFullscreen}
	>
		<!-- Play/Pause Button -->
		<button on:click={togglePlayPause} class="text-3xl">
			{#if isPlaying}
				<i class="fas fa-pause"></i>
			{:else}
				<i class="fas fa-play"></i>
			{/if}
		</button>

		<!-- Progress Bar -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="flex-grow mx-4 cursor-pointer"
			on:mousedown={startDraggingProgressBar}
			on:mousemove={onDragProgressBar}
			on:mouseup={stopDraggingProgressBar}
			on:mouseleave={stopDraggingProgressBar}
			on:click={seekVideo}
		>
			<div class="relative w-full h-2 bg-gray-600 rounded">
				<div
					class="absolute top-0 left-0 h-full bg-red-500 rounded"
					style="width: {Math.min((currentTime / duration) * 100, 100)}%"
				></div>
			</div>
		</div>

		<!-- Volume/Mute Button -->
		<button on:click={toggleMute} class="text-2xl">
			{#if isMuted}
				<i class="fas fa-volume-mute"></i>
			{:else}
				<i class="fas fa-volume-up"></i>
			{/if}
		</button>

		<!-- Fullscreen Button -->
		<!-- <button on:click={toggleFullscreen} class="text-2xl">
			{#if isFullscreen}
				<i class="fas fa-compress"></i>
			{:else}
				<i class="fas fa-expand"></i>
			{/if}
		</button> -->

		<!-- Crop Button -->
		<button on:click={enterCropMode} class="text-2xl">
			<i class="fas fa-crop-alt"></i>
		</button>

		<!-- Search Button -->
		<button
			on:click={() => {
				isSearchOpen = !isSearchOpen;
				// const image = getCroppedImage();
				// let file = base64ToFile(image, 'crop.png');
				// console.log(file);
			}}
			class="text-2xl search-btn"
		>
			<i class="fas fa-search"></i>
		</button>

		<!-- Filter Button -->
		<button
			on:click={() => {
				console.log('general / fashion');
			}}
			class="text-2xl"
		>
			<i class="fas fa-filter"></i>
		</button>
	</div>

	<!-- Search Panel (side navigation) -->
	{#if isSearchOpen}
		<div
			class="absolute top-0 right-0 w-64 h-full bg-gray-800 text-white p-4 overflow-y-auto z-10 search-panel opacity-70 hover:opacity-100"
		>
			<div class="sticky top-0 bg-gray-900 p-2 flex justify-between items-center opacity-100">
				<h3 class="text-lg font-semibold">Item List</h3>
				<button on:click={() => (isSearchOpen = false)} class="text-xl">
					<i class="fas fa-times"></i>
					<!-- Font Awesome Close Icon -->
				</button>
			</div>
			<div class="space-y-4">
				{#each sampleResponse as { obj }, i}
					<div class="p-2 bg-gray-700 rounded h-40 break-words overflow-x-hidden overflow-y-scroll">
						<!-- <code>{JSON.stringify(obj)}</code> -->
						<div>{obj['tags']}</div>
						<p>Results:</p>
						<br />
						<a class="text-blue-500" href="/ecom" target="_blank">Product Site</a>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Hidden Canvas for Capturing Cropped Image -->
	<canvas bind:this={canvasElement} class="hidden"></canvas>
</div>
<div class="mt-10 text-lg font-semibold">{videoDescription}</div>

<!-- Button to trigger the conversion and display -->
<button on:click={handleCroppedImage}>show Cropped Image</button>

<!-- Display the cropped image -->
{#if croppedImageUrl}
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img class="h-full w-full" src={croppedImageUrl} alt="Cropped Image" />
{/if}

<style lang="postcss">
	.fullscreen {
		width: 100vw;
		height: 100vh;
	}

	/* video.fullscreen {
		width: 100%;
		height: auto;
	} */

	.fullscreen .absolute {
		bottom: 5%;
	}

	.cropping-overlay {
		background-color: rgba(0, 0, 0, 0.5);
		cursor: crosshair;
		z-index: 10;
	}
	.cropping-overlay.hidden {
		display: none;
	}

	.progress-bar-container {
		position: relative;
		width: 100%;
		height: 2px;
		background-color: gray;
	}

	.progress-bar-filled {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background-color: red;
	}
</style>
