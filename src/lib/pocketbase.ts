import PocketBase from 'pocketbase';

// During development, you can use your VPS IP
// Later, we will replace this with your domain (e.g., https://api.familylavage.ma)
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

export default pb;