<script lang="ts">
	import EcomSite from '@components/EcomSite.svelte';
	import { selectedProduct } from '@src/stores/index';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// Access the 'id' parameter correctly
	const id = $page.params.id;
	let productFound = false;

	const ECOM_API_URL = 'http://api.ecom.local/storage';
	let product = {
		name: 'Awesome Product',
		description:
			'This is a great product that has many fantastic features. It is built with the highest quality materials and designed to last.',
		price: 99.99,
		imageUrl: 'https://via.placeholder.com/400x300?text=Product+Image'
	};

	onMount(() => {
		if ($selectedProduct && $selectedProduct[id]) {
			product = {
				name: $selectedProduct[id].productName,
				description: $selectedProduct[id].productDescription,
				price: $selectedProduct[id].price,
				imageUrl: `${ECOM_API_URL}/${$selectedProduct[id].imagePath}`
			};
		} else {
			console.log('Product not found');
		}
	});
</script>

{#if productFound}
	<EcomSite bind:product />
{:else}
	not yet loaded
{/if}
