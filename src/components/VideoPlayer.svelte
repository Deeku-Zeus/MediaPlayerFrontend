<script>
  export let videoUrl = '';
  export let title = 'Sample Video';
</script>

<div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden mt-8">
  <!-- Video Container -->
  <div class="relative pb-9/16 h-0 overflow-hidden rounded-t-lg">
    <iframe
      class="absolute top-0 left-0 w-full h-full"
      src={videoUrl}
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
      title={title}
    ></iframe>
  </div>
  
  <!-- Video Info -->
  <div class="p-6">
    <h2 class="text-xl font-semibold mb-2">{title}</h2>
    <p class="text-gray-700">This is a description for the video. You can customize this as needed.</p>
  </div>
</div>