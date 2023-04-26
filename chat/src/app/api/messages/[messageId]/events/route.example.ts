import { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params: _params }: { params: { messageId: string } },
) {
  const transformStream = new TransformStream();
  const writer = transformStream.writable.getWriter();
  const encoder = new TextEncoder();

  const randomNumbers = [...new Array(30).keys()];

  setTimeout(() => {
    randomNumbers.forEach(number => {
      writer.write(encoder.encode(`event: message\n`));
      writer.write(encoder.encode(`id: ${new Date().getTime()}\n`));
      writer.write(encoder.encode(`data: ${number}\n\n`));
    });

    writer.close();
  }, 2000);

  return new Response(transformStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
    status: 200,
  });
}
