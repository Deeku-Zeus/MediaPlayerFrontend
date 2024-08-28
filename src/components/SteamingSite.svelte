<script lang="ts">
	import VideoPlayer from '@components/VideoPlayer2.svelte';
	import { uploadImage } from '@lib/api';

	let relatedVideos = [
		{ title: 'Related Video 1', url: '#', thumbnail: 'https://via.placeholder.com/120x90' },
		{ title: 'Related Video 2', url: '#', thumbnail: 'https://via.placeholder.com/120x90' },
		{ title: 'Related Video 3', url: '#', thumbnail: 'https://via.placeholder.com/120x90' }
	];

	const profile_name: string = 'Deeku';
	const username: string = 'DeekuZeus';
	let uploadStatus = '';

	async function sendImageBackend(event: any) {
		let response: any = [];
		const { videoDimentions, box, image, videoName, timestamp } = event.detail;
		console.log('sendImageBackend');
		console.log(image);
		let imageName = videoName.split(' ').join('-') + '_' + timestamp + '_' + username + '.png';

		try {
			uploadStatus = 'Uploading...';
			console.log(imageName);
			response = await uploadImage(image, {
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

	$: console.log(uploadStatus);
</script>

<!-- Main Video Section -->
<VideoPlayer on:crop={sendImageBackend} />
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
