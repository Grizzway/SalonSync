import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set('user', '', { expires: new Date(0), path: '/' });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Logout Error:', error);
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }
}
