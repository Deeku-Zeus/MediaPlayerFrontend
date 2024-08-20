<script lang="ts">
	let videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
	let videoTitle = 'Sample Video Title';
	let videoDescription = 'This is a sample description for the video player.';
</script>

<div class="flex-1">
	<div class="aspect-w-16 aspect-h-9 bg-black">
		<video controls class="w-full h-full">
			<source src={videoUrl} type="video/mp4" />
			<track kind="captions" src="captions.vtt" srclang="en" label="English" />
			Your browser does not support the video tag.
		</video>
	</div>
	<div class="mt-4">
		<h1 class="text-xl font-semibold">{videoTitle}</h1>
		<p class="text-gray-600 mt-2">{videoDescription}</p>
	</div>
</div>

<style lang="postcss">
</style>
