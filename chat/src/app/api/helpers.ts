import { JWT, getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

type Config = {
  params: any;
};

type RouteHandler = (
  request: NextRequest,
  token: JWT,
  config: Config,
) => Promise<NextResponse | Response> | NextResponse | Response;

function withAuth(routeHandler: RouteHandler) {
  return async (request: NextRequest, config: Config) => {
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json(
        { error: 'Not Authenticated' },
        {
          status: 401,
        },
      );
    }

    return routeHandler(request, token, config);
  };
}

export { withAuth };
