<script>
    import VideoPlayer from '../components/VideoPlayer.svelte';
  
    const videoUrl = 'https://www.youtube.com/watch?v=G9eyLf7Eh9I';
  </script>
  
  <main class="p-8">
    <h1 class="text-3xl font-bold mb-6">My Video Player</h1>
    <VideoPlayer videoUrl={videoUrl} title="A Sample Video" />
  </main>