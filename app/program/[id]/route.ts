function redirectToProgram(request: Request) {
  return Response.redirect(new URL('/#program', request.url), 308);
}

export function GET(request: Request) {
  return redirectToProgram(request);
}

export function HEAD(request: Request) {
  return redirectToProgram(request);
}
