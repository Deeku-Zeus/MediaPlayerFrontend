<script lang=ts>
import VideoPlayer from "./VideoPlayer.svelte";

  let relatedVideos = [
    { title: 'Related Video 1', url: '#', thumbnail: 'https://via.placeholder.com/120x90' },
    { title: 'Related Video 2', url: '#', thumbnail: 'https://via.placeholder.com/120x90' },
    { title: 'Related Video 3', url: '#', thumbnail: 'https://via.placeholder.com/120x90' },
  ];
</script>
<div class="flex flex-col lg:flex-row p-4 space-y-4 lg:space-y-0 lg:space-x-4">
    <!-- Main Video Section -->
    <VideoPlayer />
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