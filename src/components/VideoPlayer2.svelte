<script lang="ts">
	import { onMount } from 'svelte';
	import { base64ToFile } from '@lib/index';
	import { createEventDispatcher } from 'svelte';
	import { selectedProduct } from '@src/stores/index';
	//import { selectedProduct } from '@src/stores/index';
	const dispatch = createEventDispatcher();

	const videoUrl = '../../static/sampleVideos/';
	let videoElement: HTMLVideoElement | null = null;
	let isPlaying = false;
	let isMuted = true;
	let volume = 1;
	let isFullscreen = false;
	let currentTime = 0;
	let duration = 0;
	let isSearchOpen = false;
	let canvasElement: HTMLCanvasElement | null = null;
	let itemPage = 0;
	export let showEcomDetail = true;
	export let productIndex;
	export let videoFileName = 'fashion3.mp4';
	export let poster = '../../static/1280x720.png';
	export let videoDescription =
		'Zendaya’s Ultimate Fashion Evolution: From Red Carpet Glam to Street Style Chic';
	export let analysedImageResponse: any[] = [];
	export let productListResponseData: any[] = [];

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

	function toggleSearchPanel() {
		isSearchOpen = !isSearchOpen;
	}

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
			isPlaying = false;
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

	function handleProductSearch(uid: string, color: string, tags: string[] | []) {
		let data = {
			uid,
			color,
			tags
		};
		dispatch('search', data);
	}

	function handleFetchHistory(videoName: string, page: number) {
		let data = {
			videoName,
			page
		};
		dispatch('history', data);
	}

	function updateItemListWithProductLinks() {
		const { uid, data } = productListResponseData;
		console.log(uid, data);
		let productData = data;
		analysedImageResponse.forEach((item) => {
			if (item.uid === uid) {
				item.links = productData;
			}
		});
		//selectedProduct.set(productData);
	}

	$: if (analysedImageResponse.length > 0) {
		isSearchOpen = true;
	}

	$: productListResponseData, updateItemListWithProductLinks();

	// search nav bar variables
	// let isEditing = false;
	// let tagInput = '';
	// let colorInput = '';
	// let links = ['https://example.com/1', 'https://example.com/2']; // Sample links

	function handleUpdateFields(res: any) {
		let { uid, color, tags, isEditing } = res;
		console.log(uid, color, tags, isEditing);
		if (isEditing) {
			return;
		}
		const data = {
			uid: uid,
			color: color,
			tags: typeof tags == 'string' ? tags.split(',') : tags
		};
		dispatch('update', data);
	}

	onMount(() => {
		if (videoElement) {
			duration = videoElement.duration;
			videoElement.volume = volume;
			document.addEventListener('keydown', handleKeydown);
			document.addEventListener('click', handleClickOutside);
			videoElement.muted = true;
			isMuted = true;
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
					style="width: {Math.min((currentTime / duration) * 100 || 0, 100)}%"
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
				toggleSearchPanel();
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
			class="absolute top-0 right-0 w-64 h-full bg-black text-white p-4 overflow-y-auto z-10 search-panel opacity-70 hover:opacity-100"
		>
			<div class="sticky top-0 bg-gray-900 p-2 flex justify-between items-center opacity-100">
				<h3 class="text-lg font-semibold">Item List</h3>
				<button
					on:click={() => {
						isSearchOpen = false;
					}}
					class="text-xl"
				>
					<i class="fas fa-times"></i>
				</button>
			</div>
			<div class="space-y-4">
				<!-- Fetch History Button -->
				<div class="p-2 bg-gray-700 rounded h-10 text-center">
					<button on:click={() => handleFetchHistory(videoFileName.split('.')[0], ++itemPage)}
						>Fetch History</button
					>
				</div>
				<!-- Loading Spinner -->
				<div
					class:hidden={analysedImageResponse.length > 0}
					class="p-2 bg-gray-700 rounded h-10 text-center"
				>
					<i class="fa-solid fa-spinner animate-spin"></i>
				</div>
				<!-- Editable Tag Section -->
				{#each analysedImageResponse as res}
					<div class="p-2 bg-gray-700 rounded">
						<div class="flex justify-between items-center">
							<div>{typeof res.tags === 'object' ? res.tags.join(',') : res.tags}</div>
							<div class="px-2">
								<button
									on:click={() => {
										if (res.isEditing === undefined) {
											res.isEditing = true;
										} else {
											res.isEditing = !res.isEditing;
										}
										handleUpdateFields(res);
									}}
									class="text-xl"
								>
									<i class={(res.isEditing ?? false) ? 'fas fa-save' : 'fas fa-edit'}></i>
								</button>

								<button
									on:click={() => {
										handleProductSearch(res.uid, res.color, res.tags);
									}}
									class="text-xl ml-2"
								>
									<i class="fas fa-search"></i>
								</button>
							</div>
						</div>
						<!-- Input fields for editing -->
						{#if res.isEditing ?? false}
							<div class="space-y-2 mt-2">
								<input
									type="text"
									bind:value={res.tags}
									placeholder="Edit Tags"
									class="w-full p-2 bg-gray-600 rounded"
								/>
								<input
									type="text"
									bind:value={res.color}
									placeholder="Edit Color"
									class="w-full p-2 bg-gray-600 rounded"
								/>
							</div>
						{/if}
						<!-- <div class="text-center">
							<button
								on:click={() => {
									handleProductSearch(res.color, res.tags);
								}}
							>
								<i class="fas fa-search"></i>
							</button>
						</div> -->
						<!-- Display links -->
						<div class="mt-2 space-y-1">
							{#if res.links ?? false}
								{#each res.links as link, i}
									<button
										class="block text-blue-400 underline"
										on:click={() => {
											showEcomDetail = true;
											productIndex = i;
										}}
									>
										{link?.productName}
									</button>
								{/each}
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Hidden Canvas for Capturing Cropped Image -->
	<canvas bind:this={canvasElement} class="hidden"></canvas>
</div>
<div class="mt-10 mb-2 text-2xl font-semibold">{videoDescription}</div>
<div class="mb-20 text-sm">
	Step into the world of Zendaya’s fashion journey as we explore her most iconic looks! In this
	video, we take a deep dive into Zendaya’s style evolution, showcasing her stunning red carpet
	gowns, effortlessly chic street style, and everything in between. Discover how Zendaya mixes high
	fashion with casual elegance, and get inspired by her bold fashion choices. From dazzling designer
	pieces to off-duty outfits, see how Zendaya continues to set trends and redefine modern fashion.
	Don’t forget to like, comment, and subscribe for more style inspirations!
</div>

<!-- Button to trigger the conversion and display -->
<!-- <button on:click={handleCroppedImage}>Update</button> -->

<!-- Display the cropped image -->
<!-- {#if croppedImageUrl} -->
<!-- svelte-ignore a11y-img-redundant-alt -->
<!-- <img class="h-full w-full" src={croppedImageUrl} alt="Cropped Image" /> -->
<!-- {/if} -->

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

	.carousel-container {
		overflow: hidden;
	}
	.carousel-items {
		display: flex;
		transition: transform 0.3s ease;
	}
	.carousel-item {
		min-width: 100%;
	}
</style>
