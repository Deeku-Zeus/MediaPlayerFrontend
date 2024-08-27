<script lang="ts">
	import { onMount } from 'svelte';
	import { base64ToFile } from '../lib/index';

	let videoElement: HTMLVideoElement | null = null;
	let isPlaying = false;
	let isMuted = false;
	let volume = 1;
	let isFullscreen = false;
	let currentTime = 0;
	let duration = 0;
	let isSearchOpen = false; // To track search panel open/close
	let canvasElement: HTMLCanvasElement | null = null;
	let videoUrl = '../../static/sampleVideos/fashion.mp4';
	let poster = '../../static/1280x720.png';

	// onMount(() => {

	// });

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

	function toggleFullscreen() {
		if (videoElement) {
			if (!document.fullscreenElement) {
				videoElement.requestFullscreen();
				isFullscreen = true;
			} else {
				document.exitFullscreen();
				isFullscreen = false;
			}
		}
	}

	function updateProgress() {
		if (videoElement) {
			currentTime = videoElement.currentTime;
		}
	}

	function seekVideo(event: MouseEvent) {
		if (videoElement) {
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			const offsetX = event.clientX - rect.left;
			const width = rect.width;
			const newTime = (offsetX / width) * duration;
			videoElement.currentTime = newTime;
		}
	}

	function toggleSearchPanel() {
		isSearchOpen = !isSearchOpen;
	}

	// crop logic
	let isCropping = false;
	let cropStartX = 0;
	let cropStartY = 0;
	let cropEndX = 0;
	let cropEndY = 0;
	let cropImage = '';
	let croppedImageFile: File | null = null;
	let croppedImageUrl: string | null = null;

	// Function to handle conversion and display
	function handleCroppedImage() {
		const croppedImageBase64 = getCroppedImage(); // Assuming this is the function returning the base64 data URL
		croppedImageFile = base64ToFile(croppedImageBase64, 'cropped-image.png');

		// Create a URL for the File object
		if (croppedImageFile) {
			croppedImageUrl = URL.createObjectURL(croppedImageFile);
		}
	}

	function enterCropMode() {
		if (videoElement) {
			videoElement.pause();
			isCropping = true;
		}
	}

	function handleCropMouseDown(event: MouseEvent) {
		if (isCropping) {
			const rect = videoElement!.getBoundingClientRect();
			cropStartX = event.clientX - rect.left;
			cropStartY = event.clientY - rect.top;
		}
	}

	function handleCropMouseMove(event: MouseEvent) {
		if (isCropping) {
			const rect = videoElement!.getBoundingClientRect();
			cropEndX = event.clientX - rect.left;
			cropEndY = event.clientY - rect.top;
		}
	}

	function handleCropMouseUp() {
		if (isCropping) {
			captureCroppedImage();
			isCropping = false;
		}
	}

	function captureCroppedImage() {
		if (canvasElement && videoElement) {
			const context = canvasElement.getContext('2d');
			if (context) {
				const width = Math.abs(cropEndX - cropStartX);
				const height = Math.abs(cropEndY - cropStartY);
				const x = Math.min(cropStartX, cropEndX);
				const y = Math.min(cropStartY, cropEndY);

				canvasElement.width = width;
				canvasElement.height = height;
				context.drawImage(videoElement, x, y, width, height, 0, 0, width, height);

				cropImage = canvasElement.toDataURL('image/png');
			}
		}
	}

	function getCroppedImage() {
		return cropImage;
	}

	onMount(() => {
		if (videoElement) {
			duration = videoElement.duration;
			videoElement.volume = volume;
			document.addEventListener('keydown', handleKeydown);
			document.addEventListener('click', handleClickOutside);
		}
	});

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
		<source src={videoUrl} type="video/mp4" />
		Your browser does not support the video tag.
	</video>

	<!-- Cropping Overlay -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		class="absolute inset-0 cropping-overlay hidden"
		on:mousedown={handleCropMouseDown}
		on:mousemove={handleCropMouseMove}
		on:mouseup={handleCropMouseUp}
		class:hidden={!isCropping}
	></div>

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
		<div class="flex-grow mx-4 cursor-pointer" on:click={seekVideo}>
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
			<!-- Font Awesome Crop Icon -->
		</button>

		<!-- Search Button -->
		<button
			on:click={() => {
				isSearchOpen = !isSearchOpen;
				const image = getCroppedImage();
				let file = base64ToFile(image, 'crop.png');
				console.log(file);
			}}
			class="text-2xl search-btn"
		>
			<i class="fas fa-search"></i>
		</button>
	</div>

	<!-- Search Panel (side navigation) -->
	{#if isSearchOpen}
		<div
			class="absolute top-0 right-0 w-64 h-full bg-gray-800 text-white p-4 overflow-y-auto z-10 search-panel"
		>
			<h3 class="text-lg font-semibold mb-4">Search Panel</h3>
			<div class="space-y-4">
				<div class="p-2 bg-gray-700 rounded">Item 1</div>
				<div class="p-2 bg-gray-700 rounded">Item 2</div>
				<div class="p-2 bg-gray-700 rounded">Item 3</div>
				<div class="p-2 bg-gray-700 rounded">Item 4</div>
				<div class="p-2 bg-gray-700 rounded">Item 5</div>
			</div>
		</div>
	{/if}

	<!-- Hidden Canvas for Capturing Cropped Image -->
	<canvas bind:this={canvasElement} class="hidden"></canvas>
</div>

<!-- Button to trigger the conversion and display -->
<button on:click={handleCroppedImage}>Display Cropped Image</button>

<!-- Display the cropped image -->
{#if croppedImageUrl}
	<!-- svelte-ignore a11y-img-redundant-alt -->
	<img src={croppedImageUrl} alt="Cropped Image" />
{/if}

<style lang="postcss">
	.fullscreen {
		width: 100vw;
		height: 100vh;
	}

	video.fullscreen {
		width: 100%;
		height: auto;
	}

	.fullscreen .absolute {
		bottom: 5%; /* Keep controls visible at the bottom in fullscreen mode */
	}

	.cropping-overlay {
		background-color: rgba(0, 0, 0, 0.5);
		cursor: crosshair;
		z-index: 10;
	}
	.cropping-overlay.hidden {
		display: none;
	}
</style>
