<script lang="ts">
	// Dummy data for the product
	let product = {
		name: 'Awesome Product',
		description:
			'This is a great product that has many fantastic features. It is built with the highest quality materials and designed to last.',
		price: 99.99,
		imageUrl: 'https://via.placeholder.com/400x300?text=Product+Image'
	};
</script>

<div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
	<div class="flex flex-col md:flex-row">
		<!-- Product Image -->
		<div class="md:w-1/2">
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<img src={product.imageUrl} alt="Product Image" class="w-full h-auto rounded-lg" />
		</div>

		<!-- Product Details -->
		<div class="md:w-1/2 md:pl-6 mt-6 md:mt-0">
			<h1 class="text-3xl font-bold mb-2">{product.name}</h1>
			<p class="text-lg text-gray-700 mb-4">{product.description}</p>
			<p class="text-xl font-semibold mb-4">Price: ${product.price.toFixed(2)}</p>

			<button
				class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
			>
				Add to Cart
			</button>
		</div>
	</div>
</div>

<style>
	/* Custom styles can go here */
</style>
