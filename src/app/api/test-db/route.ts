import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    return new Response(
      JSON.stringify({ success: true, message: 'Database connected successfully!' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database connection failed', error }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}