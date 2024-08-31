<script lang="ts">
	// Dummy data for the product
	export let product = {
		productName: 'Awesome Product',
		productDescription:
			'This is a great product that has many fantastic features. It is built with the highest quality materials and designed to last.',
		price: 99.99,
		imagePath: 'https://via.placeholder.com/400x300?text=Product+Image'
	};

	const ECOM_API_URL = 'http://api.ecom.local/storage';
	$: console.log(product);
</script>

<div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
	<div class="flex flex-col md:flex-row">
		<!-- Product Image -->
		<div class="md:w-1/2 flex items-center justify-center">
			<!-- svelte-ignore a11y-img-redundant-alt -->
			<div class="relative w-full" style="padding-top: 75%;">
				<img
					src={`${ECOM_API_URL}/${product.imagePath}`}
					alt="Product Image"
					class="absolute inset-0 w-full h-full object-cover rounded-lg"
				/>
			</div>
		</div>

		<!-- Product Details -->
		<div class="md:w-1/2 md:pl-6 mt-6 md:mt-0">
			<h1 class="text-3xl font-bold mb-2">{product.productName}</h1>
			<p class="text-lg text-gray-700 mb-4">{product.productDescription}</p>
			<p class="text-xl font-semibold mb-4">Price: ₹ {product.price}</p>

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
